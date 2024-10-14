'use client'; // This component uses client-only features

// Dependencies - React and Next.js
import React from 'react';
import Link from 'next/link';

// Dependencies - Main Components
import { Button } from '@structure/source/common/buttons/Button';
import { Markdown } from '@structure/source/common/markdown/Markdown';

// Dependencies - API
import { LibraryNodeComprehensiveInterface } from '@project/source/api/LibraryApiInterfaces';

// Dependencies - Assets
import PhiLogo from '@structure/assets/icons/platforms/PhiIcon.svg';

// Dependencies - Utilities
import { timeAgo } from '@structure/source/utilities/Time';

// Component - LibraryArticlePage
export interface LibraryArticlePageInterface {
    libraryNode: LibraryNodeComprehensiveInterface;
}
export function LibraryArticlePage(properties: LibraryArticlePageInterface) {
    const libraryPostVersion = properties.libraryNode.postsWithAssetsAndVersionsAndReviews[0]?.versions[0];
    // console.log('libraryNode', properties.libraryNode);

    const firstAsset = properties.libraryNode.postsWithAssetsAndVersionsAndReviews[0]?.assets[0];
    // console.log('firstAsset', firstAsset);

    // Render the component
    return (
        <div className="">
            {/* <h1 className="mb-8 text-3xl font-medium">{properties.libraryNode.title}</h1>
            <Link href={`/library/articles/${properties.libraryNode.slug}/history`}>
                <Button variant="ghost">History</Button>
            </Link> */}

            {/* <div className="neutral mt-12 text-xs">
                {libraryPostVersion.updatedAt} (
                
            </div> */}

            {/* No Article */}
            {!libraryPostVersion && <div className="mt-6">Article not found.</div>}

            {/* Article */}
            {libraryPostVersion && (
                <div className="relative">
                    {/* Banner */}
                    {/* sticky top-[52px]  */}
                    <div className="border-b bg-light bg-opacity-75 p-2.5 text-center font-serif text-lg backdrop-blur-3xl transition-colors dark:border-dark-4 dark:bg-dark-1">
                        Library
                    </div>

                    {/* Image */}
                    {firstAsset && (
                        <div className="">
                            <img
                                // src={'/images/articles/banner.webp'}
                                src={'/images/articles/' + firstAsset.fileNameWithExtension}
                                alt={libraryPostVersion.title}
                                // One phi down (https://www.phi.health/design/phi-sizing)
                                className="max-h-[80vh] w-full object-cover md:max-h-[61.805vh]"
                            />
                        </div>
                    )}

                    {/* Container */}
                    <div className="container mt-8 max-w-[680px] pb-32">
                        {/* Title */}
                        <h1 className="text-center font-serif leading-normal">
                            {libraryPostVersion.title.split(':').map(function (part, index, array) {
                                return (
                                    <React.Fragment key={index}>
                                        {part}
                                        {index < array.length - 1 && (
                                            <>
                                                :<br />
                                            </>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </h1>

                        {/* Subtitle */}
                        <h2 className="neutral mt-4 text-center font-serif text-xl italic">
                            {libraryPostVersion.subtitle}
                        </h2>

                        <hr className="mb-4 mt-12" />

                        <div className="">
                            <div className="flex items-center justify-between">
                                {/* Author */}
                                <div className="flex items-center space-x-3 text-sm">
                                    <PhiLogo className="h-8 w-8" />
                                    <div>
                                        <div>Authored by Phi &bull; 28 revisions &bull; 4 views</div>
                                        <div className="neutral">
                                            2 minute read &bull; Updated{' '}
                                            {timeAgo(
                                                new Date(
                                                    libraryPostVersion.createdAt.replace(' ', 'T') + 'Z',
                                                ).getTime(),
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Controls */}
                                <div className="flex space-x-2 text-sm">
                                    <div>Like</div>
                                    <div>Comment</div>
                                    <div>Save</div>
                                    <div>History</div>
                                    <div>Share</div>
                                    <div>More</div>
                                </div>
                            </div>
                        </div>

                        <hr className="mb-12 mt-4" />

                        {/* Content */}
                        {/* Dropcap: */}
                        {/* first-letter:float-start first-letter:pr-2 first-letter:pt-2.5 first-letter:font-serif first-letter:text-[3rem] first-letter:leading-[2rem] */}
                        <Markdown className="">{`${libraryPostVersion.content}`}</Markdown>

                        {/* Sample Article Content Image */}
                        {/* <div className="mb-14 mt-10">
                            <div className="rounded-lg">
                                <img src="/images/leafy.webp" alt="Leafy Greens" className="w-full rounded-lg" />
                            </div>
                            <p className="neutral mt-2 text-center">Lutein is particularly abundant in leafy greens</p>
                        </div> */}
                    </div>
                </div>
            )}
        </div>
    );
}

// Export - Default
export default LibraryArticlePage;
