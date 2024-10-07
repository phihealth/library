// Dependencies - Next.js
import type { NextRequest } from 'next/server';

// Dependencies - API
import { libraryApiServer } from '@project/source/api/LibraryApiServer';

// GET request
export async function POST(request: NextRequest) {
    return await libraryApiServer.handleRequest(request);
}
