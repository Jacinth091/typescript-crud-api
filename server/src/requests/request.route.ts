import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { getRequestList, createRequest, deleteRequest } from "./request.controller";
import { Role } from "helpers/role";

const router = express.Router();

router.get("/", authenticate, authorize(Role.User), getRequestList);
router.post("/", authenticate, authorize(Role.User), createRequest);
router.delete("/:id", authenticate, authorize(Role.User), deleteRequest);

export default router;
