const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// this function logs the query to the database
async function logQuery(question, answer, articleCount) {
    try {
        return await prisma.query.create({
            data: {
                question,
                answer,
                articleCount
            }
        });
    } catch (e) {
        console.error("error logging query: ", e);
        return null;
    }
}


//this functions is used to return the recent queries from the database
async function getRecentQueries(limit = 20) {
    try {
        return await prisma.query.findMany({
            take: limit,
            orderBy: { date: 'desc' },
        })

    } catch (e) {
        console.error("error returning queries ", e);
        return [];
    }
}

module.exports = { logQuery, getRecentQueries }; 