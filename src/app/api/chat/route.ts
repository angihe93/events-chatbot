import { openai } from '@ai-sdk/openai';
import { streamText, appendResponseMessages, appendClientMessage, createIdGenerator, type Message } from 'ai';
import { loadChat, saveChat } from '../../../tools/chat-store';
import { z } from 'zod'
import { DateType, type EventSearchParams } from '~/lib/eventsApiTypes';
import getEvents from '~/lib/eventsApi';
import { createResource } from '~/lib/actions/resources';
// import { type NewResourceParams, insertResourceSchema } from "~/server/db/schema";
import { findRelevantContent } from '~/lib/ai/embedding';
import { auth } from '~/lib/auth';
import { headers } from 'next/headers';
import { getSetApiQueryPage } from '~/server/db/db';
import { streamObject } from 'ai';


// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const tools = {
    searchEvents: {
        description: `call the getEvents API and return results to the user, make sure to include any location information in the query field of parameters (eg. make sure to include location abbreviations like nyc).
        when you return the result list for each event, include name, description, date, location, link, in that order`,
        parameters: z.object({
            start: z.number().optional(),
            query: z.string(),
            date: z.nativeEnum(DateType).optional(),
            is_virtual: z.boolean().optional(),
        }),
        execute: async (parameters: EventSearchParams) => {
            // console.log(parameters)
            const session = await auth.api.getSession({
                headers: await headers(),
            });
            let userId
            if (session?.user) {
                console.log("session.user.id", session.user.id)
                userId = session.user.id
            }
            // query DB and see if user has asked this query before in the last day
            // if so, increment start page in api call
            // TODO: may want to split get & set and increment query only page after successful getEvents call
            // TODO: handle running out of pages in results
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            const queryPage = await getSetApiQueryPage(userId!, parameters.query, parameters.date !== undefined ? DateType[parameters.date] : "")

            // console.log("searchEvents params", parameters)
            const responseList = []
            const sendParams = {
                ...parameters,
                start: queryPage * 10,
                ...(parameters.date !== undefined && { date: DateType[parameters.date] })
                // date: parameters.date !== undefined ? DateType[parameters.date] : undefined
            };
            // console.log("searchEvents paramsToSend", sendParams)
            console.log("parameters", parameters)
            console.log("sendParams", sendParams)
            const result = await getEvents(sendParams)

            const returnResult = { ...result, data: result.data.map(event => ({ name: event.name, description: event.description, date_human_readable: event.date_human_readable, link: event.link, full_address: event.venue.full_address })) }
            for (const item of returnResult.data)
                responseList.push(item)

            console.log("responseList.length", responseList.length) // 99 for 10 pages
            console.log("responseList.slice(0,10)", responseList.slice(0, 10))

            return responseList
        }
    },
    // addResource: {
    //     description: `add a resource to your knowledge base.
    //       If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
    //     parameters: z.object({
    //         content: z
    //             .string()
    //             .describe('the content or resource to add to the knowledge base'),
    //     }),
    //     execute: async ({ content }: { content: string }) => createResource({ content }),
    // },
    // getInformation: {
    //     description: `get information from your knowledge base to answer questions.`,
    //     parameters: z.object({
    //         question: z.string().describe('the users question'),
    //     }),
    //     execute: async ({ question }: { question: string }) => findRelevantContent(question),
    // },
}


