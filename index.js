const { MongoClient } = require("mongodb");
require("dotenv").config();

const { testConnection, printReport } = require("./client-connect");
const { testInsertDocuments, printInsertReport } = require("./bulk-insert");

const uri = process.env.MONGODB_URI;
const testDB = process.env.MONGODB_TEST_DB || "test_db";
const testCollection = process.env.MONGODB_TEST_COLLECTION || "test_collection";
const sharedClient = new MongoClient(uri);

async function testConnectionToServer() {
  const client = new MongoClient(uri);
  await testConnection(client);
}

async function testInsertingDocuments() {
  await testInsertDocuments(sharedClient, testDB, testCollection);
}

async function runTests() {
  while (true) {
    const now = new Date();
    const dateString = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    console.log(`Starting tests at ${dateString}`);

    await testConnectionToServer();
    const connectionMetrics = printReport();

    await testInsertingDocuments();
    const batchInsertMetrics = printInsertReport();

    console.table([connectionMetrics, batchInsertMetrics]);

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

runTests();
