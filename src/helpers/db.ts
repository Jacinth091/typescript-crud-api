import config from '../config';
import mysql from 'mysql2/promise';

import { Sequelize } from 'sequelize';


export interface Database {
    User: any
}

export const db: Database = {} as Database;

export async function initialize(): Promise<void> {
    const { host, port, user, password, database } = config.database;
    console.log("Config Database: ", config.database);


    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

    const sequelize = new Sequelize(database, user, password, {
        dialect: 'mysql',
        host: host,
        port: port
    });
    console.log(sequelize);

    const { default: userModel } = await import('../users/user.model');
    db.User = userModel(sequelize);


    await sequelize.sync({ alter: true });
    console.log('Database Initialized and models synced successfully!');
}
