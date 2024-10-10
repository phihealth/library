export const runtime = 'edge'; // Enable server-side rendering

// Dependencies - Main Components
import { LibraryPage } from '@project/source/pages/LibraryPage';

// Dependencies - API
import { libraryApiClient } from '@project/source/api/LibraryApiClient';

// Interface - Page
interface PageInterface {
    searchParams: {
        page: number;
        itemsPerPage: number;
        searchTerm: string;
    };
}

// Function to get server-side properties
async function getServerSideProperties(properties: PageInterface) {
    const getLibraryNodesResponse = await libraryApiClient.request('getLibraryNodes', {
        page: properties.searchParams.page || 1,
        itemsPerPage: properties.searchParams.itemsPerPage || 20,
        searchTerm: properties.searchParams.searchTerm,
    });
    // console.log('getLibraryNodesResponse', getLibraryNodesResponse);

    return getLibraryNodesResponse;
}

// Next.js Metadata
export async function generateMetadata() {
    return {
        title: 'Library',
    };
}

// Export - Default
export default async function Page(properties: PageInterface) {
    // Get the server-side properties
    const serverSideProperties = await getServerSideProperties(properties);

    return (
        <LibraryPage
            libraryNodes={serverSideProperties.data.libraryNodes}
            itemsPerPage={serverSideProperties.data.pagination.itemsPerPage}
            page={serverSideProperties.data.pagination.page}
            pagesTotal={serverSideProperties.data.pagination.pagesTotal}
            searchTerm={properties.searchParams.searchTerm}
        />
    );
}
