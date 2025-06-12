import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "~/server/db"
import { nextCookies } from "better-auth/next-js"
import { schema } from "~/server/db/schema"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    emailAndPassword: {
        enabled: true
    },
    // socialProviders: { 
    //     github: { 
    //        clientId: process.env.GITHUB_CLIENT_ID as string, 
    //        clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
    //     }, 
    // }, 

    // the nextCookies plugin will automatically set cookies for you whenever a Set-Cookie header is present in the response
    plugins: [nextCookies()] // make sure this is the last plugin in the array
})