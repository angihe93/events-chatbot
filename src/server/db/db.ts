import { db } from '~/server/db';
import { chat_messages, chats, events_query_daily } from '~/server/db/schema';
import { eq, and } from 'drizzle-orm'
import { type Message } from '@ai-sdk/react';

export async function createChatDB(id: string, userId: string): Promise<typeof chats.$inferSelect> {
    const chat: typeof chats.$inferInsert = {
        id: id,
        userId: userId
    }
    await db.insert(chats).values(chat)
    const [getChat] = await db.select().from(chats).where(eq(chats.id, id));
    if (!getChat) {
        throw new Error(`Chat with id ${id} not found after insertion.`);
    }
    return getChat;
}

export async function findChatDB(userId: string): Promise<string | null> {
    const getChat = await db.select().from(chats).where(eq(chats.userId, userId))
    if (!getChat.length) return null
    else return getChat[0]!.id
}

export async function getChatsDB(userId: string): Promise<string[]> {
    const getChats = await db.select({ id: chats.id }).from(chats).where(eq(chats.userId, userId))
    return getChats.map((i) => i.id)
}

export async function loadChatDB(id: string): Promise<typeof chat_messages.$inferSelect[]> {
    const getMessages = await db.select().from(chat_messages).where(eq(chat_messages.chatId, id))
    if (!getMessages) {
        throw new Error(`Chat with id ${id} not found after insertion.`);
    }
    return getMessages
}

export async function saveChatDB(id: string, messages: Message[]) {
    for (const m of messages) {
        const message: typeof chat_messages.$inferInsert = {
            id: m.id,
            role: m.role,
            content: m.content,
            parts: m.parts,
            chatId: id
        }
        try {
            await db.insert(chat_messages).values(message);
        } catch (error: unknown) {
            // Check for duplicate primary key error (Postgres: '23505')
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                (error as { code?: unknown }).code === "23505"
            ) {
                continue;
            }
            throw error;
        }
    }
}

export async function getSetApiQueryPage(userId: string, query: string, date: string) {
    const getQuery = await db.select()
        .from(events_query_daily)
        .where(
            and(
                eq(events_query_daily.userId, userId),
                eq(events_query_daily.query, query),
                eq(events_query_daily.date, date)
            ))
    if (getQuery.length === 0) {
        const queryItem: typeof events_query_daily.$inferInsert = {
            userId,
            query,
            date
        }
        await db.insert(events_query_daily).values(queryItem)
        return 0
    } else {
        const now = new Date();
        const createdAt = new Date(getQuery[0]!.queryCreatedAt);
        const diffMs = now.getTime() - createdAt.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours < 24) {
            // increment page
            const newPage = (getQuery[0]!.lastQueryPage) + 1;
            await db.update(events_query_daily)
                .set({ lastQueryPage: newPage })
                .where(eq(events_query_daily.id, getQuery[0]!.id))
            return newPage
        } else {
            // set createdAt to now, and page to 0
            await db.update(events_query_daily)
                .set({ lastQueryPage: 0, queryCreatedAt: now })
                .where(eq(events_query_daily.id, getQuery[0]!.id));
            return 0
        }
    }
}