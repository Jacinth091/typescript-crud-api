import { DataTypes, Model, Optional } from "sequelize";
import type { Sequelize } from "sequelize";

// ─── Request Record ───

export interface RequestAttributes {
    id: number;
    userId: number;
    type: string;
    status: string;
    date: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface RequestCreationAttributes extends Optional<RequestAttributes, 'id' | 'status' | 'date' | 'createdAt' | 'updatedAt'> { }

export class RequestRecord extends Model<RequestAttributes, RequestCreationAttributes> implements RequestAttributes {
    public id!: number;
    public userId!: number;
    public type!: string;
    public status!: string;
    public date!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public items?: RequestItem[];
}

// ─── Request Item ───

export interface RequestItemAttributes {
    id: number;
    requestId: number;
    name: string;
    quantity: number;
}

export interface RequestItemCreationAttributes extends Optional<RequestItemAttributes, 'id'> { }

export class RequestItem extends Model<RequestItemAttributes, RequestItemCreationAttributes> implements RequestItemAttributes {
    public id!: number;
    public requestId!: number;
    public name!: string;
    public quantity!: number;
}

// ─── Model Initialiser ───

export function initRequestRecord(sequelize: Sequelize): typeof RequestRecord {
    RequestRecord.init({
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
        type: {
            type: DataTypes.ENUM('Equipment', 'Leave', 'Resources'),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
            allowNull: false,
            defaultValue: 'Pending'
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'RequestRecord',
        tableName: 'requests',
        timestamps: true
    });

    return RequestRecord;
}

export function initRequestItem(sequelize: Sequelize): typeof RequestItem {
    RequestItem.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        requestId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: { model: 'requests', key: 'id' }
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 1
        }
    }, {
        sequelize,
        modelName: 'RequestItem',
        tableName: 'request_items',
        timestamps: false
    });

    return RequestItem;
}
