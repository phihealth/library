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

// Component - LibraryNodePage
export interface LibraryNodePageInterface {
    libraryNode: LibraryNodeComprehensiveInterface;
}
export function LibraryNodePage(properties: LibraryNodePageInterface) {
    const [activeTab, setActiveTab] = React.useState({});

    const handleTabClick = (postId, versionId) => {
        setActiveTab((prevState) => ({
            ...prevState,
            [postId]: versionId,
        }));
    };

    // Render the component
    return (
        <div className="container pb-32 pt-8">
            <h1 className="mb-8 text-3xl font-medium">{properties.libraryNode.title}</h1>

            <div className="mt-6">
                <h2 className="text-lg">Posts</h2>
                {properties.libraryNode.postsWithVersionsAndReviews.map((libraryPostWithVersionsAndReviews) => (
                    <div key={libraryPostWithVersionsAndReviews.id} className="">
                        <div className="tab-list">
                            {libraryPostWithVersionsAndReviews.versions.map(
                                (libraryPostVersion, libraryPostVersionIndex) => (
                                    <Button
                                        key={libraryPostVersion.id}
                                        variant="ghost"
                                        className={`${
                                            activeTab[libraryPostWithVersionsAndReviews.id] === libraryPostVersion.id
                                                ? 'active'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            handleTabClick(libraryPostWithVersionsAndReviews.id, libraryPostVersion.id)
                                        }
                                    >
                                        {libraryPostWithVersionsAndReviews.versions.length - libraryPostVersionIndex}
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
                                    {timeAgo(new Date(libraryPostVersion.createdAt.replace(' ', 'T') + 'Z').getTime())})
                                </div>
                                <Markdown>
                                    {`## ${libraryPostVersion.title}\n\n*${libraryPostVersion.subtitle}*\n\n${libraryPostVersion.content}`}
                                </Markdown>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <hr className="my-6" />

            {/* LibraryNode */}
            <div className="flex flex-col space-y-4">
                {/* ID */}
                <div>
                    <div className="neutral text-xs uppercase">ID</div>
                    <div>{properties.libraryNode.id}</div>
                </div>

                {/* Status */}
                <div>
                    <div className="neutral text-xs uppercase">Status</div>
                    <div>{properties.libraryNode.status}</div>
                </div>

                {/* Slug */}
                <div>
                    <div className="neutral text-xs uppercase">Slug</div>
                    <div>{properties.libraryNode.slug}</div>
                </div>

                {/* Last Reviewed At */}
                <div>
                    <div className="neutral text-xs uppercase">Time Last Reviewed</div>
                    <div>
                        {/* lastReviewedAt is in UTC */}
                        {/* 2024-10-09T05:10:17.263Z */}
                        {properties.libraryNode.lastReviewedAt}
                        {properties.libraryNode.lastReviewedAt ? (
                            <>
                                {' '}
                                (
                                {timeAgo(
                                    new Date(
                                        properties.libraryNode.lastReviewedAt
                                            // Replace the .263
                                            .replace(/\.\d+/, ''),
                                    ).getTime(),
                                )}
                                )
                            </>
                        ) : (
                            'Not Reviewed'
                        )}
                    </div>
                </div>

                {/* Updated At */}
                <div>
                    <div className="neutral text-xs uppercase">Time Updated</div>
                    <div>
                        {/* updatedAt is in UTC */}
                        {properties.libraryNode.updatedAt} (
                        {timeAgo(new Date(properties.libraryNode.updatedAt.replace(' ', 'T') + 'Z').getTime())})
                    </div>
                </div>

                {/* Created At */}
                <div>
                    <div className="neutral text-xs uppercase">Time Created</div>
                    <div>
                        {/* createdAt is in UTC */}
                        {properties.libraryNode.createdAt} (
                        {timeAgo(new Date(properties.libraryNode.createdAt.replace(' ', 'T') + 'Z').getTime())})
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h2 className="text-lg">Inbound Relationships</h2>
                {properties.libraryNode.inboundRelationships.map(function (inboundRelationship) {
                    return (
                        <div key={inboundRelationship.id} className="">
                            <Link href={'/library/' + inboundRelationship.libraryNodeSlug} className="primary">
                                {inboundRelationship.libraryNodeTitle}
                            </Link>{' '}
                            <span className="italic">{inboundRelationship.relationshipType}</span>{' '}
                            <Link href={'/library/' + properties.libraryNode.slug} className="primary">
                                {properties.libraryNode.title}
                            </Link>{' '}
                            ({inboundRelationship.confidence ? inboundRelationship.confidence : 'unknown confidence'})
                        </div>
                    );
                })}
            </div>

            <div className="mt-6">
                <h2 className="text-lg">Outbound Relationships</h2>
                {properties.libraryNode.outboundRelationships.map(function (outboundRelationship) {
                    return (
                        <div key={outboundRelationship.id} className="">
                            <Link href={'/library/' + properties.libraryNode.slug} className="primary">
                                {properties.libraryNode.title}
                            </Link>{' '}
                            <span className="italic">{outboundRelationship.relationshipType}</span>{' '}
                            <Link href={'/library/' + outboundRelationship.libraryNodeSlug} className="primary">
                                {outboundRelationship.libraryNodeTitle}
                            </Link>{' '}
                            ({outboundRelationship.confidence ? outboundRelationship.confidence : 'unknown confidence'})
                        </div>
                    );
                })}
            </div>

            <div className="mt-6">
                <h2 className="text-lg">History</h2>
                {properties.libraryNode.history.map(function (history) {
                    return (
                        <div key={history.id} className="">
                            <div>
                                <span className="italic">{history.action}</span> (
                                {timeAgo(new Date(history.createdAt.replace(' ', 'T') + 'Z').getTime())})
                            </div>
                        </div>
                    );
                })}
            </div>

            <hr className="my-6" />

            <div className="mt-6">
                <h2 className="text-lg">Raw Data</h2>
                <div className="neutral whitespace-pre text-wrap font-mono text-xs">
                    {JSON.stringify(properties.libraryNode, null, 4)}
                </div>
            </div>
        </div>
    );
}

// Export - Default
export default LibraryNodePage;
