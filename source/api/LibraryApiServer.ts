// Dependencies - Next.js
import type { NextRequest } from 'next/server';

// Dependencies - API
import { libraryDatabase } from '@project/source/api/LibraryDatabase';

// Class - LibraryApiServer
export class LibraryApiServer {
    async handleRequest(request: NextRequest) {
        // console.log('request.nextUrl.pathname', request.nextUrl.pathname);

        // Initialize the response
        let responseJson = {};

        // showTables
        if(request.nextUrl.pathname === '/api/showTables') {
            responseJson = await libraryDatabase.showTables();
        }
        // getRandomLibraryNode
        else if(request.nextUrl.pathname === '/api/getRandomLibraryNode') {
            responseJson = await libraryDatabase.getRandomLibraryNode();
        }
        // getLibraryNodeBySlug
        else if(request.nextUrl.pathname === '/api/getLibraryNodeBySlug') {
            const slug = request.nextUrl.searchParams.get('slug')!;

            responseJson = await libraryDatabase.getLibraryNodeBySlug(slug);
        }
        // getLibraryNodes
        else if(request.nextUrl.pathname === '/api/getLibraryNodes') {
            const page = request.nextUrl.searchParams.get('page')
                ? Number(request.nextUrl.searchParams.get('page'))
                : 1;
            const itemsPerPage = request.nextUrl.searchParams.get('itemsPerPage')
                ? Number(request.nextUrl.searchParams.get('itemsPerPage'))
                : 20;
            const searchTerm = request.nextUrl.searchParams.get('searchTerm');

            responseJson = await libraryDatabase.getLibraryNodes(page, itemsPerPage, searchTerm);
        }
        // getLibraryNode
        else if(request.nextUrl.pathname === '/api/getLibraryNode') {
            responseJson = await libraryDatabase.getLibraryNode();
        }
        // improveLibrary
        else if(request.nextUrl.pathname === '/api/improveLibrary') {
            // responseJson = await libraryDatabase.improveLibrary();
        }
        // getTableRecordCounts
        else if(request.nextUrl.pathname === '/api/getTableRecordCounts') {
            responseJson = await libraryDatabase.getTableRecordCounts();
        }

        // Return the response
        return new Response(JSON.stringify(responseJson), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

// Instance
export const libraryApiServer = new LibraryApiServer();

// Export - Default
export default LibraryApiServer;
