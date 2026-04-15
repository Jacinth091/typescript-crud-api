import { initialize, db } from '../src/helpers/db';
import { userService } from '../src/users/user.service';
import { departmentService } from '../src/departments/department.service';
import { employeeService } from '../src/employees/employee.service';
import { requestService } from '../src/requests/request.service';
import { Role } from '../src/helpers/role';

async function seed() {
    try {
        console.log('--- Initializing Database ---');
        await initialize();
        console.log('--- Seeding Departments ---');
        const departmentsData = [
            { name: 'Engineering', description: 'Software and Hardware Development' },
            { name: 'Human Resources', description: 'People and Culture' },
            { name: 'Marketing', description: 'Branding and Outreach' },
            { name: 'Sales', description: 'Revenue and Growth' },
            { name: 'Finance', description: 'Accounting and Planning' }
        ];

        const departments = [];
        for (const dept of departmentsData) {
            try {
                const created = await departmentService.create(dept as any);
                departments.push(created);
                console.log(`Created Department: ${created.name}`);
            } catch (e: any) {
                console.log(`Department "${dept.name}" already exists or error: ${e.message}`);
                const existing = await db.Department.findOne({ where: { name: dept.name } });
                if (existing) departments.push(existing);
            }
        }
        console.log('--- Seeding Accounts ---');
        const usersData = [
            {
                firstName: 'Alice', middleName: 'M.', lastName: 'Smith', email: 'alice@example.com',
                username: 'alice', password: 'Password123!', title: 'Senior Engineer',
                role: Role.User, verified: true
            },
            {
                firstName: 'Bob', middleName: 'L.', lastName: 'Jones', email: 'bob@example.com',
                username: 'bob', password: 'Password123!', title: 'HR Manager',
                role: Role.User, verified: true
            },
            {
                firstName: 'Charlie', middleName: 'D.', lastName: 'Brown', email: 'charlie@example.com',
                username: 'charlie', password: 'Password123!', title: 'Marketing Lead',
                role: Role.User, verified: true
            }
        ];

        for (const userData of usersData) {
            try {
                const exists = await db.User.findOne({ where: { email: userData.email } });
                if (!exists) {
                    await userService.create(userData as any);
                    console.log(`Created User: ${userData.email}`);
                } else {
                    console.log(`User "${userData.email}" already exists.`);
                }
            } catch (e: any) {
                console.log(`Error creating user "${userData.email}": ${e.message}`);
            }
        }

        console.log('--- Seeding Employee Records ---');
        const employeeLinks = [
            { email: 'alice@example.com', deptName: 'Engineering', position: 'Senior Software Engineer' },
            { email: 'bob@example.com', deptName: 'Human Resources', position: 'HR Specialist' },
            { email: 'charlie@example.com', deptName: 'Marketing', position: 'Content Creator' }
        ];

        for (const link of employeeLinks) {
            const user = await db.User.findOne({ where: { email: link.email } });
            const dept = await db.Department.findOne({ where: { name: link.deptName } });

            if (user && dept) {
                const empExists = await db.Employee.findOne({ where: { userId: user.id } });
                if (!empExists) {
                    await employeeService.create({
                        userId: user.id,
                        departmentId: dept.id,
                        position: link.position,
                        hireDate: new Date().toISOString().split('T')[0]
                    } as any);
                    console.log(`Created Employee record for: ${link.email}`);
                } else {
                    console.log(`Employee record for "${link.email}" already exists.`);
                }
            }
        }

        // 4. Seed Requests
        console.log('--- Seeding Requests ---');
        const requestsData = [
            {
                email: 'alice@example.com',
                type: 'Equipment',
                items: [
                    { name: 'Mechanical Keyboard', qty: 1 },
                    { name: 'Monitor Arm', qty: 2 }
                ]
            },
            {
                email: 'bob@example.com',
                type: 'Resources',
                items: [
                    { name: 'HR Software Subscription', qty: 1 }
                ]
            }
        ];

        for (const req of requestsData) {
            const user = await db.User.findOne({ where: { email: req.email } });
            if (user) {
                // Check if they already have requests to avoid duplication in demo
                const existingRequests = await requestService.getByUserId(user.id);
                if (existingRequests.length === 0) {
                    await requestService.create(user.id, req.type, req.items);
                    console.log(`Created Request for: ${req.email}`);
                } else {
                    console.log(`User "${req.email}" already has requests.`);
                }
            }
        }

        console.log('--- Seeding Complete ---');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Failed:', error);
        process.exit(1);
    }
}

seed();
