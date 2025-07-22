'use client'

import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";
import { useSession } from "~/context/SessionContext";


export default function SavedEventsLayout({ children }: { children: React.ReactNode }) {
    const sessionContext = useSession()

    return (
        <>
            <SidebarProvider defaultOpen={false}>
                {sessionContext?.session?.user && <AppSidebar />}
                {sessionContext?.session?.user && <SidebarTrigger />}
                <div className="bg-muted min-h-screen w-full">
                    {children}
                </div>
            </SidebarProvider>
        </>
    );
}