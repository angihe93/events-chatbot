'use client';

import { createContext, useContext, useState } from "react";

type ChatContextType = {
    selectedChatContext: string | null; // Store the selected chat ID or slug
    setSelectedChatContext: (chat: string | null) => void; // Function to update the selected chat
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [selectedChatContext, setSelectedChatContext] = useState<string | null>(null);
    console.log("selectedChatContext", selectedChatContext)

    return (
        <ChatContext.Provider value={{ selectedChatContext, setSelectedChatContext }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChatContext() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
}