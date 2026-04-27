import type { Request, Response } from "express";
import { authService } from "../service/auth.service.js";
import { loginSchema,RegisterSchema } from "../validations.js";
const login = async (req: Request, res: Response) => {
	const { success, data } = loginSchema.safeParse(req.body);
	if (!success) {
		return res
			.status(400)
			.json({ status: "error", message: "Invalid credentials format" });
	}

	const accessToken = await authService.login(data);
	if (!accessToken) {
		return res
			.status(401)
			.json({ status: "error", message: "Invalid credentials" });
	}

	const currDate = new Date();

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		path: "/",
		secure: false,
		sameSite: "lax",
		expires: new Date(currDate.setFullYear(currDate.getFullYear() + 1)),
	});

	return res
		.status(200)
		.json({ status: "success", message: "Logged in successfully" });
};
const logout = (_: Request, res: Response) => {
	res.clearCookie("accessToken");

	return res
		.status(200)
		.json({ status: "success", message: "Logged out successfully" });
};
const register = async (req: Request, res: Response) => {
	const { success, data } = RegisterSchema.safeParse(req.body);

	if (!success) {
		return res.status(400).json({
			status: "error",
			message: "Invalid registration data",
		});
	}

	const user = await authService.register(data);

	if (!user) {
		return res.status(409).json({
			status: "error",
			message: "User already exists",
		});
	}

	return res.status(201).json({
		status: "success",
		message: "User registered successfully",
	});
};


export const authController = {
	login,
	logout,
	register
};
