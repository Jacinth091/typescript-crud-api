import { Request, Response } from "express";
import { departmentService } from "./department.service";

export const getDepartmentList = async (req: Request, res: Response): Promise<any> => {
    try {
        const departmentList = await departmentService.getAll();

        if (departmentList.length <= 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No departments stored in the database."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Fetched Department List Successfully.",
            data: departmentList
        });
    } catch (error) {
        console.error("Internal Server Error! : ", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

export const getDepartmentById = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    try {
        const department = await departmentService.getById(Number(id));

        return res.status(200).json({
            success: true,
            message: "Department Successfully fetched!",
            data: department
        });
    } catch (error: any) {
        if (error.message === 'Department not found') {
            return res.status(404).json({ success: false, error: "No department found!" });
        }
        console.error("Internal Server Error!", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const createDepartment = async (req: Request, res: Response): Promise<any> => {
    const { name, description } = req.body;
    try {
        if (!name?.trim()) {
            return res.status(400).json({ success: false, error: "Department name is required." });
        }

        const department = await departmentService.create({
            name: name.trim(),
            description: description?.trim() || ''
        });

        return res.status(201).json({
            success: true,
            message: "Department created successfully!",
            data: department
        });
    } catch (error: any) {
        if (error.message.includes('already exists')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        console.error("Create Department Error: ", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const editDepartment = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const department = await departmentService.update(Number(id), {
            ...(name && { name: name.trim() }),
            ...(description !== undefined && { description: description.trim() })
        });

        return res.status(200).json({
            success: true,
            message: "Department updated successfully!",
            data: department
        });
    } catch (error: any) {
        if (error.message === 'Department not found') {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error.message.includes('already exists')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        console.error("Edit Department Error: ", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const deleteDepartment = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    try {
        const department = await departmentService.delete(Number(id));

        return res.status(200).json({
            success: true,
            message: "Department deleted successfully!",
            data: department
        });
    } catch (error: any) {
        if (error.message === 'Department not found') {
            return res.status(404).json({ success: false, error: error.message });
        }
        console.error("Delete Department Error: ", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
