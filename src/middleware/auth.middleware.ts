import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {ALLOWED_AUTH_PATHS,
} from "../config/constants.js";
import { env } from "../config/env.js";
import { cookiesSchema, jwtPayloadSchema } from "../validations.js";

export const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (ALLOWED_AUTH_PATHS.includes(req.path)) return next();

	const cookieValidation = cookiesSchema.safeParse(req.cookies);
	if (!cookieValidation.success) {
		return res.status(401).json({ status: "error", message: " cookiue Unauthorised" });
	}

	let decoded: string | jwt.JwtPayload;
	try {
		decoded = jwt.verify(cookieValidation.data.accessToken, env.JWT_SECRET);
	} catch(e) {
		return res.status(401).json({ status: "error", message:  " decodedUnauthorised" });
	}
	const payloadValidation = jwtPayloadSchema.safeParse(decoded);
	if (!payloadValidation.success) {
		return res.status(401).json({ status: "error", message: " payload Unauthorised" });
	}
	req.user = payloadValidation.data;; 
	const isAdmin = req.user.role === "ADMIN";
	const adminOnlyRoutes = [
  { path: "/v1/product", method: "POST" },      
  { path: "/v1/product", method: "PUT" },       
  { path: "/v1/product", method: "DELETE" },    
];

// Check if current request matches restricted routes
const isRestricted = adminOnlyRoutes.some(
  (route) =>
    req.path.startsWith(route.path) &&
    req.method === route.method
);

if (isRestricted && !isAdmin) {
  return res.status(403).json({
    status: "error",
    message: "Forbidden: Admins only",
  });
}
	return next();
};
