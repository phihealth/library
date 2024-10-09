'use client'; // This component uses client-only features

// Dependencies - React and Next.js
import React from 'react';

// Dependencies - Main Components
import { Button } from '@structure/source/common/buttons/Button';

// Component - HomePage
export function HomePage() {
    // Render the component
    return (
        <div className="container pb-32 pt-8">
            <h1 className="mb-2 text-3xl font-medium">Phi Library</h1>
            <p className="mb-8 text-lg font-medium">A universal library of infinite wisdom</p>

            <div className="flex flex-col space-y-4">
                <Button href={'/library'}>Enter the Library</Button>
                <Button href={'/library/builder'}>Library Builder</Button>
                <Button href={'/library/librarians'}>Librarians</Button>
                <Button href={'/library/post'}>Sample Post</Button>
            </div>
        </div>
    );
}

// Export - Default
export default HomePage;
