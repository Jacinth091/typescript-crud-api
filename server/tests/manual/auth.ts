import { TestContext } from './types';
import { Role } from '../../src/helpers/role';
import { runTest } from './utils';

export async function testAuth(ctx: TestContext) {
    console.log("\n--- [AUTH SUITE] ---");

    await runTest('Register Admin', async () => {
        const res = await fetch(`${ctx.baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: 'Admin', middle_name: 'Super', last_name: 'User', email: 'admin@test.com',
                username: 'admin', password: 'password123', title: 'Mr',
                role: Role.Admin, verified: true
            })
        });
        if (!res.ok) {
            const data: any = await res.json();
            throw new Error(`Status ${res.status}: ${data.error || JSON.stringify(data)}`);
        }
    });

    await runTest('Register Regular User', async () => {
        const res = await fetch(`${ctx.baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: 'Regular', middle_name: 'Middle', last_name: 'User', email: 'user@test.com',
                username: 'user', password: 'password123', title: 'Ms',
                role: Role.User, verified: true
            })
        });
        if (!res.ok) {
            const data: any = await res.json();
            throw new Error(`Status ${res.status}: ${data.error || JSON.stringify(data)}`);
        }
    });

    await runTest('Login Admin', async () => {
        const res = await fetch(`${ctx.baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userStr: 'admin', password: 'password123' })
        });
        const data: any = await res.json();
        if (!res.ok) throw new Error(`Status ${res.status}: ${data.error}`);
        ctx.adminToken = data.token;
        if (!ctx.adminToken) throw new Error('Token not received');
    });

    await runTest('Login User', async () => {
        const res = await fetch(`${ctx.baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userStr: 'user', password: 'password123' })
        });
        const data: any = await res.json();
        if (!res.ok) throw new Error(`Status ${res.status}: ${data.error}`);
        ctx.userToken = data.token;
        ctx.userId = data.data.id;
        if (!ctx.userToken) throw new Error('Token not received');
    });
}
