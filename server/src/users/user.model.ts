import { DataTypes, Model, Optional } from "sequelize";
import type { Sequelize } from 'sequelize';

export interface UserAttributes {
    id: number;
    email: string;
    username: string;
    passwordHash: string;
    title: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    role: string;
    verified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public email!: string;
    public username!: string;
    public passwordHash!: string;
    public title!: string;
    public firstName!: string;
    public middleName?: string;
    public lastName!: string;
    public verified!: boolean;
    public role!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}


export default function (sequelize: Sequelize): typeof User {
    User.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        username:{
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        passwordHash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        middleName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        role: {
            type: DataTypes.ENUM('Admin', 'User'),
            allowNull: false,
            defaultValue: 'User'
        }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        defaultScope: {
            attributes: { exclude: ['passwordHash'] },
        },
        scopes: {
            withHash: {
                attributes: { include: ['passwordHash'] }
            }
        }
    });

    return User;
}