function errorHandler(error: unknown) {
    if (error == null) {
        return 'unknown error';
    }

    if (typeof error === 'string') {
        return error;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return JSON.stringify(error);
}

export async function POST(req: Request) {

    // Get user authentication status
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        console.log("User not authenticated, redirecting to login");
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Log authentication status
    console.log('=== POST CHAT API REQUEST AUTH STATUS ===');
    if (session?.user) {
        console.log('✅ User authenticated:', {
            userId: session.user.id,
            email: session.user.email,
            name: session.user.name,
            timestamp: new Date().toISOString(),
        });
    } else {
        console.log('❌ User not authenticated', {
            timestamp: new Date().toISOString(),
        });
    }
    console.log('==================================');


    // const { messages, id } = await req.json() //as { messages: CoreMessage[] }
    // get the last message from the client:
    // const { message_, id_ } = await req.json();
    // console.log(message_)
    let body: unknown;
    try { // works for tutorial 2 format
        console.log("try")
        body = await req.json();
        if (
            typeof body !== "object" ||
            body === null ||
            !("message" in body) ||
            !("id" in body) ||
            typeof (body as Record<string, unknown>).id !== "string" ||
            typeof (body as Record<string, unknown>).message !== "object"
        ) {
            throw new Error("Invalid request body");
        }
        const { message, id } = body as { message: Message; id: string };
        // const { message, id } = await req.json() as { message: Message; id: string };
        console.log(typeof message, message)
        if (typeof id !== "string") {
            throw new Error("Invalid id")
            // return new Response("Invalid id", { status: 400 });
        }

        if (typeof message !== "object") {
            throw new Error("Invalid message")
            // return new Response("Invalid message", { status: 400 });

        }

        // load the previous messages from the server:
        const previousMessages = await loadChat(id);

        // append the new message to the previous messages:
        const messages = appendClientMessage({
            messages: previousMessages,
            message,
        });

        // test

        // const { partialObjectStream } = streamObject({
        // const result1 = streamObject({
        //     model: openai('gpt-4-turbo'),
        //     schema: z.object({
        //         recipe: z.object({
        //             name: z.string(),
        //             ingredients: z.array(z.string()),
        //             steps: z.array(z.string()),
        //         }),
        //     }),
        //     prompt: 'Generate a lasagna recipe.',
        // });

        // // for await (const partialObject of partialObjectStream) {
        // //     console.clear();
        // //     console.log(partialObject);
        // // }
        // return result1.toTextStreamResponse();

        const result = streamText({
            // model: openai('gpt-4-turbo'),
            model: openai('gpt-4o'), // this model seems to work better with the new searchEvents description
            // model: openai('o4-mini-2025-04-16'),
            // model: openai('gpt-4o-mini'),
            // system: 'You are a helpful assistant.',
            // system: "You are an event promoter with an encyclopedic knowledge of the different events happening in any given location and a penchant for knowing what a person will like. You are being asked by the user to recommend events that they will enjoy. The user will set parameters for what they are looking for, such as location, type of event (i.e. art gallery exhibition, concert, food festival, etc.) Be sure to confirm that the location of the query matches up with the results that you provide.",
            // system:
            // `You are a helpful assistant. Check your knowledge base before answering any questions.
            // Only respond to questions using information from tool calls.
            // if no relevant information is found in the tool calls, respond, "Sorry, I don't know."
            // When you invoke the searchEvents tool, make sure you include any location information from user's text into the query field`,
            system:
                `You are a helpful assistant, armed with a Get Events tool that will let you know about the events that are happening so you can answer user's query about events around a certain location in a certain timeframe if given. 
            When you invoke the searchEvents tool, make sure to include any location and date information from user's text into the query field.
            When user asks the same question about events, please invoke the tool again. 
            When responding to user with the event results, make sure the events match up with what the user is looking for in their query.
            When you return the result list for each event, include name, description, date, location, link, in that order.
            When you return the markdown result in text, please stick to one format so my button rendering logic in chat.tsx would work and not throw runtime errors.
            Don't include ::mark when rendering <li>
            Explain your reasoning. At the end of your event suggestions response, always ask user if they would like more suggestions`,
            messages: messages,
            async onFinish({ response }) {
                await saveChat({
                    id,
                    messages: appendResponseMessages({
                        messages,
                        responseMessages: response.messages,
                    }),
                });
            },
            // id format for server-side messages:
            experimental_generateMessageId: createIdGenerator({
                prefix: 'msgs',
                size: 16,
            }),
            tools: tools,
            toolCallStreaming: true,
            maxSteps: 5
        });

        // consume the stream to ensure it runs to completion & triggers onFinish
        // even when the client response is aborted:
        void result.consumeStream(); // no await

        return result.toDataStreamResponse({
            sendReasoning: true, // Some models such as as DeepSeek deepseek-reasoner and Anthropic claude-3-7-sonnet-20250219 support reasoning tokens
            getErrorMessage: errorHandler
        })

    } catch (error) { // works for tutorial 1 format
        console.log("catch")
        console.error(error);
        // const messages = Array.isArray(body?.messages) ? body.messages : [];
        const messages =
            typeof body === "object" &&
                body !== null &&
                "messages" in body &&
                Array.isArray((body as Record<string, unknown>).messages)
                ? (body as { messages: Message[] }).messages
                : [];
        // const { messages } = await req.json() as { messages: CoreMessage[] }
        console.log(typeof messages, messages)
        const result = streamText({
            // model: openai('gpt-4-turbo'),
            model: openai('gpt-4o'),
            system: 'You are a helpful assistant.',
            messages: messages,
            tools: tools,
            toolCallStreaming: true,
            maxSteps: 5
        });

        return result.toDataStreamResponse({
            sendReasoning: true, // Some models such as as DeepSeek deepseek-reasoner and Anthropic claude-3-7-sonnet-20250219 support reasoning tokens
            getErrorMessage: errorHandler
        });

    }
}
