import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { z } from "zod";
import { env } from "../config/env.js";
import prisma from "../config/prisma.js";
import type { loginSchema, RegisterSchema } from "../validations.js";

const login = async ({ email, password }: z.infer<typeof loginSchema>) => {
	const user = await prisma.user.findUnique({
		where: { email },
		select: { id: true, password: true,role:true },
	});
	if (!user) {
		return null;
	}
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		return null;
	}
	console.log(user.role);
	const accessToken = jwt.sign(
		{ id: user.id, role:  user.role},
		env.JWT_SECRET,
	);
	return accessToken;
};
const register = async (Values: z.infer<typeof RegisterSchema>) => {
	const existingUser = await prisma.user.findUnique({
		where: { email: Values.email },
	});

	if (existingUser) {
		return null;
	}

	const hashedPassword = await bcrypt.hash(Values.password, 10);

	const newUser = await prisma.user.create({
		data: {
			name:Values.name,
			email: Values.email,
			password: hashedPassword,
			role: Values.role ?? "USER",
		},
		select: {
			name:true,
			id: true,
			email: true,
			role: true,
		},
	});

	return newUser;
};

export const authService = {
	login,
	register
};
