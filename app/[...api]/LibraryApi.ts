// Dependencies
import { getLibraryNodesResponseInterface, getLibraryNodeBySlugResponseInterface } from '@project/app/[...api]/route';

// Class - LibraryApi
export class LibraryApi {
    // Function to fetch the provided API path
    async fetch(apiPath: string) {
        // Invoke the HTTP(S) request
        const url = 'http://localhost:7878/api/' + apiPath;
        // console.log('url', url);
        const response = await fetch(url);
        const responseJson = await response.json();
        // console.log('responseJson', responseJson);

        return responseJson;
    }

    // Function to get library nodes
    async getLibraryNodes(
        page: number,
        itemsPerPage: number,
        searchTerm?: string,
    ): Promise<getLibraryNodesResponseInterface> {
        const getLibraryNodesResponse = await this.fetch(
            'getLibraryNodes?' +
                'page=' +
                page +
                '&itemsPerPage=' +
                itemsPerPage +
                (searchTerm ? '&searchTerm=' + encodeURIComponent(searchTerm) : ''),
        );
        // console.log('getLibraryNodesResponse', getLibraryNodesResponse.responseJson);

        return getLibraryNodesResponse as getLibraryNodesResponseInterface;
    }

    // Function to get a library node
    async getLibraryNodeBySlug(slug: string): Promise<getLibraryNodeBySlugResponseInterface> {
        const getLibraryNodeBySlugResponse = await this.fetch('getLibraryNodeBySlug?slug=' + slug);
        // console.log('getLibraryNodeBySlugResponse', getLibraryNodeBySlugResponse);

        return getLibraryNodeBySlugResponse as getLibraryNodeBySlugResponseInterface;
    }
}

// Instance
export const libraryApi = new LibraryApi();

// Export - Default
export default LibraryApi;
