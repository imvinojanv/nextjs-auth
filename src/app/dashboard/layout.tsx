import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = cookies();
    const token = cookieStore.get('OutSiteJWT');

    if (!token) {
        return redirect('/sign-in');
    }

    try {
        const { value } = token;
        const secret = process.env.JWT_SECRET || "";

        const verified = verify(value, secret);
        // console.log("VERIFIED",verified);           // output: email
        // Fetch user data based on email from your database
    } catch (error) {
        console.log("VERIFY_ERROR:", error);
        return redirect('/sign-in');
    } finally{
        return (
            <main>
                {children}
            </main>
        );
    }
}
