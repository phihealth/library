export const runtime = 'edge'; // Enable server-side rendering

// Dependencies - Main Components
import { LibraryArticleHistoryPage } from '@project/source/pages/LibraryArticleHistoryPage';

// Dependencies - API
import { libraryApiClient } from '@project/source/api/LibraryApiClient';

// Interface - Page
interface PageInterface {
    params: {
        libraryNodeTitleSlug: string;
    };
}

// Function to get server-side properties
async function getServerSideProperties(properties: PageInterface) {
    const getLibraryNodeBySlugResponse = await libraryApiClient.request('getLibraryNodeBySlug', {
        slug: properties.params.libraryNodeTitleSlug,
    });
    // console.log('getLibraryNodeBySlugResponse', getLibraryNodeBySlugResponse);

    return getLibraryNodeBySlugResponse;
}

// Next.js Metadata
export async function generateMetadata(properties: PageInterface) {
    // Get the server-side properties
    const serverSideProperties = await getServerSideProperties(properties);

    // Get the latest title from the latest post version
    const title =
        serverSideProperties.data.postsWithAssetsAndVersionsAndReviews[0]?.versions[0]?.title ||
        serverSideProperties.data.title;

    return {
        title: title + ' • History • Library • Phi',
    };
}

// Export - Default
export default async function Page(properties: PageInterface) {
    // Get the server-side properties
    const serverSideProperties = await getServerSideProperties(properties);

    return <LibraryArticleHistoryPage libraryNode={serverSideProperties.data} />;
}
