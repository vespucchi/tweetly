import { logInSchema } from '@/lib/schemas';
import { createSession, hasSession, removeSession, verifySession } from '@/lib/session';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(req: Request) {
    if (req.method === 'POST') {
        // Check for an existing session
        const token = await hasSession();

        if (token) {
            const isValid = await verifySession();

            if (isValid.isAuth) {
                // User is already logged in, return an appropriate response
                return NextResponse.json({ message: 'Already logged in!' }, { status: 400 });
            } else {
                // Remove invalid session if the session is not valid
                await removeSession();
            }
        }

        try {
            // Validate incoming data
            const body: z.infer<typeof logInSchema> = await req.json();
            const validatedData = logInSchema.parse(body);

            // Send a POST request to your Express backend
            const apiUrl = process.env.EXPRESS_API_URL;
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(validatedData),
            });

            // Handle the response from your Express backend
            if (response.ok) {
                const data = await response.json();
                await createSession(data.token);
                return NextResponse.json(data);
            } else {
                const errorData = await response.json();
                return NextResponse.json({ error: errorData.error }, { status: response.status });
            }
        } catch (error) {
            // Handle validation errors
            if (error instanceof z.ZodError) {
                return NextResponse.json({ error: error.errors }, { status: 400 });
            }
            // Handle other errors
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    } else {
        return NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
    }
}