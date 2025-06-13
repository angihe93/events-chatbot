import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { getChatsDB } from "~/server/db/db";
import { chats } from "~/server/db/schema";
import { generateId } from 'ai'

// referencing post.ts
export const chatRouter = createTRPCRouter({
    list: protectedProcedure
        .input(z.void())
        .output(z.array(z.string()))
        .query(async ({ ctx, input }) => {
            const chats = await getChatsDB(ctx.user.id)
            return chats
            // would be nice to also return a preview of the chat, eg. last sent messages etc
        }),
    create: protectedProcedure
        .input(z.void())
        .output(z.string()) // created chat id
        .mutation(async ({ ctx }) => {
            const id = generateId()
            await ctx.db.insert(chats).values({
                id,
                userId: ctx.user.id
            })
            return id
        }),
})