'use client'; // This component uses client-only features

// Dependencies - React and Next.js
import React from 'react';
import Link from 'next/link';

// Dependencies - Main Components
import { Button } from '@structure/source/common/buttons/Button';

// Dependencies - API
import { ComphrensiveLibraryNodeInterface } from '@project/app/[...api]/route';

// Dependencies - Utilities
import { timeAgo } from '@structure/source/utilities/Time';

// Component - LibraryNodePage
export interface LibraryNodePageInterface {
    libraryNode: ComphrensiveLibraryNodeInterface;
}
export function LibraryNodePage(properties: LibraryNodePageInterface) {
    // Render the component
    return (
        <div className="container pb-32 pt-8">
            <h1 className="mb-8 text-3xl font-medium">{properties.libraryNode.title}</h1>

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

                {/* Updated At */}
                <div>
                    <div className="neutral text-xs uppercase">Updated At</div>
                    <div>
                        {/* updatedAt is in UTC */}
                        {properties.libraryNode.updatedAt} (
                        {timeAgo(new Date(properties.libraryNode.updatedAt.replace(' ', 'T') + 'Z').getTime())})
                    </div>
                </div>

                {/* Created At */}
                <div>
                    <div className="neutral text-xs uppercase">Created At</div>
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

            <div className="mt-6">
                <h2 className="text-lg">Raw Data</h2>
                <div className="neutral whitespace-pre font-mono text-xs">
                    {JSON.stringify(properties.libraryNode, null, 4)}
                </div>
            </div>
        </div>
    );
}

// Export - Default
export default LibraryNodePage;
