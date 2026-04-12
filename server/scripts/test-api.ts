process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'typescript_crud_api_test';

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import app from '../src/server';
import { initialize, db } from '../src/helpers/db';
import { Sequelize } from 'sequelize';

const LOG_FILE = path.join(__dirname, '..', 'test-results.log');
const TEST_PORT = 4001;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

let authToken = '';
let userId: number;
let departmentId: number;
let employeeId: number;
let requestId: number;

// --- Helper Functions ---

function logResult(testName: string, status: 'PASS' | 'FAIL', message: string = '') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${status}] ${testName}${message ? ': ' + message : ''}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    
    if (status === 'PASS') {
        console.log(`\x1b[32m[PASS]\x1b[0m ${testName}`);
    } else {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${testName}${message ? ' - ' + message : ''}`);
    }
}

async function runTest(name: string, testFn: () => Promise<void>) {
    try {
        await testFn();
        logResult(name, 'PASS');
    } catch (error: any) {
        logResult(name, 'FAIL', error.message);
    }
}

// --- Test Suites ---

async function runAllTests() {
    console.log(`\n\x1b[34m>>> Starting API Integration Tests <<<\x1b[0m\n`);
    fs.writeFileSync(LOG_FILE, `--- API Test Run: ${new Date().toISOString()} ---\n`);

    // 1. Auth & Accounts
    await runTest('Register Admin Account', async () => {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Mr.',
                first_name: 'Test',
                last_name: 'Admin',
                username: 'testadmin',
                email: 'testadmin@example.com',
                password: 'password123',
                role: 'Admin'
            })
        });
        const data: any = await res.json();
        if (res.status !== 201) throw new Error(`Status ${res.status}: ${data.error || JSON.stringify(data)}`);
    });

    await runTest('Login Admin', async () => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userStr: 'testadmin@example.com',
                password: 'password123'
            })
        });
        const data: any = await res.json();
        if (res.status !== 200) throw new Error(`Status ${res.status}: ${data.error}`);
        authToken = data.token;
        userId = data.data.id;
        if (!authToken) throw new Error('Token not received');
    });

    // 2. Department Management
    await runTest('Create Department', async () => {
        const res = await fetch(`${BASE_URL}/department`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                name: 'Research & Development',
                description: 'Innovation and technical research'
            })
        });
        const data: any = await res.json();
        if (res.status !== 201) throw new Error(`Status ${res.status}: ${data.error}`);
        departmentId = data.data.id;
    });

    await runTest('Get Department List', async () => {
        const res = await fetch(`${BASE_URL}/department`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data: any = await res.json();
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        if (!Array.isArray(data.data) || data.data.length === 0) throw new Error('Department list empty');
    });

    // 3. Employee Management
    await runTest('Add New Employee', async () => {
        const res = await fetch(`${BASE_URL}/employee`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                email: 'testadmin@example.com',
                position: 'Lead Engineer',
                department_id: departmentId,
                hire_date: new Date().toISOString().split('T')[0]
            })
        });
        const data: any = await res.json();
        if (res.status !== 201) throw new Error(`Status ${res.status}: ${data.message || data.error}`);
        employeeId = data.data.id;
    });

    await runTest('Get Employee By ID', async () => {
        const res = await fetch(`${BASE_URL}/employee/${employeeId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data: any = await res.json();
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        if (data.data.position !== 'Lead Engineer') throw new Error('Position mismatch');
    });

    // 4. Request Lifecycle
    await runTest('Submit Equipment Request', async () => {
        const res = await fetch(`${BASE_URL}/request`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                type: 'Equipment',
                items: [
                    { name: 'Mechanical Keyboard', qty: 2 },
                    { name: '4K Monitor', qty: 1 }
                ]
            })
        });
        const data: any = await res.json();
        if (res.status !== 201) throw new Error(`Status ${res.status}: ${data.error}`);
        requestId = data.data.id;
    });

    await runTest('Get User Requests', async () => {
        const res = await fetch(`${BASE_URL}/request`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data: any = await res.json();
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
        if (!data.data.some((r: any) => r.id === requestId)) throw new Error('Created request not found');
    });

    // 5. Cleanup / Deletion Tests (Optional)
    await runTest('Delete Request', async () => {
        const res = await fetch(`${BASE_URL}/request/${requestId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

    console.log(`\n\x1b[34m>>> API Integration Tests Completed <<<\x1b[0m`);
    console.log(`Results logged to: ${LOG_FILE}\n`);
}

// --- Execution ---

async function main() {
    let server: http.Server;

    try {
        console.log('Initializing test database...');
        await initialize();
        
        // Wipe database for clean test state
        const sequelize = (db.User as any).sequelize;
        await sequelize.sync({ force: true });
        console.log('Database wiped and synchronized.');
        
        server = app.listen(TEST_PORT, async () => {
            console.log(`Test server running on port ${TEST_PORT}`);
            await runAllTests();
            server.close(() => {
                console.log('Test server closed.');
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
}

main();
