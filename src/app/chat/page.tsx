'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Logout } from '~/components/logout';
import Chat from '~/components/ui/chat';
import { api } from "~/trpc/react"
import { useRouter } from 'next/navigation'
import { Bookmark } from 'lucide-react';


// Simple Spinner component, can replace later
// function Spinner() {
//     return <span>Loading...</span>;
// }

export default function Page() {
    const { error } = useChat({
        onFinish: (message, { usage, finishReason }) => {
            console.log('Finished streaming message:', message);
            console.log('Token usage:', usage);
            console.log('Finish reason:', finishReason);
        },
        onError: error => {
            console.error('An error occurred:', error);
        },
        onResponse: response => {
            console.log('Received HTTP response from server:', response);
        },
    });
    console.log(error)

    // const handleDelete = (id: string) => {
    //     // can think of messages and setMessages as a pair of state and setState in React
    //     setMessages(messages.filter(message => message.id !== id))
    // }

    // custom input,  use more granular APIs like setInput and append with your custom input and submit button components: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot#controlled-input
    // https://ai-sdk.dev/docs/ai-sdk-ui/chatbot#custom-headers-body-and-credentials
    // https://ai-sdk.dev/docs/ai-sdk-ui/chatbot#image-generation
    // https://ai-sdk.dev/docs/ai-sdk-ui/chatbot#attachments-experimental

    // test hello procedure in src/server/api/routers/post.ts
    const trpcHelloResult = api.post.hello.useQuery({ text: 'world' })
    const chatIds = api.chat.list.useQuery()

    // referencing post.tsx
    const [selectedChat, setSelectedChat] = useState('')

    const createChat = api.chat.create.useMutation({
        onSuccess: async (data) => {
            setSelectedChat(data)
            console.log(`created chat ${data}`)
        },
    });

    const { data: chatData, isLoading: isChatLoading } = api.chat.load.useQuery(
        { chatId: selectedChat ?? "" },
        { enabled: !!selectedChat } // only run query if selectedChat is set
    );

    const router = useRouter()

    return (
        <div className="bg-muted flex flex-col">
            {/* Fixed top bar */}
            <div></div>
            <div className="bg-gray-200 fixed top-0 left-0 right-0 w-full flex justify-between items-center px-6 z-50 h-16">
                {/* Saved Events button on the left */}
                <button
                    onClick={() => router.push('/saved-events')}
                    className="flex items-center gap-2 border px-3 py-1 rounded bg-gray-300 rounded-md border-gray-500"
                >
                    <Bookmark className="size-4" /> Saved Events
                </button>
                {/* Logout button on the right */}
                <div>
                    <Logout />
                </div>
            </div>

            {/* Main content */}
            {/* w-full max-w-xl */}
            <main className="flex min-h-screen flex-col items-center gap-4 mt-20 pt-20 ">
                {/* Your chat content */}
                <h3>{trpcHelloResult.data?.greeting}</h3>
                <button onClick={() => createChat.mutate()} disabled={createChat.isPending}>
                    Start chatting
                </button>

                {chatIds.data && chatIds.data.length > 0 && (
                    <div>
                        <p>or continue a previous chat:</p>
                        <div className="max-h-48 overflow-y-auto w-full flex flex-col gap-2 border">
                            {chatIds.data?.map((i) => (
                                <button key={i} onClick={() => setSelectedChat(i)}>
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {selectedChat && (
                    isChatLoading ? (
                        <div>Loading chat...</div>
                    ) : chatData?.messages ? (
                        <Chat id={selectedChat} initialMessages={chatData.messages} />
                    ) : (
                        <div>No messages found.</div>
                    )
                )}
            </main>
        </div>
    );
}
