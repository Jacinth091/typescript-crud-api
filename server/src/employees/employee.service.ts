import { db } from '../helpers/db';
import { Employee, EmployeeCreationAttributes } from './employee.model';

export const employeeService = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
};

async function getAll(): Promise<Employee[]> {
    return await db.Employee.findAll({
        include: [
            { model: db.User, attributes: ['id', 'email', 'firstName', 'middleName', 'lastName'] },
            { model: db.Department, attributes: ['id', 'name'] }
        ]
    });
}

async function getById(id: number): Promise<Employee> {
    const employee = await db.Employee.findByPk(id, {
        include: [
            { model: db.User, attributes: ['id', 'email', 'firstName', 'middleName', 'lastName'] },
            { model: db.Department, attributes: ['id', 'name'] }
        ]
    });
    if (!employee) throw new Error('Employee not found');
    return employee;
}

async function create(params: EmployeeCreationAttributes): Promise<Employee> {
    // Verify user exists
    const user = await db.User.findByPk(params.userId);
    if (!user) throw new Error('User not found');

    // Verify department exists
    const department = await db.Department.findByPk(params.departmentId);
    if (!department) throw new Error('Department not found');

    return await db.Employee.create(params);
}

async function update(id: number, params: Partial<EmployeeCreationAttributes>): Promise<Employee> {
    const employee = await getById(id);

    if (params.userId) {
        const user = await db.User.findByPk(params.userId);
        if (!user) throw new Error('User not found');
    }

    if (params.departmentId) {
        const department = await db.Department.findByPk(params.departmentId);
        if (!department) throw new Error('Department not found');
    }

    await employee.update(params);
    return employee;
}

async function _delete(id: number): Promise<Employee> {
    const employee = await getById(id);
    await employee.destroy();
    return employee;
}
