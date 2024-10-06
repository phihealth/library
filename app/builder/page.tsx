export const runtime = 'edge'; // Enable server-side rendering

// Dependencies - Main Components
import { LibraryBuilderPage } from '@project/source/pages/LibraryBuilderPage';

// Next.js Metadata
export async function generateMetadata() {
    return {
        title: 'Library Builder',
    };
}

// Export - Default
export default function Page() {
    return <LibraryBuilderPage />;
}
