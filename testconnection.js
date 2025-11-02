require('dotenv').config()
const { MongoClient } = require('mongodb')

console.log('checking .env =>', process.env.MONGODB_CONN_STRING)

const link = process.env.MONGODB_CONN_STRING
const client = new MongoClient(link)

async function connectMe() {
    try {
        await client.connect()
        console.log("✅ MongoDB Atlas Connected OK")
    } catch (err) {
        console.log("❌ MongoDB Connect Failed:", err)
    } finally {
        await client.close()
    }
}

connectMe()
