import { Request, Response } from "express";
import { employeeService } from "./employee.service";
import { db } from "../helpers/db";

export const getEmployeeList = async (req: Request, res: Response): Promise<any> => {
    try {
        const employeeList = await employeeService.getAll();

        if (employeeList.length <= 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No employees in the database."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Fetched Employee List Successfully.",
            data: employeeList
        });
    } catch (error) {
        console.error("Internal Server Error! : ", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

export const getEmployeeById = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    try {
        const employee = await employeeService.getById(Number(id));

        return res.status(200).json({
            success: true,
            message: "Employee Successfully fetched!",
            data: employee
        });
    } catch (error: any) {
        if (error.message === 'Employee not found') {
            return res.status(404).json({ success: false, error: "No employee found!" });
        }
        console.error("Internal Server Error!", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const addNewEmployee = async (req: Request, res: Response): Promise<any> => {
    const { email, position, department_id, hire_date } = req.body;
    try {
        if (!email?.trim()) return res.status(400).json({ message: "Email should not be empty." });
        if (!position?.trim()) return res.status(400).json({ message: "Position should not be empty." });
        if (!department_id) return res.status(400).json({ message: "Please select a department." });
        if (!hire_date?.trim()) return res.status(400).json({ message: "Please enter a hire date." });

        const hireDate = new Date(hire_date);
        if (isNaN(hireDate.getTime())) return res.status(400).json({ message: "Please enter a valid hire date." });

        const todayDateStr = new Date().toLocaleDateString("en-CA");
        if (hire_date > todayDateStr) return res.status(400).json({ message: "Hire date cannot be in the future." });

        // Look up user by email
        const user = await db.User.findOne({ where: { email: email.trim() } });
        if (!user) return res.status(404).json({ message: "User not found!" });

        // Verify department exists
        const department = await db.Department.findByPk(Number(department_id));
        if (!department) return res.status(404).json({ message: "Department not found!" });

        const newEmployee = await employeeService.create({
            userId: user.id,
            departmentId: Number(department_id),
            position: position.trim(),
            hireDate: hire_date,
        });

        return res.status(201).json({
            success: true,
            message: "Employee added successfully!",
            data: newEmployee,
        });
    } catch (error: any) {
        console.error("An error occurred: ", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const editEmployee = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const { email, position, department_id, hire_date } = req.body;
    try {
        const updateData: any = {};

        if (email) {
            const user = await db.User.findOne({ where: { email: email.trim() } });
            if (!user) return res.status(404).json({ success: false, error: "No account found with that email." });
            updateData.userId = user.id;
        }
        if (position) updateData.position = position.trim();
        if (department_id) updateData.departmentId = Number(department_id);
        if (hire_date) updateData.hireDate = hire_date;

        const employee = await employeeService.update(Number(id), updateData);

        return res.status(200).json({
            success: true,
            message: "Employee Updated Successfully!",
            data: employee
        });
    } catch (error: any) {
        if (error.message === 'Employee not found') {
            return res.status(404).json({ success: false, error: error.message });
        }
        console.error("Edit Employee Error: ", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteEmployee = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const employee = await employeeService.delete(Number(id));

        return res.status(200).json({
            success: true,
            message: "Employee Deleted Successfully!",
            data: employee
        });
    } catch (error: any) {
        if (error.message === 'Employee not found') {
            return res.status(404).json({ success: false, error: error.message });
        }
        console.error("Delete Employee Error: ", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
