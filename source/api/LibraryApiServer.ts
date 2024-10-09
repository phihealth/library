// Dependencies - Next.js
import type { NextRequest } from 'next/server';

// Dependencies - API
import { LibraryApiInterface } from '@project/source/api/LibraryApiInterfaces';
import { LibraryDatabase } from '@project/source/api/LibraryDatabase';
import { LibraryAgent } from '@project/source/api/LibraryAgent';

// Class - LibraryApiServer
export class LibraryApiServer {
    async handleRequest(request: NextRequest) {
        // Initialize the library database
        const libraryDatabase = new LibraryDatabase();

        // Initialize the response
        const response: {
            error?: unknown;
            data: unknown | null;
        } = {
            data: null,
        };
        let responseStatusCode = 200;

        try {
            // console.log('request.nextUrl.pathname', request.nextUrl.pathname);

            // Get the parameters
            let parameters = {};
            try {
                parameters = await request.json();
            }
            catch(error) {
                // No parameters
            }
            // console.log('parameters', parameters);

            // getTables
            if(request.nextUrl.pathname === '/api/getTables') {
                response.data = libraryDatabase.getTables();
            }
            // getRandomLibraryNode
            else if(request.nextUrl.pathname === '/api/getRandomLibraryNode') {
                response.data = libraryDatabase.getRandomLibraryNode(true);
            }
            // getRandomLibraryNodes
            else if(request.nextUrl.pathname === '/api/getRandomLibraryNodes') {
                const { count, comprehensive } =
                    parameters as LibraryApiInterface['getRandomLibraryNodes']['parameters'];
                response.data = libraryDatabase.getRandomLibraryNodes(count, comprehensive);
            }
            // getLibraryNodes
            else if(request.nextUrl.pathname === '/api/getLibraryNodes') {
                const { page, itemsPerPage, searchTerm } =
                    parameters as LibraryApiInterface['getLibraryNodes']['parameters'];
                response.data = libraryDatabase.getLibraryNodes(page, itemsPerPage, searchTerm);
            }
            // getLibraryNodeBySlug
            else if(request.nextUrl.pathname === '/api/getLibraryNodeBySlug') {
                const { slug } = parameters as LibraryApiInterface['getLibraryNodeBySlug']['parameters'];
                response.data = libraryDatabase.getLibraryNodeBySlug(slug, true);
            }
            // improveLibrary
            else if(request.nextUrl.pathname === '/api/improveLibrary') {
                response.data = await LibraryAgent.improveLibrary(libraryDatabase);
            }
        }
        catch(error) {
            console.error('Error in LibraryApiServer.handleRequest', error);
            response.error = error;
            responseStatusCode = 500;
        }

        // Close the database connection
        libraryDatabase.database.close();

        // Return the response
        return new Response(JSON.stringify(response), {
            status: responseStatusCode,
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
