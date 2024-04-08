const testInsertResults = {
  totalInsertTests: 0,
  successInsertCount: 0,
  failureInsertCount: 0,
  insertDurations: [],
};

function generateRandomDocument() {
  return {
    name: `Name-${Math.random().toString(36).substring(7)}`,
    value: Math.floor(Math.random() * 100),
    timestamp: new Date(),
  };
}

async function testInsertDocuments(client, dbName, collectionName) {
  const documents = Array.from({ length: 2000 }, generateRandomDocument);
  const start = process.hrtime.bigint();
  let success = false;

  try {
    const collection = client.db(dbName).collection(collectionName);
    await collection.drop();
    await collection.insertMany(documents);
    success = true;
  } catch (error) {
    console.error("Failed to insert documents", error);
    testInsertResults.failureInsertCount += 1;
  }

  const end = process.hrtime.bigint();
  const duration = Number((end - start) / BigInt(1000000)); // Convert to milliseconds

  if (success) {
    console.log(`Insertion time: ${duration}ms`);
    testInsertResults.insertDurations.push(duration);
    testInsertResults.successInsertCount += 1;
  } else {
    return { success: false, duration: 0 };
  }

  testInsertResults.totalInsertTests += 1;
  return { success: true, duration };
}

function printInsertReport() {
  const avgDuration =
    testInsertResults.insertDurations.length > 0
      ? Math.round(
          testInsertResults.insertDurations.reduce((a, b) => a + b, 0) /
            testInsertResults.insertDurations.length
        )
      : 0;
  const sortedDurations = [...testInsertResults.insertDurations].sort(
    (a, b) => a - b
  );
  const medianDuration =
    sortedDurations.length > 0
      ? (sortedDurations[Math.floor((sortedDurations.length - 1) / 2)] +
          sortedDurations[Math.ceil((sortedDurations.length - 1) / 2)]) /
        2
      : 0;
  const maxDuration =
    sortedDurations.length > 0 ? Math.max(...sortedDurations) : 0;
  const minDuration =
    sortedDurations.length > 0 ? Math.min(...sortedDurations) : 0;

  const report = {
    name: "Bulk Insert",
    totalTests: testInsertResults.totalInsertTests,
    successCount: testInsertResults.successInsertCount,
    failureCount: testInsertResults.failureInsertCount,
    avgDuration: avgDuration,
    medianDuration: medianDuration,
    maxDuration: maxDuration,
    minDuration: minDuration,
  };

  return report;
}

module.exports = {
  testInsertDocuments,
  printInsertReport,
};
