// Dependencies - React and Next.js
import React from 'react';
import Link from 'next/link';

// Dependencies - Main Components
import { ThemeToggle } from '@structure/source/theme/ThemeToggle';

// Component - MainLayout
export interface MainLayoutInterface {
    children: React.ReactNode;
}
export function MainLayout(properties: MainLayoutInterface) {
    // Render the component
    return (
        <>
            {/* Navigation */}
            <div className="sticky top-0 z-20 border-b bg-light bg-opacity-75 backdrop-blur-3xl transition-colors dark:border-dark-4 dark:bg-dark-1">
                <div className="flex items-center justify-center p-4">
                    <ul className="flex space-x-phi text-[15px]">
                        <li>
                            <Link href="/">Home</Link>
                        </li>
                        <li>
                            <Link href="/library/articles">Articles</Link>
                        </li>
                        <li>
                            <Link href="/library/concepts">Concepts</Link>
                        </li>
                        <li>
                            <Link href="/library/librarians">Librarians</Link>
                        </li>
                        <li>
                            <Link href="/library/builder">Builder</Link>
                        </li>
                        <li>
                            <Link href="/library/post">Post</Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="relative w-full overflow-x-clip">{properties.children}</div>

            {/* Footer */}
            <div className="flex justify-center">
                <ThemeToggle className="" />
            </div>
        </>
    );
}

// Export - Default
export default MainLayout;
