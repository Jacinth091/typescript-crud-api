import express from "express";
import { guestContent } from "./public.controller";

const router = express.Router();

router.get("/guest", guestContent);
export default router;
