'use client'

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "~/lib/auth-client";


export default function LogoutPage() {
    const router = useRouter()

    useEffect(() => {
        const handleLogout = async () => {
            await authClient.signOut();
            router.push("/login");
        };
        handleLogout();
    }, [router])

    return <></>
}