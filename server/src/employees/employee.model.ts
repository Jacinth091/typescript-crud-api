import { DataTypes, Model, Optional } from "sequelize";
import type { Sequelize } from "sequelize";

export interface EmployeeAttributes {
    id: number;
    userId: number;
    departmentId: number;
    position: string;
    hireDate: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface EmployeeCreationAttributes extends Optional<EmployeeAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes> implements EmployeeAttributes {
    public id!: number;
    public userId!: number;
    public departmentId!: number;
    public position!: string;
    public hireDate!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof Employee {
    Employee.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        departmentId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: { model: 'departments', key: 'id' }
        },
        position: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        hireDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Employee',
        tableName: 'employees',
        timestamps: true
    });

    return Employee;
}
