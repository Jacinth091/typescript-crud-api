import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { db } from '../helpers/db';
import { Role } from '../helpers/role';
import { User, UserCreationAttributes } from './user.model';


export const userService = {
    getAll,
    getById,
    create,
    update,
    findByEmail,
    findByUsernameOrEmail,
    findByUsername,
    delete: _delete,
    verify,
}


async function getAll(): Promise<User[]> {
    return await db.User.findAll();
}

async function verify(email: string): Promise<boolean> {
    const user = await db.User.findOne({ where: { email } });
    if (!user) return false;
    
    await user.update({ verified: true });
    return true;
}

async function getById(id: number): Promise<User> {
    return await getUser(id);
}

async function findByEmail(email: string): Promise<boolean> {
    const user = await db.User.findOne({ where: { email: email } });
    if (!user) {
        return false;
    }
    return true
}

async function findByUsername(username: string): Promise<boolean> {
    const user = await db.User.findOne({ where: { username } });
    if (!user) {
        return false;
    }
    return true
}
async function findByUsernameOrEmail(str: string): Promise<User | null> {
    const normalized = str.trim().toLowerCase();
    const user = await db.User.scope('withHash').findOne({
        where: {
            [Op.or]: [
                { email: normalized },
                { username: normalized },
            ],
        },
    });
    if (!user) return null;
    return user;
}

async function create(params: UserCreationAttributes & { password: string }): Promise<boolean> {
    const existingUser = await db.User.findOne({ where: { email: params.email } });
    if (existingUser) {
        throw new Error('Email "' + params.email + '" is already registered.');
    }

    const passwordHash = await bcrypt.hash(params.password, 10);
    const newUser = await db.User.create({
        ...params,
        passwordHash,
        role: params.role || Role.User,
    } as UserCreationAttributes);

    if (!newUser) {
        return false;
    }
    return true;

}

async function update(id: number, params: Partial<UserCreationAttributes> & { password?: string }): Promise<boolean> {
    const user = await getUser(id);

    if (params.password) {
        params.passwordHash = await bcrypt.hash(params.password, 10);
        delete params.password;
    }
    const updatedUser = await user.update(params as Partial<UserCreationAttributes>);
    if (!updatedUser) {
        return false;
    }
    return true;
}

async function _delete(id: number): Promise<boolean> {
    const user = await getUser(id);
    if (!user) {
        return false;
    }
    await user.destroy();
    return true;
};

async function getUser(id: number): Promise<User> {
    const user = await db.User.findByPk(id);
    if (!user) throw new Error('User not found');
    return user;
}