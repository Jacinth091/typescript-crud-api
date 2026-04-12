process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'typescript_crud_api_test';

import app from '../../src/server';
import { db, initialize } from '../../src/helpers/db';
import { Server } from 'http';
import { TestContext } from './types';
import { testAuth } from './auth';
import { testDepartments } from './department';
import { testEmployees } from './employee';
import { testRequests } from './request';
import { initLogFile } from './utils';

const PORT = 4001;
const context: TestContext = {
    baseUrl: `http://localhost:${PORT}/api`,
    adminToken: '',
    userToken: '',
    userId: 0,
    deptId: 0,
    empId: 0,
    requestId: 0
} as any;

async function run() {
    let server: Server | undefined;

    initLogFile();

    try {
        // Setup
        await initialize();
        const sequelize = (db.User as any).sequelize;
        await sequelize.sync({ force: true });
        console.log("📂 Database: typescript_crud_api_test (Wiped & Ready)");

        server = app.listen(PORT);
        console.log(`🌐 Server: Running on ${context.baseUrl}`);

        // Run Modules
        await testAuth(context);
        await testDepartments(context);
        await testEmployees(context);
        await testRequests(context);

        console.log("\n🏁 All modular tests completed successfully!");

    } catch (error) {
        console.error("\n❌ Test Failed:", error);
    } finally {
        console.log("🛑 Cleaning up...");
        if (server) server.close();
        const sequelize = (db.User as any).sequelize;
        if (sequelize) await sequelize.close();
        console.log("👋 Done.");
        process.exit(0);
    }
}

run();
