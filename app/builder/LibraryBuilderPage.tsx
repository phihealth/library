'use client'; // This component uses client-only features

// Dependencies - React and Next.js
import React from 'react';

// Dependencies - Main Components
import { Button } from '@structure/source/common/buttons/Button';

// Component - LibraryBuilderPage
export function LibraryBuilderPage() {
    // State
    const [lastCommandOutput, setLastCommandOutput] = React.useState('');

    // Function
    const api = async function (path: string) {
        // setLastCommandOutput('Loading...');

        // Fetch the API
        const response = await fetch('/api/' + path);
        let body = await response.text();
        const json = JSON.parse(body);
        if(!json.error) {
            body = JSON.stringify(json, null, 4);
        }

        // Update the state
        setLastCommandOutput(body);

        // Recurse
        if(path == 'improveLibrary') {
            return api('improveLibrary');
        }
    };

    // Render the component
    return (
        <div className="container pb-32 pt-8">
            <h1 className="mb-8 text-3xl font-medium">Library Builder</h1>

            <div className="flex">
                <div>
                    <p className="neutral mb-4 text-xs uppercase">Commands</p>

                    <div className="flex flex-col space-y-2">
                        {/* Drop Tables */}
                        {/* <Button
                            onClick={function () {
                                api('dropTables');
                            }}
                        >
                            Drop Tables
                        </Button> */}

                        {/* Create Tables */}
                        {/* <Button
                            onClick={function () {
                                api('createTables');
                            }}
                        >
                            Create Tables
                        </Button> */}

                        {/* Show Tables */}
                        <Button
                            onClick={function () {
                                api('showTables');
                            }}
                        >
                            Show Tables
                        </Button>

                        {/* Get Random Library Node */}
                        <Button
                            onClick={function () {
                                api('getRandomLibraryNode');
                            }}
                        >
                            Get Random Library Node
                        </Button>

                        {/* Improve Library */}
                        <Button
                            onClick={function () {
                                api('improveLibrary');
                            }}
                        >
                            Improve Library
                        </Button>

                        {/* Get Library Nodes */}
                        <Button
                            onClick={function () {
                                api('getLibraryNodes');
                            }}
                        >
                            Get Library Nodes
                        </Button>

                        {/* Get Table Record Counts */}
                        <Button
                            onClick={function () {
                                api('getTableRecordCounts');
                            }}
                        >
                            Get Table Record Counts
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
