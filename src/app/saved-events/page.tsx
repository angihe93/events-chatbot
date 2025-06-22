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
                <div className="flex flex-col items-center gap-6 p-6 md:p-10">
                    <SavedEvents />
                </div>
            </div >
        </>
    )
}
