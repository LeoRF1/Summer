//this function is an API wrapper for searching pubmed to find articles that are relevant to the query
async function searchPubMed(query, maxResults = 5) {
    try {
        const url = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi");
        url.searchParams.set("db", "pubmed");
        url.searchParams.set("term", query);
        url.searchParams.set("retmax", maxResults);
        url.searchParams.set("retmode", "json");
        url.searchParams.set("sort", "relevance");

        const res = await fetch(url);
        const data = await res.json();
        return data.esearchresult?.idlist ?? [];
    } catch (error) {
        console.error("searchPubMed error:", error);
        return [];
    }
}



//this function is an API wrapper for fetching abstracts from pubmed
async function fetchAbstracts(ids) {
    try {
        const url = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi");
        url.searchParams.set("db", "pubmed");
        url.searchParams.set("id", ids.join(","));
        url.searchParams.set("rettype", "abstract");
        url.searchParams.set("retmode", "xml");

        const res = await fetch(url);
        const xml = await res.text();

        const articles = [];
        const matches = xml.matchAll(/<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g);

        for (const match of matches) {
            const body = match[1];

            const pmid = body.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1] ?? "";
            const title = body.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)?.[1]
                ?.replace(/<[^>]+>/g, "").trim() ?? "Untitled";

            // Bug 4: handle multiple <AbstractText> tags (structured abstracts)
            const abstractTags = body.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g);
            const abstract = abstractTags
                ?.map(t => t.replace(/<[^>]+>/g, "").trim())
                .join(" ") ?? "";

            const year = body.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/)?.[1] ?? "";
            const journal = body.match(/<Title>([\s\S]*?)<\/Title>/)?.[1]
                ?.replace(/<[^>]+>/g, "").trim() ?? "";

            if (abstract) {
                articles.push({ pmid, title, abstract, year, journal });
            }
        }

        return articles;
    } catch (error) {
        console.error("fetchAbstracts error:", error);
        return [];
    }
}

module.exports = {
    searchPubMed,
    fetchAbstracts
};