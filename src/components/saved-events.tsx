"use client"

// import { headers } from "next/headers";
// import { redirect } from "next/navigation";
// import { auth } from "~/lib/auth";
// import { getSavedEvents } from "~/server/db/db";
import {
    Card,
    CardAction,
    // CardContent,
    CardDescription,
    // CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card"
import { cn } from "~/lib/utils"
import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    // SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"
import { X } from "lucide-react";

export default function SavedEvents() {

    type SavedEvent =
        | { name: string | undefined; dateTime: string | undefined; location: string | undefined; link: string | undefined; description?: undefined; createdAt: Date }
        | { name: string | undefined; description: string | undefined; dateTime: string | undefined; location: string | undefined; link: string | undefined; createdAt: Date };

    type apiEvent = {
        id: string;
        name: string;
        description: string | null;
        dateTime: string | null;
        location: string | null;
        link: string | null;
        userId: string;
        createdAt: Date;
    }
    type apiResponse = {
        success: boolean;
        data: apiEvent[]
    }

    //     getSavedEvents(userId: string): Promise<{
    //     id: string;
    //     name: string;
    //     description: string | null;
    //     dateTime: string | null;
    //     location: string | null;
    //     link: string | null;
    //     userId: string;
    //     createdAt: Date;
    // }[]>

    const [events, setEvents] = useState<SavedEvent[]>([])
    const [sortBy, setSortBy] = useState<"eventDateTimeAsc" | "eventDateTimeDesc" | "addedDateTimeAsc" | "addedDateTimeDesc">()
    const [unsaveClickFlag, setUnsaveClickFlag] = useState(false)

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/save-event/get-saved-events', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                const result = await response.json() as apiResponse;

                console.log("api response", result)
                setEvents(result.data as SavedEvent[])
            } catch (error) {
                console.error("Failed to fetch events:", error);
            }
        }
        void fetchEvents()
    }, [unsaveClickFlag])

    function parseEventDate(str: string, year = new Date().getFullYear()) {
        // Handles: "Fri, Jun 20, 9:00 – 10:45 PM", "Fri, Jun 20, 6 PM", "Sun, Jun 22, 11 AM – 9 PM"
        // always use start time for sorting
        // console.log("parseEventDate input", str)
        // console.log(str.split(' '))
        // 3rd item is month, 4th is date, 5th is start time, search the rest for the first AM/PM
        const splitArr = str.split(' ')
        const month = splitArr[2]
        const day = splitArr[3]?.split(',')[0]
        const time = splitArr[4]?.split(':')[0]
        // TODO: add minutes
        let ampm
        for (const i of splitArr.slice(5)) {
            if (i === 'AM' || i === 'PM') {
                ampm = i
                break
            }
        }
        // console.log(month, day, time, ampm)
        // Compose a string like "Jun 20 2025 9:00 PM" or "Jun 20 2025 6 PM"
        const dateStr = `${month} ${day} ${year} ${time}:00${ampm ? " " + ampm : ""}`;
        console.log("parseEventDate dateStr", dateStr)
        const date = new Date(dateStr);
        console.log("parseEventDate output", date)
        return isNaN(date.getTime()) ? null : date;
    }

    useEffect(() => {
        if (sortBy === undefined)
            setEvents(events)
        else if (sortBy === "addedDateTimeAsc")
            setEvents([...events].sort((a: SavedEvent, b: SavedEvent) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()))
        else if (sortBy === "addedDateTimeDesc")
            setEvents([...events].sort((a: SavedEvent, b: SavedEvent) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
        else if (sortBy === "eventDateTimeAsc")
            setEvents([...events].sort((a: SavedEvent, b: SavedEvent) => {
                const aDate = a.dateTime ? parseEventDate(a.dateTime) : null
                const bDate = b.dateTime ? parseEventDate(b.dateTime) : null
                const aTime = aDate ? aDate.getTime() : 0
                const bTime = bDate ? bDate.getTime() : 0
                return aTime - bTime
            }))
        else if (sortBy === "eventDateTimeDesc")
            setEvents([...events].sort((a: SavedEvent, b: SavedEvent) => {
                const aDate = a.dateTime ? parseEventDate(a.dateTime) : null
                const bDate = b.dateTime ? parseEventDate(b.dateTime) : null
                const aTime = aDate ? aDate.getTime() : 0
                const bTime = bDate ? bDate.getTime() : 0
                return bTime - aTime;
            }))
    }, [sortBy])


    const renderCard = (event: SavedEvent) => {
        console.log(event)
        return (
            <Card className="w-full max-w-sm" key={event.name + String(event.createdAt)}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-2">
                            <CardTitle>{event.name}</CardTitle>
                            <CardDescription className={cn("text-sm !text-black")}>{event.dateTime}</CardDescription>
                            <CardDescription>{event.description}</CardDescription>
                            <CardDescription>
                                <a href={event.link} className="underline">Link</a>
                            </CardDescription>
                        </div>
                        <CardAction><button title="Unsave event" onClick={() => unsaveEvent(event)}>
                            <X size={18} /></button>
                        </CardAction>
                    </div>
                </CardHeader>
            </Card>)
    }


    const unsaveEvent = async (event: SavedEvent) => {
        const { name, description, dateTime, location, link } = event;
        await fetch('/api/save-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, dateTime, location, link }),
        })
        setUnsaveClickFlag(!unsaveClickFlag)
    }


    return (
        <>
            <h2>saved events</h2>
            <Select
                value={sortBy}
                onValueChange={(value) => {
                    if (value !== undefined) {
                        setSortBy(value as "eventDateTimeAsc" | "eventDateTimeDesc" | "addedDateTimeAsc" | "addedDateTimeDesc");
                    }
                }}
            >
                <SelectTrigger className="w-[180px]" size="sm">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="addedDateTimeDesc">Date saved: latest</SelectItem>
                        <SelectItem value="addedDateTimeAsc">Date saved: earliest</SelectItem>
                        <SelectItem value="eventDateTimeDesc">Event date: latest</SelectItem>
                        <SelectItem value="eventDateTimeAsc">Event date: earliest</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>

            {events.map((e, idx) => renderCard(e))}
        </>
    )
}