// Dependencies - API
import { LibraryApiInterface } from '@project/source/api/LibraryApiInterfaces';

// Class - LibraryApiClient
export class LibraryApiClient {
    async request<K extends keyof LibraryApiInterface>(
        apiMethod: K,
        parameters?: LibraryApiInterface[K]['parameters'],
        headers?: HeadersInit,
    ): Promise<LibraryApiInterface[K]['response']> {
        const url = `http://localhost:7878/api/${apiMethod}`;

        const response = await fetch(url, {
            method: 'POST', // or 'GET' depending on your API method
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            cache: 'no-store',
            body: parameters ? JSON.stringify(parameters) : undefined,
        });

        const responseJson = await response.json();

        // Return the typed response
        return responseJson as LibraryApiInterface[K]['response'];
    }
}

// Instance
export const libraryApiClient = new LibraryApiClient();

// Export - Default
export default LibraryApiClient;
