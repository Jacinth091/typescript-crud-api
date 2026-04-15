import { TestContext } from './types';
import { runTest } from './utils';

export async function testRequests(ctx: TestContext) {
    console.log("\n--- [REQUESTS SUITE] ---");

    await runTest('Create Equipment Request', async () => {
        const res = await fetch(`${ctx.baseUrl}/request/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ctx.userToken}`
            },
            body: JSON.stringify({
                type: 'Equipment',
                items: [{ name: 'MacBook', qty: 1 }, { name: 'Monitor', qty: 2 }]
            })
        });
        const data: any = await res.json();
        console.log(data);
        if (!res.ok) throw new Error(`Status ${res.status}: ${data.error}`);
        ctx.requestId = data.data.id;
        if (!ctx.requestId) throw new Error('Request ID not received');
    });

    await runTest('List User Requests', async () => {
        const res = await fetch(`${ctx.baseUrl}/request/`, {
            headers: { 'Authorization': `Bearer ${ctx.userToken}` }
        });
        const data: any = await res.json();
        if (!res.ok) throw new Error(`Status ${res.status}`);
        if (!Array.isArray(data.data)) throw new Error('Invalid data format received');
    });
}
