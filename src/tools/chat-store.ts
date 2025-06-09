import { generateId } from 'ai';
import { existsSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { type Message } from '@ai-sdk/react';

// Our example chat store implementation uses files to store the chat messages. In a real-world application, you would use a database or a cloud storage service, and get the chat ID from the database. That being said, the function interfaces are designed to be easily replaced with other implementations.

export async function createChat(): Promise<string> {
    const id = generateId(); // generate a unique chat ID
    await writeFile(getChatFile(id), '[]'); // create an empty chat file
    return id;
}

function getChatFile(id: string): string {
    const chatDir = path.join(process.cwd(), '.chats');
    if (!existsSync(chatDir)) mkdirSync(chatDir, { recursive: true });
    return path.join(chatDir, `${id}.json`);
}

export async function loadChat(id: string): Promise<Message[]> {
    return JSON.parse(await readFile(getChatFile(id), 'utf8'));
}

export async function saveChat({
    id,
    messages,
}: {
    id: string;
    messages: Message[];
}): Promise<void> {
    const content = JSON.stringify(messages, null, 2);
    await writeFile(getChatFile(id), content);
}
