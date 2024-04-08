const testResults = {
  totalTests: 0,
  successCount: 0,
  failureCount: 0,
  successDurations: [],
};

async function testConnection(client) {
  const start = process.hrtime.bigint();
  let success = false;

  try {
    await client.connect();
    success = true;
  } catch (error) {
    console.error("Connection failed", error);
    testResults.failureCount += 1;
  } finally {
    await client.close();
    testResults.totalTests += 1;
  }

  if (success) {
    const end = process.hrtime.bigint();
    const duration = Number((end - start) / BigInt(1000000)); // Convert to milliseconds
    console.log(`Connection time: ${duration}ms`);
    testResults.successDurations.push(duration);
    testResults.successCount += 1;
    return { success: true, duration };
  } else {
    return { success: false, duration: 0 };
  }
}

function printReport() {
  // const now = new Date();V
  // const dateString = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  const successDurations = testResults.successDurations;
  const avgDuration =
    successDurations.length > 0
      ? Math.round(
          successDurations.reduce((a, b) => a + b, 0) / successDurations.length
        )
      : 0;
  const sortedDurations = [...successDurations].sort((a, b) => a - b);
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

  const logEntry = {
    name: "Connection",
    totalTests: testResults.totalTests,
    successCount: testResults.successCount,
    failureCount: testResults.failureCount,
    avgDuration: avgDuration,
    medianDuration: medianDuration,
    maxDuration: maxDuration,
    minDuration: minDuration,
  };

  return logEntry;
}

module.exports = {
  testConnection,
  printReport,
};
