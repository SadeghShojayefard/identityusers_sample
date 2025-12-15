
import { getServerSession } from 'next-auth';
import { options } from '@/identityuser/api/auth/[...nextauth]/options';
import { NextResponse } from 'next/server';
import dbConnect from '@/identityuser/lib/db';
import { getUserByUsernameForSessionAction } from '@/identityuser/helper/userAction';
import { hasPayload } from '@/type/actionType.type';

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

        if (!hasPayload(user) || user.status === "error") { return null }

        const userPayload = user.payload;

        return NextResponse.json({
            status: 'success',
            user: {
                id: userPayload?.id.toString(),
                username: userPayload?.username,
                name: userPayload?.name,
                email: userPayload?.email,
                phoneNumber: userPayload?.phoneNumber,
                avatar: userPayload?.avatar,
                securityStamp: userPayload?.securityStamp,
                roles: userPayload?.roles,
                claims: userPayload?.claims,
                emailConfirmed: userPayload?.emailConfirmed,
                phoneNumberConfirmed: userPayload?.phoneNumberConfirmed,
                twoFactorEnabled: userPayload?.twoFactorEnabled,

            },
        });
    } catch (error) {
        return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
    }
}
