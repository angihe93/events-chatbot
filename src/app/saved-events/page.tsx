// "use client"

import { MessageCircle } from "lucide-react"
// import { useRouter } from "next/navigation"
import SavedEvents from "~/components/saved-events"
import Link from "next/link"

export default function SavedEventsPage() {
    // const router = useRouter()

    return (
        <>
            <div className="bg-muted min-h-svh flex-col md:p-10">
                {/* back to chats */}
                {/* <div className="fixed h-20 top-0 flex justify-between bg-muted"> */}
                <div className="fixed h-20 top-0 left-0 right-0 flex justify-between items-center px-6 z-50 bg-muted">
                    {/* <button onClick={() => router.push('/saved-events')} className="flex items-center gap-2">
                        <MessageCircle className="size-4" />back to chats
                    </button> */}
                    <Link href="/chat" className="flex items-center gap-2">
                        <MessageCircle className="size-4" />back to chats
                    </Link>
                </div>
                <div className="flex flex-col items-center gap-6 p-6 md:p-10">
                    <SavedEvents />
                </div>
            </div >
        </>
    )
}
