// Dependencies - Next.js
import type { NextRequest } from 'next/server';

// Dependencies - API
import { libraryApiServer } from '@project/source/api/LibraryApiServer';

// GET request
export async function GET(request: NextRequest) {
    return libraryApiServer.handleRequest(request);
}
