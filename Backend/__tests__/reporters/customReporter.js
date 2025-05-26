/**
 * Custom Jest Reporter for Mercury Backend
 * 
 * This reporter adds enhanced formatting and summary statistics to test reports
 */
class CustomReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options || {};
    this.testResults = [];
    this.startTime = Date.now();
  }

  onRunStart(results, options) {
    console.log('\n🚀 Starting Mercury Backend Test Suite');
    console.log('======================================\n');
  }

  onTestStart(test) {
    console.log(`🧪 Running: ${test.path}`);
  }

  onTestResult(test, testResult, aggregatedResult) {
    this.testResults.push(testResult);
    
    const { numFailingTests, numPassingTests, numPendingTests, testResults } = testResult;
    
    console.log(`\n📋 Results for: ${test.path}`);
    console.log(`   Passed: ${numPassingTests} | Failed: ${numFailingTests} | Pending: ${numPendingTests}\n`);
    
    // Print failed tests with details
    if (numFailingTests > 0) {
      console.log('❌ Failed Tests:');
      testResults
        .filter(result => result.status === 'failed')
        .forEach(result => {
          console.log(`   - ${result.title}`);
          console.log(`     ${result.failureMessages[0].split('\n')[0]}\n`);
        });
    }

    // Print passed tests
    if (numPassingTests > 0 && this._options.showPassedTests) {
      console.log('✅ Passed Tests:');
      testResults
        .filter(result => result.status === 'passed')
        .forEach(result => {
          console.log(`   - ${result.title}`);
        });
      console.log('\n');
    }
  }

  onRunComplete(contexts, results) {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    
    console.log('\n📊 Test Suite Summary');
    console.log('==========================================');
    console.log(`✅ Passed: ${results.numPassedTests}`);
    console.log(`❌ Failed: ${results.numFailedTests}`);
    console.log(`⏸️ Pending: ${results.numPendingTests}`);
    console.log(`Total: ${results.numTotalTests} tests`);
    console.log(`Time: ${duration.toFixed(2)}s`);
    
    // Report test coverage if available
    if (results.coverageMap) {
      const coverage = results.coverageMap.getCoverageSummary().toJSON();
      console.log('\n📈 Coverage Summary');
      console.log(`Lines: ${coverage.lines.pct.toFixed(2)}%`);
      console.log(`Statements: ${coverage.statements.pct.toFixed(2)}%`);
      console.log(`Branches: ${coverage.branches.pct.toFixed(2)}%`);
      console.log(`Functions: ${coverage.functions.pct.toFixed(2)}%`);
    }
    
    console.log('\n💾 Detailed reports saved to:');
    console.log('- ./test-reports/test-report.html');
    console.log('- ./test-reports/junit.xml');
    console.log('- ./test-reports/coverage/\n');
    
    if (results.numFailedTests > 0) {
      console.log('❓ For troubleshooting failed tests, check the HTML report for stack traces and error details.');
    }
    
    console.log('\n🏁 Test Run Complete!');
  }
}

module.exports = CustomReporter;
