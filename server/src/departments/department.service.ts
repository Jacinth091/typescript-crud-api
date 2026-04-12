import { db } from '../helpers/db';
import { Department, DepartmentCreationAttributes } from './department.model';

export const departmentService = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
};

async function getAll(): Promise<Department[]> {
    return await db.Department.findAll();
}

async function getById(id: number): Promise<Department> {
    const department = await db.Department.findByPk(id);
    if (!department) throw new Error('Department not found');
    return department;
}

async function create(params: DepartmentCreationAttributes): Promise<Department> {
    const existing = await db.Department.findOne({ where: { name: params.name } });
    if (existing) {
        throw new Error(`Department "${params.name}" already exists.`);
    }
    return await db.Department.create(params);
}

async function update(id: number, params: Partial<DepartmentCreationAttributes>): Promise<Department> {
    const department = await getById(id);
    if (params.name && params.name !== department.name) {
        const duplicate = await db.Department.findOne({ where: { name: params.name } });
        if (duplicate) {
            throw new Error(`Department "${params.name}" already exists.`);
        }
    }
    await department.update(params);
    return department;
}

async function _delete(id: number): Promise<Department> {
    const department = await getById(id);
    await department.destroy();
    return department;
}
