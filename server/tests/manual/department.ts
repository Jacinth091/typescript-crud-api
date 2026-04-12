import { TestContext } from './types';
import { runTest } from './utils';

export async function testDepartments(ctx: TestContext) {
    console.log("\n--- [DEPARTMENTS SUITE] ---");

    await runTest('Create Engineering Department', async () => {
        const res = await fetch(`${ctx.baseUrl}/department/`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ctx.adminToken}`
            },
            body: JSON.stringify({ name: 'Engineering', description: 'Software Dev' })
        });
        const data: any = await res.json();
        if (!res.ok) throw new Error(`Status ${res.status}: ${data.error}`);
        ctx.deptId = data.data.id;
        if (!ctx.deptId) throw new Error('Department ID not received');
    });

    await runTest('List Departments', async () => {
        const res = await fetch(`${ctx.baseUrl}/department/`, {
            headers: { 'Authorization': `Bearer ${ctx.adminToken}` }
        });
        const data: any = await res.json();
        if (!res.ok) throw new Error(`Status ${res.status}`);
        if (!Array.isArray(data.data)) throw new Error('Invalid data format received');
    });
}
