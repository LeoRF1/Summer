const express = require("express");
const router = express.Router();
const { searchPubMed, fetchAbstracts } = require("../services/pubmedService");
const Anthropic = require("@anthropic-ai/sdk");

const buildSystemPrompt = (articles) => {
    const context = articles.map((a, i) =>
        `[${i + 1}] PMID:${a.pmid} (${a.year}) — ${a.title}\n${a.journal}\n${a.abstract}`
    ).join("\n\n---\n\n");

    return `You are ClinicalQuery, a medical literature assistant. Answer clinical questions using ONLY the PubMed abstracts provided below.

Rules:
- Cite sources inline using [1], [2], etc. matching the numbered abstracts
- If the abstracts don't contain enough information, say so clearly
- Never invent facts not present in the abstracts
- Use plain language but maintain clinical accuracy
- Note any important limitations or caveats in the evidence
- End with a brief "Sources" list

ABSTRACTS:
${context}`;
};

const claude = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});


router.post("/query", async (req, res) => {
    const { question } = req.body;
    if (!question?.trim()) {
        return res.status(400).json({ error: "Question is required" });
    }

    try {
        const ids = await searchPubMed(question);

        if (ids.length === 0) {
            return res.status(200).json({
                answer: "No relevant PubMed articles found. Try rephrasing with more specific medical terminology.",
                articles: [],
            });
        }

        const articles = await fetchAbstracts(ids);

        if (articles.length === 0) {
            return res.status(200).json({
                answer: "Found articles but could not retrieve abstracts. Please try again.",
                articles: [],
            });
        }

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        res.write(`data: ${JSON.stringify({ type: "articles", articles })}\n\n`);


        const stream = await claude.messages.stream({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 8192,
            system: buildSystemPrompt(articles),
            messages: [{ role: "user", content: question }],
        });

        for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
                res.write(`data: ${JSON.stringify({ type: "text", text: chunk.delta.text })}\n\n`);
            }
        }

        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        res.end();

    } catch (err) {
        console.error("Error:", err.message);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        } else {
            res.write(`data: ${JSON.stringify({ type: "text", text: `\n\n[Server Error: ${err.message}]` })}\n\n`);
            res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
            res.end();
        }
    }
});


module.exports = router;