'use client'; // This component uses client-only features

// Dependencies - React and Next.js
import React from 'react';

// Dependencies - Main Components
import { Button } from '@structure/source/common/buttons/Button';

// Dependencies - API
import { libraryApiClient } from '@project/source/api/LibraryApiClient';

// Dependencies - Utilities
import { addCommas } from '@structure/source/utilities/Number';

// Component - LibraryBuilderPage
export function LibraryBuilderPage() {
    // State
    const [lastCommandOutput, setLastCommandOutput] = React.useState('');
    const [isImprovingLibrary, setIsImprovingLibrary] = React.useState(false);
    const [improveLibraryCount, setImproveLibraryCount] = React.useState(0);
    const [elapsedTime, setElapsedTime] = React.useState('0.0s');
    const [requestDurations, setRequestDurations] = React.useState<number[]>([]);

    // References
    const isImprovingLibraryReference = React.useRef(isImprovingLibrary);
    const timerReference = React.useRef<NodeJS.Timeout | null>(null);

    // Effect to track isImprovingLibraryRef
    React.useEffect(
        function () {
            isImprovingLibraryReference.current = isImprovingLibrary;
        },
        [isImprovingLibrary],
    );

    // Function to toggle improving library
    async function toggleImprovingLibrary() {
        if(isImprovingLibraryReference.current) {
            setIsImprovingLibrary(false);
            if(timerReference.current) {
                clearInterval(timerReference.current);
            }
        }
        else {
            setIsImprovingLibrary(true);
            improveLibrary();
        }
    }

    async function improveLibrary() {
        setImproveLibraryCount((previousCount) => previousCount + 1);
        setElapsedTime('0.0s');

        // Start timer
        const startTime = Date.now();
        timerReference.current = setInterval(function () {
            setElapsedTime(((Date.now() - startTime) / 1000).toFixed(1) + 's');
        }, 1);

        const response = await libraryApiClient.request('improveLibrary');
        setLastCommandOutput(JSON.stringify(response, null, 4));

        // Stop timer
        if(timerReference.current) {
            clearInterval(timerReference.current);
        }

        // Calculate request duration
        const requestDuration = (Date.now() - startTime) / 1000;
        setRequestDurations((prevDurations) => [...prevDurations, requestDuration]);

        if(isImprovingLibraryReference.current) {
            improveLibrary();
        }
    }

    // Calculate statistics
    const totalRequests = requestDurations.length;
    const totalDuration = requestDurations.reduce((sum, duration) => sum + duration, 0);
    const averageRequestTime = totalRequests > 0 ? (totalDuration / totalRequests).toFixed(1) : '0.0';
    const requestsPerMinute = totalRequests > 0 ? (totalRequests / (totalDuration / 60)).toFixed(1) : '0.0';
    const requestsPerHour = totalRequests > 0 ? (totalRequests / (totalDuration / 3600)).toFixed(1) : '0.0';
    const requestsPerDay = totalRequests > 0 ? (totalRequests / (totalDuration / 86400)).toFixed(1) : '0.0';
    const requestsPerWeek = totalRequests > 0 ? (totalRequests / (totalDuration / 604800)).toFixed(1) : '0.0';
    const requestsPerMonth = totalRequests > 0 ? (totalRequests / (totalDuration / 2592000)).toFixed(1) : '0.0';

    // Calculate p90
    const sortedDurations = [...requestDurations].sort((a, b) => a - b);
    const p50Index = Math.floor(sortedDurations.length * 0.5);
    const p90Index = Math.floor(sortedDurations.length * 0.9);
    const p50RequestTime = sortedDurations[p50Index] ? sortedDurations[p50Index].toFixed(3) : '0.0';
    const p90RequestTime = sortedDurations[p90Index] ? sortedDurations[p90Index].toFixed(3) : '0.0';

    // Render the component
    return (
        <div className="container pb-32 pt-8">
            <h1 className="mb-8 text-3xl font-medium">Library Builder</h1>

            <div className="mb-8">
                <Button onClick={toggleImprovingLibrary} loading={isImprovingLibrary}>
                    {isImprovingLibrary ? 'Stop Improving Library' : 'Start Improving Library'}
                </Button>

                <p className="neutral mt-2 text-xs">
                    Improving Library Count: {improveLibraryCount} ({elapsedTime})
                </p>
                <p className="neutral mt-2 text-xs">Average Request Time: {addCommas(averageRequestTime)}s</p>
                <p className="neutral mt-2 text-xs">Requests per Minute: {addCommas(requestsPerMinute)}</p>
                <p className="neutral mt-2 text-xs">Requests per Hour: {addCommas(requestsPerHour)}</p>
                <p className="neutral mt-2 text-xs">Requests per Day: {addCommas(requestsPerDay)}</p>
                <p className="neutral mt-2 text-xs">Requests per Week: {addCommas(requestsPerWeek)}</p>
                <p className="neutral mt-2 text-xs">Requests per Month: {addCommas(requestsPerMonth)}</p>
                <p className="neutral mt-2 text-xs">p50 Request Time: {addCommas(p50RequestTime)}s</p>
                <p className="neutral mt-2 text-xs">p90 Request Time: {addCommas(p90RequestTime)}s</p>
            </div>

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
