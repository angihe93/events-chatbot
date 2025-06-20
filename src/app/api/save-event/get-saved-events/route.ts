import { auth } from '~/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { getSavedEvents } from '~/server/db/db';

export async function GET(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect('/login');
    }
    const userId = session.user.id;
    // const { name, description, dateTime, location, link } = await req.json();

    // console.log("inside saveEvent", userId, name, description, dateTime, location, link);
    const result = await getSavedEvents(userId)
    // console.log("result", result)

    return NextResponse.json({ success: true, data: result });
}
