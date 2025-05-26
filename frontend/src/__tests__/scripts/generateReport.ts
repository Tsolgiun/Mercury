// Frontend Test Report Viewer
import { execSync } from 'child_process';
import { resolve } from 'path';
import fs from 'fs';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`${colors.bright}${colors.blue}Mercury Frontend Test Report Generator${colors.reset}`);
console.log(`${colors.cyan}========================================${colors.reset}\n`);

// Create report directories if they don't exist
const reportDir = resolve('./test-reports');
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
  console.log(`${colors.yellow}Created report directory: ${reportDir}${colors.reset}`);
}

// Run the tests
try {
  console.log(`${colors.bright}Running tests...${colors.reset}`);
  execSync('npm run test:html', { stdio: 'inherit' });
  
  // Open the HTML report automatically
  const reportPath = resolve('./test-reports/vitest-report.html');
  
  if (fs.existsSync(reportPath)) {
    console.log(`\n${colors.bright}${colors.green}Tests completed.${colors.reset}`);
    console.log(`${colors.cyan}Opening HTML report...${colors.reset}`);
    
    // Determine platform to use the right command
    const { platform } = process;
    
    switch (platform) {
      case 'win32':
        execSync(`start "" "${reportPath}"`, { stdio: 'ignore' });
        break;
      case 'darwin':
        execSync(`open "${reportPath}"`, { stdio: 'ignore' });
        break;
      default:
        execSync(`xdg-open "${reportPath}"`, { stdio: 'ignore' });
    }
    
    console.log(`${colors.bright}${colors.green}Report opened in your default browser.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}Report file was not generated: ${reportPath}${colors.reset}`);
  }
} catch (error) {
  console.error(`\n${colors.red}Error running tests:${colors.reset} ${error.message}`);
  process.exit(1);
}
