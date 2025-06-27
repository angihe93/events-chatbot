'use client'

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "~/lib/auth-client";
import { useSession } from "~/context/SessionContext";


export default function LogoutPage() {
    const { refreshSession } = useSession() ?? {};

    const router = useRouter()

    useEffect(() => {
        const handleLogout = async () => {
            await authClient.signOut();
            if (refreshSession) {
                await refreshSession()
            }
            router.push("/login");
        };
        void handleLogout();
    }, [router])

    return <></>
}