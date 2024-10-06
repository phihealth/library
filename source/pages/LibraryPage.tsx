'use client'; // This component uses client-only features

// Dependencies - React and Next.js
import React from 'react';
import Link from 'next/link';

// Dependencies - Main Components
import { LibraryNodeInterface } from '@project/source/api/LibraryApiInterfaces';
import { Pagination } from '@structure/source/common/navigation/Pagination';
import { InputText } from '@structure/source/common/forms/InputText';

// Component - LibraryPage
export interface LibraryPageInterface {
    libraryNodes: LibraryNodeInterface[];
    itemsPerPage: number;
    page: number;
    pagesTotal: number;
    searchTerm: string;
}
export function LibraryPage(properties: LibraryPageInterface) {
    // Render the component
    return (
        <div className="container pb-32 pt-8">
            <h1 className="mb-8 text-3xl font-medium">Phi Library</h1>

            {/* Search */}
            <div className="mb-6">
                <InputText
                    id="searchTerm"
                    variant="search"
                    placeholder="Search the library..."
                    defaultValue={properties.searchTerm}
                    className="w-full"
                    // On enter key
                    onKeyDown={function (event) {
                        if(event.key === 'Enter') {
                            // Redirect to the search page
                            window.location.href =
                                '/library?searchTerm=' + encodeURIComponent(event.currentTarget.value);
                        }
                    }}
                />
            </div>

            {/* LibraryNodes */}
            <div>
                {properties.libraryNodes.map(function (libraryNode) {
                    return (
                        <div key={libraryNode.id} className="">
                            <Link href={'/library/' + libraryNode.slug} className="primary text-lg">
                                {libraryNode.title}{' '}
                            </Link>
                        </div>
                    );
                })}
                <Pagination
                    className="mt-6"
                    page={properties.page}
                    pagesTotal={properties.pagesTotal}
                    itemsPerPage={properties.itemsPerPage}
                    itemsPerPageControl={false}
                    useLinks={true}
                />
            </div>
        </div>
    );
}

// Export - Default
export default LibraryPage;
