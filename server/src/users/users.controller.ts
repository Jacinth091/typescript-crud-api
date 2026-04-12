import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Role } from '../helpers/role';
import { validateRequest } from '../middleware/validateRequest';
import { userService } from './user.service';
import { UserCreationAttributes } from './user.model';

export const getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
        const users = await userService.getAll();
        return res.status(200).json({ success: true, message: "Users fetched successfully!", data: users });
    } catch (error) {
        console.error("Error fetching users: ", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}

// async function getById(req: Request, res: Response, next: NextFunction): void {
//     userService.getById(Number(req.params.id))
//         .then((user) => res.json(user))
//         .catch(next);
// }

export const getUserById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
        const user = await userService.getById(Number(id));
        if (!user) {
            return res.status(404).json({ success: false, error: "User not Found!" });
        }
        const { passwordHash, ...safeUser } = user.get({ plain: true });
        return res.status(200).json({ success: true, message: "User Found Successfully!", data: safeUser });
    } catch (error) {
        console.error("An Error Occurred fetching user: ", error);
        return res.status(500).json({ success: false, error: "Internal Server Error!" });
    }
};




// async function create(req: Request, res: Response, next: NextFunction): void {
//     userService.create(req.body)
//         .then(() => res.json({ message: 'User created successfully' }))
//         .catch(next);
// }

export const createAccount = async (req: Request, res: Response): Promise<Response> => {
    const { formData } = req.body;
    try {
        const newUser: UserCreationAttributes = {
            firstName: formData.firstName.trim(),
            middleName: formData.middleName ? formData.middleName.trim() : undefined,
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            username: formData.username.trim(),
            passwordHash: "", // Will be set in service
            title: formData.title.trim(),
            role: formData.role.trim(),
            verified: formData.verified || false,
        }
        const user = await userService.create({ ...newUser, password: formData.password.trim() });
        if (!user) {
            return res.status(403).json({ success: false, error: "User Not Created." });
        }
        return res.status(200).json({ success: true, message: "User Created Successfully" });
    } catch (error: any) {
        console.error("Create Function: ", error);
        return res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
    }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { formData } = req.body;
    try {
        const user = await userService.getById(Number(id));
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found." });
        }

        if (formData.email && formData.email !== user.email) {
            const emailTaken = await userService.findByEmail(formData.email);
            if (emailTaken) {
                return res.status(400).json({ success: false, error: "Email is already taken." });
            }
        }

        if (formData.username && formData.username !== user.username) {
            const usernameTaken = await userService.findByUsername(formData.username);
            if (usernameTaken) {
                return res.status(400).json({ success: false, error: "Username is already taken." });
            }
        }

        const updateParams: any = {};
        if (formData.firstName) updateParams.firstName = formData.firstName.trim();
        if (formData.middleName !== undefined) updateParams.middleName = formData.middleName ? formData.middleName.trim() : null;
        if (formData.lastName) updateParams.lastName = formData.lastName.trim();
        if (formData.email) updateParams.email = formData.email.trim();
        if (formData.username) updateParams.username = formData.username.trim();
        if (formData.role) updateParams.role = formData.role.trim();
        if (formData.verified !== undefined) updateParams.verified = formData.verified;
        if (formData.title) updateParams.title = formData.title.trim();
        if (formData.password) updateParams.password = formData.password.trim();

        const updatedUser = await userService.update(Number(id), updateParams);
        if (!updatedUser) {
            return res.status(403).json({ success: false, error: "User Not Updated." })
        }
        return res.status(200).json({ success: true, message: "User Updated Successfully" });

    } catch (error: any) {
        console.error("Update User Controller: ", error);
        return res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
    }
}

// function _delete(req: Request, res: Response, next: NextFunction): void {
//     userService.delete(Number(req.params.id))
//         .then(() => res.json({ message: "User deleted successfully!" }))
//         .catch(next);
// }

export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
        const deleteUser = await userService.delete(Number(id));
        if (!deleteUser) {
            return res.status(403).json({ success: false, error: "User Not Deleted." })
        }
        return res.status(200).json({ success: true, message: "User Deleted Successfully" });
    } catch (error) {
        console.error("Delete User Controller: ", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}

export function createSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        formData: Joi.object({
            title: Joi.string().required(),
            firstName: Joi.string().required(),
            middleName: Joi.string().allow(null, '').optional(),
            lastName: Joi.string().required(),
            role: Joi.string().valid(Role.Admin, Role.User).default(Role.User),
            verified: Joi.bool().optional().default(false),
            email: Joi.string().email().required(),
            username: Joi.string().required(),
            password: Joi.string().min(6).required(),
            confirmPassword: Joi.string().valid(Joi.ref('password')).required()
        }).required()
    });
    validateRequest(req, next, schema);
}

export function updateSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        formData: Joi.object({
            title: Joi.string().empty(''),
            firstName: Joi.string().empty(''),
            middleName: Joi.string().allow(null, '').empty(''),
            lastName: Joi.string().empty(''),
            role: Joi.string().valid(Role.Admin, Role.User).empty(''),
            email: Joi.string().email().empty(''),
            username: Joi.string().empty(''),
            verified: Joi.bool(),
            password: Joi.string().min(6).empty(''),
            confirmPassword: Joi.string().valid(Joi.ref('password')).empty('')
        }).required()
    });
    validateRequest(req, next, schema);
}


