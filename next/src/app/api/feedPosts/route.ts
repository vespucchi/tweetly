import { getToken, removeSession, verifySession } from "@/lib/session";
import { PostInfoType } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    if (req.method === 'GET') {
        const token = getToken();

        if (token) {
            const isValid = await verifySession(token);

            if (!isValid.isAuth) {
                removeSession();
                return NextResponse.json({ message: 'Invalid session. Please re-log' }, { status: 401 });
            }
        } else {
            return NextResponse.json({ error: 'Not logged in. Please log in first'}, { status: 401 })
        }

        try {
            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/posts/globalFeed`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })

            if (response.ok) {
                const feedPosts: PostInfoType[] = await response.json().then((res) => res.response);
                return NextResponse.json(feedPosts);
            } else {
                const errorData = await response.json();
                return NextResponse.json({ error: errorData.error }, { status: response.status });
            }
        } catch (error) {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    } else {
        NextResponse.json({ error: `Method ${req.method} Not Allowed`}, { status: 405 });
    }
};