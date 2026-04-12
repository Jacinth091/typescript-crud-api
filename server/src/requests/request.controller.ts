import { Request, Response } from "express";
import { requestService } from "./request.service";

export const getRequestList = async (req: Request | any, res: Response): Promise<any> => {
    try {
        const userId = Number(req.user?.sub);
        const userRequests = await requestService.getByUserId(userId);

        if (!userRequests.length) {
            return res.status(200).json({ success: true, data: [], message: "No requests found." });
        }

        return res.status(200).json({
            success: true,
            message: "Requests fetched successfully.",
            data: userRequests
        });
    } catch (error) {
        console.error("Get Requests Error: ", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const createRequest = async (req: Request | any, res: Response): Promise<any> => {
    const { type, items } = req.body;
    try {
        if (!type?.trim()) {
            return res.status(400).json({ success: false, error: "Request type is required." });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, error: "At least one item is required." });
        }

        const validItems = items.filter((i: any) => i.name?.trim() && i.qty > 0);
        if (!validItems.length) {
            return res.status(400).json({ success: false, error: "Items must have a valid name and quantity." });
        }

        const userId = Number(req.user?.sub);
        const newRequest = await requestService.create(userId, type.trim(), validItems);

        return res.status(201).json({
            success: true,
            message: "Request submitted successfully!",
            data: newRequest
        });
    } catch (error) {
        console.error("Create Request Error: ", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const deleteRequest = async (req: Request | any, res: Response): Promise<any> => {
    const { id } = req.params;
    try {
        const userId = Number(req.user?.sub);
        const deleted = await requestService.delete(Number(id), userId);

        return res.status(200).json({
            success: true,
            message: "Request deleted successfully!",
            data: deleted
        });
    } catch (error: any) {
        if (error.message === 'Request not found') {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error.message.includes('pending')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        console.error("Delete Request Error: ", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
