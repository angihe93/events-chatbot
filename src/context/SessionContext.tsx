'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "~/lib/auth-client"; // Replace with your client-side auth logic
import { createAuthClient } from "better-auth/react"

// type SessionType = {
//   user: {
//     id: string;
//     name: string;
//     email: string;
//   } | null;
//   expires: string | null;
// }
// type SessionType = Awaited<ReturnType<typeof authClient.getSession>>;
type SessionType = ReturnType<typeof createAuthClient>["$Infer"]["Session"]; // Use the inferred session type


const SessionContext = createContext<{
    session: SessionType | null;
    setSession: React.Dispatch<React.SetStateAction<SessionType | null>>;
    refreshSession: () => Promise<void>
} | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<SessionType | null>(null);

    const refreshSession = async () => {
        const sessionResult = await authClient.getSession(); // Fetch updated session
        if ('data' in sessionResult && sessionResult.data) {
            setSession(sessionResult.data);
        } else {
            setSession(null);
        }
    }

    useEffect(() => {
        console.log("in SessionProvider useEffect")
        void refreshSession()
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
