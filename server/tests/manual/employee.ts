import { TestContext } from './types';
import { runTest } from './utils';

export async function testEmployees(ctx: TestContext) {
    console.log("\n--- [EMPLOYEES SUITE] ---");

    await runTest('Add Employee (Linked to Regular User)', async () => {
        const res = await fetch(`${ctx.baseUrl}/employe/`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ctx.adminToken}`
            },
            body: JSON.stringify({
                email: 'user@test.com',
                position: 'Fullstack Dev',
                department_id: ctx.deptId,
                hire_date: new Date().toISOString().split('T')[0]
            })
        });
        const data: any = await res.json();
        if (!res.ok) throw new Error(`Status ${res.status}: ${data.message || data.error}`);
        ctx.empId = data.data.id;
        if (!ctx.empId) throw new Error('Employee ID not received');
    });
}
