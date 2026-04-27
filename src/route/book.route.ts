import { Router } from "express";
import * as controller from "../controller/book.controller.js"
const router = Router();

router.post("/",controller.create)
router.get("/",controller.getAll)
router.get("/:id",controller.getOne)
router.put("/:id",controller.update)
router.delete("/:id",controller.remove)
router.post("/create-order",controller.createOrder);
router.post("/verify-payment",controller.verifyOrder);

export default router;
