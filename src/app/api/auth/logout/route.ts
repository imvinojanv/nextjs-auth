import { serialize } from "cookie";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        // Clear the cookie
        const serialized = serialize("OutSiteJWT", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: -1,
            path: "/",
        });

        return new NextResponse("Logged out!", {
            status: 200,
            headers: { "Set-Cookie": serialized },
        });
    } catch (error) {
        console.error("[USER_LOGOUT_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}