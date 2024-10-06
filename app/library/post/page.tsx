export const runtime = 'edge'; // Enable server-side rendering

// Dependencies - Main Components
import { LibraryPostPage } from '@project/source/pages/LibraryPostPage';

// Next.js Metadata
export async function generateMetadata() {
    return {
        title: 'Lutein Supports Eye Health',
    };
}

// Export - Default
export default async function Page() {
    return <LibraryPostPage />;
}
