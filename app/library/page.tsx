export const runtime = 'edge'; // Enable server-side rendering

// Dependencies - Main Components
import { LibraryPage } from '@project/source/pages/LibraryPage';

// Dependencies - API
import { libraryApi } from '@project/source/api/LibraryApi';

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
    const getLibraryNodesResponse = await libraryApi.getLibraryNodes(
        properties.searchParams.page || 1,
        properties.searchParams.itemsPerPage || 20,
        properties.searchParams.searchTerm,
    );
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
