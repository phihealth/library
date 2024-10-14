'use client'; // This component uses client-only features

// Dependencies - React and Next.js
import React from 'react';
import Link from 'next/link';

// Dependencies - Main Components
import {
    LibraryNodeInterface,
    LibraryNodeWithLibraryPostWithLatestVersionInterface,
} from '@project/source/api/LibraryApiInterfaces';
import { Pagination } from '@structure/source/common/navigation/Pagination';
import { InputText } from '@structure/source/common/forms/InputText';

// Component - LibraryPostsPage
export interface LibraryPostsPageInterface {
    libraryNodes: LibraryNodeWithLibraryPostWithLatestVersionInterface[];
    itemsPerPage: number;
    page: number;
    pagesTotal: number;
    searchTerm: string;
}
export function LibraryPostsPage(properties: LibraryPostsPageInterface) {
    // Render the component
    return (
        <div className="container pb-32 pt-8">
            <Link href="/">
                <h1 className="inline text-3xl font-medium">Articles</h1>
            </Link>

            {/* Search */}
            <div className="mb-6 mt-8 ">
                <InputText
                    id="searchTerm"
                    variant="search"
                    placeholder="Search articles..."
                    defaultValue={properties.searchTerm}
                    className="w-full"
                    // On enter key
                    onKeyDown={function (event) {
                        if(event.key === 'Enter') {
                            // Redirect to the search page
                            window.location.href =
                                '/library/articles?searchTerm=' + encodeURIComponent(event.currentTarget.value);
                        }
                    }}
                />
            </div>

            {/* LibraryNodes with LibraryPosts */}
            {/* <div className="whitespace-pre-wrap">{JSON.stringify(properties.libraryNodes, null, 4)}</div> */}

            <div className="">
                <div className="flex flex-col space-y-8 pb-1.5">
                    {properties.libraryNodes.map(function (libraryNode) {
                        return (
                            <div key={libraryNode.id} className="">
                                <Link href={'/library/articles/' + libraryNode.slug} className="primary">
                                    {libraryNode.libraryPost.libraryPostVersion.title}
                                </Link>{' '}
                                <Link href={'/library/' + libraryNode.slug} className="primary">
                                    ({libraryNode.title})
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
export default LibraryPostsPage;
