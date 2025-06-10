import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

const embeddingModel = openai.embedding('text-embedding-ada-002');

// to create an embedding, you will start with a piece of source material (unknown length), break it down into smaller chunks, embed each chunk, and then save the chunk to the database. Let’s start by creating a function to break the source material into small chunks.
// This function will take an input string and split it by periods, filtering out any empty items. This will return an array of strings. It is worth experimenting with different chunking techniques in your projects as the best technique will vary 
const generateChunks = (input: string): string[] => {
    return input
        .trim()
        .split('.')
        .filter(i => i !== '');
};

export const generateEmbeddings = async (
    value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
    const chunks = generateChunks(value);
    const { embeddings } = await embedMany({
        model: embeddingModel,
        values: chunks,
    });
    // map over and return the embeddings in a format that is ready to save in the database
    return embeddings.map((e, i) => ({ content: chunks[i] ?? '', embedding: e }));
};

