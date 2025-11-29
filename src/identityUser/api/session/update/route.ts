// File: src/app/api/session/update/route.ts
import { getServerSession } from 'next-auth';
import { options } from '@/identityuser/api/auth/[...nextauth]/options';
import { NextResponse } from 'next/server';
import dbConnect from '@/identityuser/lib/db';
import { getUserByUsernameForSessionAction } from '@/identityuser/helper/userAction';

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(options);

        if (!session?.user?.username) {
            return NextResponse.json({ status: 'unauthenticated' }, { status: 401 });
        }

        // const user = await Users.findOne({ username: session.user.username }).populate('role', 'titleEN');
        const user = await getUserByUsernameForSessionAction(session.user.username);
        if (!user) {
            return NextResponse.json({ status: 'notFound' }, { status: 404 });
        }
        const userPayload = user.payload;

        return NextResponse.json({
            status: 'success',
            user: {
                id: userPayload?.id.toString(),
                username: userPayload?.username,
                name: userPayload?.name,
                email: userPayload?.email,
                avatar: userPayload?.avatar,
                securityStamp: userPayload?.securityStamp,
                roles: userPayload?.roles,
                claims: userPayload?.claims

            },
        });
    } catch (error) {
        return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
    }
}