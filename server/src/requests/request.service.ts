import { db } from '../helpers/db';
import { RequestRecord, RequestCreationAttributes } from './request.model';

export const requestService = {
    getByUserId,
    create,
    delete: _delete,
};

async function getByUserId(userId: number): Promise<RequestRecord[]> {
    return await db.RequestRecord.findAll({
        where: { userId },
        include: [{ model: db.RequestItem, as: 'items' }],
        order: [['date', 'DESC']]
    });
}

async function create(
    userId: number,
    type: string,
    items: { name: string; qty: number }[]
): Promise<RequestRecord> {
    const sequelize = db.RequestRecord.sequelize!;

    return await sequelize.transaction(async (t) => {
        const request = await db.RequestRecord.create(
            {
                userId,
                type,
                date: new Date().toISOString().split('T')[0],
            } as RequestCreationAttributes,
            { transaction: t }
        );

        const itemRecords = items.map((item) => ({
            requestId: request.id,
            name: item.name.trim(),
            quantity: item.qty,
        }));

        await db.RequestItem.bulkCreate(itemRecords, { transaction: t });

        // Re-fetch with items included
        const result = await db.RequestRecord.findByPk(request.id, {
            include: [{ model: db.RequestItem, as: 'items' }],
            transaction: t,
        });

        return result!;
    });
}

async function _delete(id: number, userId: number): Promise<RequestRecord> {
    const request = await db.RequestRecord.findOne({
        where: { id, userId },
        include: [{ model: db.RequestItem, as: 'items' }],
    });

    if (!request) throw new Error('Request not found');
    if (request.status !== 'Pending') {
        throw new Error('Only pending requests can be deleted.');
    }

    // Delete items first, then the request
    await db.RequestItem.destroy({ where: { requestId: id } });
    await request.destroy();
    return request;
}
