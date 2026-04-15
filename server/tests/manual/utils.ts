import fs from 'node:fs';
import path from 'node:path';

const LOG_FILE = path.join(__dirname, '..', '..', 'test-results-manual.log');

export function logResult(testName: string, status: 'PASS' | 'FAIL', message: string = '') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${status}] ${testName}${message ? ': ' + message : ''}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    
    if (status === 'PASS') {
        console.log(`\x1b[32m[PASS]\x1b[0m ${testName}`);
    } else {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${testName}${message ? ' - ' + message : ''}`);
    }
}

export async function runTest(name: string, testFn: () => Promise<void>) {
    try {
        await testFn();
        logResult(name, 'PASS');
    } catch (error: any) {
        logResult(name, 'FAIL', error.message);
    }
}

export function initLogFile() {
    fs.writeFileSync(LOG_FILE, `--- Manual Modular Test Run: ${new Date().toISOString()} ---\n`);
    console.log(`\n\x1b[34m>>> Starting Modular Manual API Integration Tests <<<\x1b[0m`);
    console.log(`Results logged to: ${LOG_FILE}\n`);
}
