import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import * as z from 'zod';

import { db } from "@/lib/db";

// Define a schema for input validation
const userSchema = z
  .object({
    username: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must have than 8 characters'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })

export async function POST(
    req: Request,
) {
    try {
        const body = await req.json();
        const { email, username, password } = userSchema.parse(body);       // input validation

        // Check if the email is already exist
        const existingUserByEmail = await db.user.findUnique({
            where: {
                email
            }
        });
        
        // Check if the email is already exist
        const existingUserByUsername = await db.user.findUnique({
            where: {
                username
            }
        });

        if (existingUserByEmail || existingUserByUsername) {
            return new NextResponse("User already exist", { status: 409 })
        }

        // Hash the password
        const hashedPassword = await hash(password, 10);

        // Create a new user
        const newUser = await db.user.create({
            data: {
                email,
                username,
                password: hashedPassword
            }
        });

        // remove the password from the response
        const { password: newUserPassword, ...rest } = newUser;

        return NextResponse.json({ user: rest, message: 'User created successfully'}, { status: 201 });
    } catch (error) {
        console.error("[USER]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}