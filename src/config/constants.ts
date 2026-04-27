
export enum ROLE {
	ADMIN = "ADMIN",
	USER = "USER",
}

export const ALLOWED_AUTH_PATHS = [
	"/v1/auth/login",
    "/v1/auth/register",
	"/v1/auth/logout",
];