import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { getChatsDB, getChatSlugDB, getChatTimeDB, loadChatDB } from "~/server/db/db";
import { chats } from "~/server/db/schema";
import { generateId } from 'ai'
import { type Message } from '@ai-sdk/react'

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

    listWithSlug: protectedProcedure
        .input(z.void())
        .query(async ({ ctx, input }) => {
            type ChatSlugMap = {
                id: string;
                slug: string;
            }
            const chatSlugMap: ChatSlugMap[] = []
            const chats = await getChatsDB(ctx.user.id)

            for (const id of chats) {
                const slug = await getChatSlugDB(id) as string
                chatSlugMap.push({ id, slug })
            }
            return chatSlugMap
        }),

    listWithTime: protectedProcedure
        .input(z.void())
        .query(async ({ ctx, input }) => {
            type ChatTimeMap = {
                id: string;
                createdAt: Date;
            }
            const chatTimeMap: ChatTimeMap[] = []
            const chats = await getChatsDB(ctx.user.id)

            for (const id of chats) {
                const createdAt = await getChatTimeDB(id)
                chatTimeMap.push({ id, createdAt })
            }
            return chatTimeMap
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

    load: protectedProcedure
        .input(z.object({ chatId: z.string() }))
        .query(async ({ ctx, input }) => {
            const userChats = await getChatsDB(ctx.user.id)
            if (!userChats.includes(input.chatId)) {
                return {
                    success: false,
                    error: 'user does not have access to this chat'
                }
            }
            const messages = await loadChatDB(input.chatId) as Message[]
            return {
                success: true,
                messages
            }
        }),

    getSlug: protectedProcedure
        .input(z.object({ chatId: z.string() }))
        .query(async ({ ctx, input }) => {
            const slug = await getChatSlugDB(input.chatId) as string
            return slug
        })
})
