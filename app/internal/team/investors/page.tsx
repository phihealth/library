export const runtime = 'edge'; // Enable server-side rendering

// Dependencies - Next.js
import { Metadata } from 'next';

// Metadata
export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Investors • Team • Internal',
    };
}

// Shim the default export from Structure
export { default } from '@structure/source/internal/pages/team/TeamInvestorsPage';
