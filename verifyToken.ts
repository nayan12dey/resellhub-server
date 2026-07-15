import { Request, Response, NextFunction } from "express";
// import { jwtVerify, createRemoteJWKSet } from "jose";

export interface AuthenticatedRequest extends Request {
    user?: any;
}

// const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL!;


// const JWKS = createRemoteJWKSet(
//     new URL(`${process.env.BETTER_AUTH_URL}/api/auth/jwks`)
// );

// let JWKS: ReturnType<typeof createRemoteJWKSet> | null = null;

// function getJWKS() {

//     if (JWKS) {
//         return JWKS;
//     }

//     const authUrl = process.env.BETTER_AUTH_URL;

//     if (!authUrl) {
//         throw new Error("BETTER_AUTH_URL is missing");
//     }

//     JWKS = createRemoteJWKSet(
//         new URL(`${authUrl}/api/auth/jwks`)
//     );

//     return JWKS;
// }


let jose: typeof import("jose") | null = null;

const getJose = async () => {
    if (!jose) {
        jose = await import("jose");
    }
    return jose;
};

let JWKS: any = null;

const getJWKS = async () => {
    if (JWKS) return JWKS;

    const authUrl = process.env.BETTER_AUTH_URL;

    if (!authUrl) {
        throw new Error("BETTER_AUTH_URL is missing");
    }

    const { createRemoteJWKSet } = await getJose();

    JWKS = createRemoteJWKSet(
        new URL(`${authUrl}/api/auth/jwks`)
    );

    return JWKS;
};



export const verifyToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {

    const authHeader = req.headers.authorization;
    // console.log(authHeader, "authHeader")
    console.log("Authorization", authHeader)

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    const token = authHeader.split(" ")[1];
    console.log(token, "token")

    console.log("BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL);

    console.log(
        "JWKS URL:",
        `${process.env.BETTER_AUTH_URL}/api/auth/jwks`
    );

    try {

        // const { payload } = await jwtVerify(token, JWKS);

        // const { payload } = await jwtVerify(
        //     token,
        //     getJWKS()
        // );

        const { jwtVerify } = await getJose();

        const { payload } = await jwtVerify(
            token,
            await getJWKS()
        );

        console.log("JWT VERIFIED SUCCESSFULLY");
        console.log(payload);

        req.user = payload;

        next();

    } catch (error) {

        console.error("========== JWT VERIFY ERROR ==========");

        console.error(error);


        if (error instanceof Error) {
            console.error("Message:", error.message);
            console.error("Name:", error.name);
            console.error("Stack:", error.stack);
        }

        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token",
        });

    }
};



