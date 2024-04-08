const { MongoClient } = require("mongodb");
require("dotenv").config();

const { testConnection, printReport } = require("./client-connect");
const { testInsertDocuments, printInsertReport } = require("./bulk-insert");

const uri = process.env.MONGODB_URI;
const testDB = process.env.MONGODB_TEST_DB || "test_db";
const testCollection = process.env.MONGODB_TEST_COLLECTION || "test_collection";

const proxyHost = process.env.PROXY_HOST;
const proxyPort = process.env.PROXY_PORT;
const proxyUsername = process.env.PROXY_USERNAME;
const proxyPassword = process.env.PROXY_PASSWORD;

let socksOptions;
if (proxyHost && proxyPort) {
  socksOptions = {
    proxyHost: proxyHost,
    proxyPort: proxyPort,
    proxyUsername: proxyUsername,
    proxyPassword: proxyPassword
  };
}

let sharedClient = new MongoClient(uri);
if (socksOptions) {
  sharedClient = new MongoClient(uri, socksOptions);
}

async function testConnectionToServer() {
  let client = new MongoClient(uri);
  if (socksOptions) {
    client = new MongoClient(uri, socksOptions);
  }
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
