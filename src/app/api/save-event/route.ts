import { auth } from '~/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { saveUnsaveEvent } from '~/server/db/db';

type EventData = {
    name: string
    description?: string
    dateTime?: string
    location?: string
    link?: string
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect('/login');
    }
    const userId = session.user.id;
    const { name, description, dateTime, location, link }: EventData = await req.json() as EventData;

    // console.log("inside saveEvent", userId, name, description, dateTime, location, link);
    const dbReturn = await saveUnsaveEvent(userId, name, description, dateTime, location, link)
    console.log("dbReturn", dbReturn)

    return NextResponse.json({ success: true });
}
