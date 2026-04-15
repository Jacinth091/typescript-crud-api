import express from "express";
import { getEmployeeList, getEmployeeById, addNewEmployee, editEmployee, deleteEmployee } from './employee.controller';
// @ts-ignore
import { authenticate } from "middleware/auth.middleware";
import { authorize } from "middleware/role.middleware";
import { Role } from "helpers/role";

const router = express.Router();

router.get('/', authenticate, authorize(Role.Admin), getEmployeeList);
router.post('/', authenticate, authorize(Role.Admin), addNewEmployee);
router.get('/:id', authenticate, authorize(Role.Admin), getEmployeeById);
router.patch('/:id', authenticate, authorize(Role.Admin), editEmployee);
router.delete('/:id', authenticate, authorize(Role.Admin), deleteEmployee);

export default router;
