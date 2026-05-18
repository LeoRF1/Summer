const express = require("express");
const cors = require("cors");
const anthropic = require("anthropic");


const app = express()

app.use(cors())
app.use(express.json())

const claude = new anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
})


// this is an API wrapper for fetching data from pubmed

async function serchPubmed(query, maxResults = 5) {
    try {
        const url = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi");
        url.searchParams.set("db", "pubmed");
        url.searchParams.set("term", query);
        url.searchParams.set("retmax", maxResults);
        url.searchParams.set("retmode", "json");
        url.searchParams.set("sort", "relevance");

        const res = await fetch((url));
        const data = await res.json();
        return data.esearchresult.idlist;


    } catch (error) {
        console.log("error", error)
    }

}

// This is a function that fetches all the matching results 
async function fetchAbstracts(pmids, maxResults) {
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

        }


    } catch (error) {
        console.log("error", error)
    }
}