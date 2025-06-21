import { openai } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";
import { NextResponse } from 'next/server';
import { setChatSlugDB } from "~/server/db/db";

export async function POST(req: Request) {
    try {
        const { chatId, message } = await req.json()
        console.log("slug input message", message)
        const result = await generateText({
            model: openai('gpt-4o-mini'),
            prompt:
                `Summarize the below chat message into a few short words to be used as a readable chat slug.
                If it's not meaningful enough to be a slug, return "".
                Message: ${message}
                `
        })
        const slug = result.text
        console.log("generated slug", slug)
        if (slug !== "") { // update slug field in db
            await setChatSlugDB(chatId, slug)
        }
        return NextResponse.json({ slug });
    } catch (error) {
        console.error("Error generating slug:", error);
        return NextResponse.json({ status: 500 });
    }
}
