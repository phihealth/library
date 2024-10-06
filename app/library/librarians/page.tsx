export const runtime = 'edge'; // Enable server-side rendering

// Dependencies - Main Components
import { LibrariansPage } from './LibrariansPage';

// Next.js Metadata
export async function generateMetadata(properties: PageInterface) {
    return {
        title: 'Librarians • Library',
    };
}

// Export - Default
export default async function Page(properties: PageInterface) {
    return <LibrariansPage />;
}
