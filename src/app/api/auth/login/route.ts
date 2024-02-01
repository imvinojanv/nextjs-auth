import { createToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { compare } from "bcrypt";
import { serialize } from "cookie";
import { sign } from "jsonwebtoken";
import { NextResponse } from "next/server";

const MAX_AGE = 60 * 60 * 24 * 30;         // 30 days

export async function POST(
    req: Request,
) {
    try {
        const body = await req.json();
        const { email, password } = body;

        // Check if the email is already exist
        const existingUserByEmail = await db.user.findUnique({
            where: {
                email
            }
        });

        if (!existingUserByEmail) {
            return new NextResponse("Email is not exist", { status: 409 });
        };

        // Check the password is correct
        const passwordMatch = await compare(password, existingUserByEmail.password);

        if (!passwordMatch) {
            return new NextResponse("Password does not match!", { status: 401 });
        }

        // Get the secret
        const secret = process.env.JWT_SECRET || "";

        // Sign the token
        // const token = sign(
        //     { email },
        //     secret,
        //     { expiresIn: MAX_AGE },
        // );
        const token = createToken({ email });

        // Serialize the token to cookie
        const serialized = serialize("OutSiteJWT", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: MAX_AGE,
            path: "/",
        });

        return new NextResponse("Authenticated!", { 
            status: 200,
            headers: { "Set-Cookie": serialized },
        });

    } catch (error) {
        console.error("[USER_LOGIN_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}