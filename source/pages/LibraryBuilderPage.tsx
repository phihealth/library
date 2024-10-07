'use client'; // This component uses client-only features

// Dependencies - React and Next.js
import React from 'react';

// Dependencies - Main Components
import { Button } from '@structure/source/common/buttons/Button';

// Dependencies - API
import { libraryApiClient } from '@project/source/api/LibraryApiClient';

// Component - LibraryBuilderPage
export function LibraryBuilderPage() {
    // State
    const [lastCommandOutput, setLastCommandOutput] = React.useState('');

    // Render the component
    return (
        <div className="container pb-32 pt-8">
            <h1 className="mb-8 text-3xl font-medium">Library Builder</h1>

            <div className="flex">
                <div>
                    <p className="neutral mb-4 text-xs uppercase">Commands</p>

                    <div className="flex flex-col space-y-2">
                        {/* Get Tables */}
                        <Button
                            onClick={async function () {
                                setLastCommandOutput(
                                    JSON.stringify(await libraryApiClient.request('getTables'), null, 4),
                                );
                            }}
                        >
                            Get Tables
                        </Button>

                        {/* Get Random Library Node */}
                        <Button
                            onClick={async function () {
                                setLastCommandOutput(
                                    JSON.stringify(await libraryApiClient.request('getRandomLibraryNode'), null, 4),
                                );
                            }}
                        >
                            Get Random Library Node
                        </Button>

                        {/* Get Library Nodes */}
                        <Button
                            onClick={async function () {
                                setLastCommandOutput(
                                    JSON.stringify(await libraryApiClient.request('getLibraryNodes'), null, 4),
                                );
                            }}
                        >
                            Get Library Nodes
                        </Button>

                        {/* Improve Library */}
                        <Button
                            onClick={async function () {
                                setLastCommandOutput(
                                    JSON.stringify(await libraryApiClient.request('improveLibrary'), null, 4),
                                );
                            }}
                        >
                            Improve Library
                        </Button>
                    </div>
                </div>
                <div className="ml-4 flex-grow">
                    <p className="neutral mb-4 text-xs uppercase">Output</p>
                    <div className="whitespace-pre-wrap rounded border p-4 font-mono text-xs">{lastCommandOutput}</div>
                </div>
            </div>
        </div>
    );
}

// Export - Default
export default LibraryBuilderPage;
