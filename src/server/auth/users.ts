"use server";
import { auth } from "~/lib/auth"

export const signIn = async (email: string, password: string) => {
    try {
        await auth.api.signInEmail({
            body: {
                email,
                password
            }
        })
        console.log("signed in")
        return {
            success: true,
            message: "Signed in successfully"
        }
    }
    catch (error) {
        const e = error as Error
        console.log("Error signing in", error)
        return {
            success: false,
            message: e.message || "an unknown error occurred"
        }
    }
}

export const signUp = async () => {
    await auth.api.signUpEmail({
        body: {
            email: "user@email.com",
            password: "password",
            name: "Orc Dev"
        }
    })
}