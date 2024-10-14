'use client'; // This component uses client-only features

// Dependencies - React and Next.js
import React from 'react';
import Link from 'next/link';

// Dependencies - Main Components
import { Button } from '@structure/source/common/buttons/Button';
import { Markdown } from '@structure/source/common/markdown/Markdown';

// Dependencies - API
import { LibraryNodeComprehensiveInterface } from '@project/source/api/LibraryApiInterfaces';

// Dependencies - Utilities
import { timeAgo } from '@structure/source/utilities/Time';

// Component - LibraryArticleHistoryPage
export interface LibraryArticleHistoryPageInterface {
    libraryNode: LibraryNodeComprehensiveInterface;
}
export function LibraryArticleHistoryPage(properties: LibraryArticleHistoryPageInterface) {
    const [activeTab, setActiveTab] = React.useState({});

    const handleTabClick = function (
        postId: LibraryNodeComprehensiveInterface['postsWithAssetsAndVersionsAndReviews'][0]['id'],
        versionId: LibraryNodeComprehensiveInterface['postsWithAssetsAndVersionsAndReviews'][0]['versions'][0]['id'],
    ) {
        setActiveTab(function (prevState) {
            return {
                ...prevState,
                [postId]: versionId,
            };
        });
    };

    // Render the component
    return (
        <div className="container pb-32 pt-8">
            <h1 className="mb-8 text-3xl font-medium">{properties.libraryNode.title}</h1>

            <div className="mt-6">
                <h2 className="text-lg">Posts</h2>
                {properties.libraryNode.postsWithAssetsAndVersionsAndReviews.map(
                    (libraryPostWithVersionsAndReviews) => (
                        <div key={libraryPostWithVersionsAndReviews.id} className="">
                            <div className="tab-list">
                                {libraryPostWithVersionsAndReviews.versions.map(
                                    (libraryPostVersion, libraryPostVersionIndex) => (
                                        <Button
                                            key={libraryPostVersion.id}
                                            variant="ghost"
                                            className={`${
                                                activeTab[libraryPostWithVersionsAndReviews.id] ===
                                                libraryPostVersion.id
                                                    ? 'active'
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                handleTabClick(
                                                    libraryPostWithVersionsAndReviews.id,
                                                    libraryPostVersion.id,
                                                )
                                            }
                                        >
                                            {libraryPostWithVersionsAndReviews.versions.length -
                                                libraryPostVersionIndex}
                                        </Button>
                                    ),
                                )}
                            </div>

                            {libraryPostWithVersionsAndReviews.versions.map((libraryPostVersion) => (
                                <div
                                    key={libraryPostVersion.id}
                                    className={`rounded border p-4 ${
                                        activeTab[libraryPostWithVersionsAndReviews.id] === libraryPostVersion.id
                                            ? 'active'
                                            : 'hidden'
                                    }`}
                                >
                                    <div className="neutral text-xs">
                                        {libraryPostVersion.updatedAt} (
                                        {timeAgo(
                                            new Date(libraryPostVersion.createdAt.replace(' ', 'T') + 'Z').getTime(),
                                        )}
                                        )
                                    </div>
                                    <Markdown>
                                        {`## ${libraryPostVersion.title}\n\n*${libraryPostVersion.subtitle}*\n\n${libraryPostVersion.content}`}
                                    </Markdown>
                                </div>
                            ))}
                        </div>
                    ),
                )}
            </div>
        </div>
    );
}

// Export - Default
export default LibraryArticleHistoryPage;
