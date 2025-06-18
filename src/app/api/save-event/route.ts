import { auth } from '~/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { saveEvent } from '~/server/db/db';

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect('/login');
    }
    const userId = session.user.id;
    const { name, description, dateTime, location, link } = await req.json();

    // TODO: Save event to DB here
    // console.log("inside saveEvent", userId, name, description, dateTime, location, link);
    await saveEvent(userId, name, description, dateTime, location, link)

    return NextResponse.json({ success: true });
}
