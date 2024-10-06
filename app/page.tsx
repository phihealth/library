export const runtime = 'edge'; // Enable server-side rendering

// Dependencies - Main Components
import { HomePage } from './HomePage';

// Next.js Metadata
export async function generateMetadata() {
    return {
        title: 'Phi',
    };
}

// Export - Default
export default function Page() {
    return <HomePage />;
}
