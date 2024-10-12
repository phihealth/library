'use client'; // This component uses client-only features

// Dependencies - React and Next.js
import React from 'react';
import Link from 'next/link';

// Dependencies - Main Components
import { LibraryNodeInterface } from '@project/source/api/LibraryApiInterfaces';
import { Pagination } from '@structure/source/common/navigation/Pagination';
import { InputText } from '@structure/source/common/forms/InputText';

// Component - LibraryNodesPage
export interface LibraryNodesPageInterface {
    libraryNodes: LibraryNodeInterface[];
    itemsPerPage: number;
    page: number;
    pagesTotal: number;
    searchTerm: string;
}
export function LibraryNodesPage(properties: LibraryNodesPageInterface) {
    // Render the component
    return (
        <div className="container pb-32 pt-8">
            <Link href="/">
                <h1 className="inline text-3xl font-medium">Concepts</h1>
            </Link>

            {/* Search */}
            <div className="mb-6 mt-8 ">
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
                <div className="flex flex-col space-y-1.5 pb-1.5">
                    {properties.libraryNodes.map(function (libraryNode) {
                        return (
                            <div key={libraryNode.id} className="">
                                <Link href={'/library/' + libraryNode.slug} className="primary">
                                    {libraryNode.title}{' '}
                                </Link>
                            </div>
                        );
                    })}
                </div>
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
export default LibraryNodesPage;
