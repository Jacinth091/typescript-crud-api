import express from "express";
// @ts-ignore
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { getDepartmentList, getDepartmentById, createDepartment, editDepartment, deleteDepartment } from "./department.controller";
import { Role } from "helpers/role";

const router = express.Router();

router.get('/', authenticate, authorize(Role.Admin), getDepartmentList);
router.get('/:id', authenticate, authorize(Role.Admin), getDepartmentById);
router.post('/', authenticate, authorize(Role.Admin), createDepartment);
router.patch('/:id', authenticate, authorize(Role.Admin), editDepartment);
router.delete('/:id', authenticate, authorize(Role.Admin), deleteDepartment);

export default router;
