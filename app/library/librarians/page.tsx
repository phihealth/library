export const runtime = 'edge'; // Enable server-side rendering

// Dependencies - Main Components
import { LibrariansPage } from '@project/source/pages/LibrariansPage';

// Next.js Metadata
export async function generateMetadata() {
    return {
        title: 'Librarians • Library',
    };
}

// Export - Default
export default async function Page() {
    return <LibrariansPage />;
}
