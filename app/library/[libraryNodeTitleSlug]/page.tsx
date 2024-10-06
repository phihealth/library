export const runtime = 'edge'; // Enable server-side rendering

// Dependencies - Main Components
import { LibraryNodePage } from './LibraryNodePage';

// Dependencies - API
import { libraryApi } from '@project/app/[...api]/LibraryApi';

// Interface - Page
interface PageInterface {
    params: {
        libraryNodeTitleSlug: string;
    };
}

// Function to get server-side properties
async function getServerSideProperties(properties: PageInterface) {
    const getLibraryNodeBySlugResponse = await libraryApi.getLibraryNodeBySlug(properties.params.libraryNodeTitleSlug);
    // console.log('getLibraryNodeBySlugResponse', getLibraryNodeBySlugResponse);

    return getLibraryNodeBySlugResponse;
}

// Next.js Metadata
export async function generateMetadata(properties: PageInterface) {
    // Get the server-side properties
    const serverSideProperties = await getServerSideProperties(properties);

    return {
        title: serverSideProperties.data.title + ' • Library',
    };
}

// Export - Default
export default async function Page(properties: PageInterface) {
    // Get the server-side properties
    const serverSideProperties = await getServerSideProperties(properties);

    return <LibraryNodePage libraryNode={serverSideProperties.data} />;
}
