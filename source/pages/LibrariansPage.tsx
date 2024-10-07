'use client'; // This component uses client-only features

// Dependencies - React and Next.js
import React from 'react';
import Link from 'next/link';

// Dependencies - Main Components
import { Pagination } from '@structure/source/common/navigation/Pagination';
import { InputText } from '@structure/source/common/forms/InputText';

// Component - LibrariansPage
export interface LibrariansPageInterface {}
export function LibrariansPage(properties: LibrariansPageInterface) {
    // Render the component
    return (
        <div className="container pb-32 pt-8">
            <h1 className="mb-8 text-3xl font-medium">Librarians</h1>
        </div>
    );
}

// Export - Default
export default LibrariansPage;
