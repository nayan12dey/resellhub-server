import { Request, Response, NextFunction } from "express";
import { jwtVerify, createRemoteJWKSet } from "jose";

export interface AuthenticatedRequest extends Request {
    user?: any;
}

// const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL!;


// const JWKS = createRemoteJWKSet(
//     new URL(`${process.env.BETTER_AUTH_URL}/api/auth/jwks`)
// );

let JWKS: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {

    if (JWKS) {
        return JWKS;
    }

    const authUrl = process.env.BETTER_AUTH_URL;

    if (!authUrl) {
        throw new Error("BETTER_AUTH_URL is missing");
    }

    JWKS = createRemoteJWKSet(
        new URL(`${authUrl}/api/auth/jwks`)
    );

    return JWKS;
}



export const verifyToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {

    const authHeader = req.headers.authorization;
    console.log(authHeader, "authHeader")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        // const { payload } = await jwtVerify(token, JWKS);

        const { payload } = await jwtVerify(
            token,
            getJWKS()
        );

        req.user = payload;

        next();

    } catch (error) {

        console.error(error);

        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token",
        });

    }
};