import config from '../config';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import { User } from '../users/user.model';
import { Department } from '../departments/department.model';
import { Employee } from '../employees/employee.model';
import { RequestRecord, RequestItem } from '../requests/request.model';

export interface Database {
    User: typeof User;
    Department: typeof Department;
    Employee: typeof Employee;
    RequestRecord: typeof RequestRecord;
    RequestItem: typeof RequestItem;
}

export const db: Database = {} as Database;

export async function initialize(): Promise<void> {
    const { host, port, user, password, database } = config.database;
    // console.log("Config Database: ", config.database);

    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

    const sequelize = new Sequelize(database, user, password, {
        dialect: 'mysql',
        host: host,
        port: port
    });

    // ─── Register Models ───
    const { default: userModel } = await import('../users/user.model');
    const { default: departmentModel } = await import('../departments/department.model');
    const { default: employeeModel } = await import('../employees/employee.model');
    const { initRequestRecord, initRequestItem } = await import('../requests/request.model');

    db.User = userModel(sequelize);
    db.Department = departmentModel(sequelize);
    db.Employee = employeeModel(sequelize);
    db.RequestRecord = initRequestRecord(sequelize);
    db.RequestItem = initRequestItem(sequelize);

    // ─── Define Associations ───

    db.Employee.belongsTo(db.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    db.Employee.belongsTo(db.Department, { foreignKey: 'departmentId' });
    db.User.hasOne(db.Employee, { foreignKey: 'userId', onDelete: 'CASCADE' });
    db.Department.hasMany(db.Employee, { foreignKey: 'departmentId' });

    db.RequestRecord.belongsTo(db.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    db.User.hasMany(db.RequestRecord, { foreignKey: 'userId', onDelete: 'CASCADE' });
    db.RequestRecord.hasMany(db.RequestItem, { as: 'items', foreignKey: 'requestId', onDelete: 'CASCADE' });
    db.RequestItem.belongsTo(db.RequestRecord, { foreignKey: 'requestId' });

    await sequelize.sync({ alter: true });
    console.log('Database Initialized and models synced successfully!');
}
