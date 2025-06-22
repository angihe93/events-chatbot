'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "~/lib/auth-client"; // Replace with your client-side auth logic

type SessionType = Awaited<ReturnType<typeof authClient.getSession>>;

const SessionContext = createContext<{
    session: SessionType | null;
    setSession: React.Dispatch<React.SetStateAction<SessionType | null>>;
    refreshSession: () => Promise<void>
} | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<SessionType | null>(null);

    const refreshSession = async () => {
        const sessionData = await authClient.getSession(); // Fetch updated session
        setSession(sessionData);
    }

    useEffect(() => {
        console.log("in SessionProvider useEffect")
        refreshSession()
        // const fetchSession = async () => {
        //     const sessionData = await authClient.getSession(); // Fetch session dynamically
        //     setSession(sessionData);
        // };

        // fetchSession();
    }, []);

    return (
        <SessionContext.Provider value={{ session, setSession, refreshSession }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    return useContext(SessionContext);
}
