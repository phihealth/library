export const runtime = 'edge'; // Enable server-side rendering

// Dependencies - Main Components
import { LibraryPostsPage } from '@project/source/pages/LibraryPostsPage';

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
    const getLibraryNodesWithLibraryPostsWithLatestVersionsResponse = await libraryApiClient.request(
        'getLibraryNodesWithLibraryPostsWithLatestVersions',
        {
            page: properties.searchParams.page || 1,
            itemsPerPage: properties.searchParams.itemsPerPage || 20,
            searchTerm: properties.searchParams.searchTerm,
        },
    );
    // console.log(
    //     'getLibraryNodesWithLibraryPostsWithLatestVersionsResponse',
    //     getLibraryNodesWithLibraryPostsWithLatestVersionsResponse,
    // );

    return getLibraryNodesWithLibraryPostsWithLatestVersionsResponse;
}

// Next.js Metadata
export async function generateMetadata() {
    return {
        title: 'Articles • Library • Phi',
    };
}

// Export - Default
export default async function Page(properties: PageInterface) {
    // Get the server-side properties
    const serverSideProperties = await getServerSideProperties(properties);
    // console.log('serverSideProperties', serverSideProperties);

    return (
        <LibraryPostsPage
            libraryNodes={serverSideProperties.data.libraryNodes}
            itemsPerPage={serverSideProperties.data.pagination.itemsPerPage}
            page={serverSideProperties.data.pagination.page}
            pagesTotal={serverSideProperties.data.pagination.pagesTotal}
            searchTerm={properties.searchParams.searchTerm}
        />
    );
}
