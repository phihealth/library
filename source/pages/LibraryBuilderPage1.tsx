'use client'; // This component uses client-only features

// Dependencies - React and Next.js
import React from 'react';

// Dependencies - Main Components
import { Button } from '@structure/source/common/buttons/Button';
import { FormInputSelect } from '@structure/source/common/forms/FormInputSelect';

// Dependencies - API
import { LibraryApiInterface } from '@project/source/api/LibraryApiInterfaces';
import { libraryApiClient } from '@project/source/api/LibraryApiClient';

// Dependencies - Utilities
import { addCommas } from '@structure/source/utilities/Number';

// Types
interface Stats {
    improveLibraryCount: number;
    elapsedTime: string;
    requestDurations: number[];
}

interface ContributorType {
    id: number;
    digitalIntelligenceApiUrl: string;
    selectedApiEndpoint: keyof LibraryApiInterface;
    isRunning: boolean;
    stats: Stats;
}

// Component - GlobalStatistics
function GlobalStatistics(props: { contributors: ContributorType[] }) {
    const { contributors } = props;

    // Aggregate stats from all contributors
    const totalRequestDurations = contributors.flatMap(function (contributor) {
        return contributor.stats.requestDurations || [];
    });
    const totalRequests = totalRequestDurations.length;
    const totalDuration = totalRequestDurations.reduce(function (sum, duration) {
        return sum + duration;
    }, 0);
    const averageRequestTime = totalRequests > 0 ? (totalDuration / totalRequests).toFixed(1) : '0.0';
    const requestsPerMinute =
        totalRequests > 0 && totalDuration > 0 ? ((totalRequests / totalDuration) * 60).toFixed(1) : '0.0';
    const requestsPerHour =
        totalRequests > 0 && totalDuration > 0 ? ((totalRequests / totalDuration) * 3600).toFixed(1) : '0.0';
    const requestsPer12Hours =
        totalRequests > 0 && totalDuration > 0 ? ((totalRequests / totalDuration) * 43200).toFixed(1) : '0.0';
    const requestsPerDay =
        totalRequests > 0 && totalDuration > 0 ? ((totalRequests / totalDuration) * 86400).toFixed(1) : '0.0';
    const requestsPerWeek =
        totalRequests > 0 && totalDuration > 0 ? ((totalRequests / totalDuration) * 604800).toFixed(1) : '0.0';
    const requestsPerMonth =
        totalRequests > 0 && totalDuration > 0 ? ((totalRequests / totalDuration) * 2592000).toFixed(1) : '0.0';

    // Calculate percentiles
    const sortedDurations = [...totalRequestDurations].sort(function (a, b) {
        return a - b;
    });
    const p50Index = Math.floor(sortedDurations.length * 0.5);
    const p90Index = Math.floor(sortedDurations.length * 0.9);
    const p99Index = Math.floor(sortedDurations.length * 0.99);
    const p50RequestTime = sortedDurations[p50Index] ? sortedDurations[p50Index].toFixed(3) : '0.0';
    const p90RequestTime = sortedDurations[p90Index] ? sortedDurations[p90Index].toFixed(3) : '0.0';
    const p99RequestTime = sortedDurations[p99Index] ? sortedDurations[p99Index].toFixed(3) : '0.0';

    return (
        <div className="mb-8">
            <h2 className="mb-4 text-2xl font-medium">Global Statistics</h2>
            <p className="neutral mt-2 text-xs">Total Requests: {addCommas(totalRequests)}</p>
            <p className="neutral mt-2 text-xs">Average Request Time: {addCommas(averageRequestTime)}s</p>
            <p className="neutral mt-2 text-xs">Requests per Minute: {addCommas(requestsPerMinute)}</p>
            <p className="neutral mt-2 text-xs">Requests per Hour: {addCommas(requestsPerHour)}</p>
            <p className="neutral mt-2 text-xs">Requests per 12 Hours: {addCommas(requestsPer12Hours)}</p>
            <p className="neutral mt-2 text-xs">Requests per Day: {addCommas(requestsPerDay)}</p>
            <p className="neutral mt-2 text-xs">Requests per Week: {addCommas(requestsPerWeek)}</p>
            <p className="neutral mt-2 text-xs">Requests per Month: {addCommas(requestsPerMonth)}</p>
            <p className="neutral mt-2 text-xs">p50 Request Time: {addCommas(p50RequestTime)}s</p>
            <p className="neutral mt-2 text-xs">p90 Request Time: {addCommas(p90RequestTime)}s</p>
            <p className="neutral mt-2 text-xs">p99 Request Time: {addCommas(p99RequestTime)}s</p>
        </div>
    );
}

// Component - Contributor
function Contributor(props: {
    contributor: ContributorType;
    onUpdate: (
        fields: Partial<ContributorType> | ((prevContributor: ContributorType) => Partial<ContributorType>),
    ) => void;
    onRemove: () => void;
}) {
    const { contributor, onUpdate, onRemove } = props;
    const { digitalIntelligenceApiUrl, selectedApiEndpoint, isRunning, stats } = contributor;

    // References
    const isRunningRef = React.useRef(isRunning);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    // Effect to sync isRunningRef
    React.useEffect(
        function () {
            isRunningRef.current = isRunning;
        },
        [isRunning],
    );

    // Function to start/stop contributor
    function toggleRunning() {
        console.log('toggleRunning', isRunningRef.current);

        if(isRunningRef.current) {
            console.log('stopping');

            isRunningRef.current = false; // Update ref immediately
            onUpdate({ isRunning: false });
            if(timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        else {
            console.log('starting');

            isRunningRef.current = true; // Update ref immediately
            onUpdate({ isRunning: true });
            runContributor();
        }
    }

    async function runContributor() {
        if(!isRunningRef.current) return; // Check if should continue
        console.log('runContributor', isRunningRef.current);

        onUpdate(function (prevContributor) {
            return {
                stats: {
                    ...prevContributor.stats,
                    improveLibraryCount: prevContributor.stats.improveLibraryCount + 1,
                    elapsedTime: '0.0s',
                },
            };
        });

        // Start timer
        const startTime = Date.now();
        if(timerRef.current) {
            clearInterval(timerRef.current);
        }
        timerRef.current = setInterval(function () {
            onUpdate(function (prevContributor) {
                return {
                    stats: {
                        ...prevContributor.stats,
                        elapsedTime: ((Date.now() - startTime) / 1000).toFixed(1) + 's',
                    },
                };
            });
        }, 100);

        console.log('calling', selectedApiEndpoint, digitalIntelligenceApiUrl);

        await libraryApiClient.request(selectedApiEndpoint, {
            digitalIntelligenceHost: digitalIntelligenceApiUrl,
        });

        // Stop timer
        if(timerRef.current) {
            clearInterval(timerRef.current);
        }

        // Calculate request duration
        const requestDuration = (Date.now() - startTime) / 1000;
        onUpdate(function (prevContributor) {
            return {
                stats: {
                    ...prevContributor.stats,
                    requestDurations: [...prevContributor.stats.requestDurations, requestDuration],
                },
            };
        });

        if(isRunningRef.current) {
            // Schedule next run
            await runContributor();
        }
    }

    // Calculate statistics
    const totalRequests = stats.requestDurations.length;
    const totalDuration = stats.requestDurations.reduce(function (sum, duration) {
        return sum + duration;
    }, 0);
    const averageRequestTime = totalRequests > 0 ? (totalDuration / totalRequests).toFixed(1) : '0.0';
    const requestsPerMinute =
        totalRequests > 0 && totalDuration > 0 ? ((totalRequests / totalDuration) * 60).toFixed(1) : '0.0';

    // Calculate percentiles
    const sortedDurations = [...stats.requestDurations].sort(function (a, b) {
        return a - b;
    });
    const p50Index = Math.floor(sortedDurations.length * 0.5);
    const p90Index = Math.floor(sortedDurations.length * 0.9);
    const p99Index = Math.floor(sortedDurations.length * 0.99);
    const p50RequestTime = sortedDurations[p50Index] ? sortedDurations[p50Index].toFixed(3) : '0.0';
    const p90RequestTime = sortedDurations[p90Index] ? sortedDurations[p90Index].toFixed(3) : '0.0';
    const p99RequestTime = sortedDurations[p99Index] ? sortedDurations[p99Index].toFixed(3) : '0.0';

    return (
        <div className="mb-8 rounded border p-4">
            <h2 className="mb-4 text-xl font-medium">Contributor</h2>
            {/* Digital Intelligence Host */}
            <FormInputSelect
                id="digitalIntelligenceApiUrl"
                label="Digital Intelligence"
                items={[
                    { value: 'http://10.10.100.1:1234', content: 'Workshop' },
                    { value: 'http://10.10.100.10:1234', content: 'Cloud' },
                    { value: 'http://10.10.100.20:1234', content: 'Server' },
                ]}
                defaultValue={digitalIntelligenceApiUrl}
                onChange={function (value) {
                    onUpdate({ digitalIntelligenceApiUrl: value });
                }}
            />

            {/* API Endpoint Selection */}
            <FormInputSelect
                id="selectedApiEndpoint"
                label="API Endpoint"
                items={[{ value: 'improveLibrary', content: 'Improve Library' }]}
                defaultValue={selectedApiEndpoint}
                onChange={function (value) {
                    onUpdate({ selectedApiEndpoint: value as keyof LibraryApiInterface });
                }}
            />

            {/* Control Buttons */}
            <div className="mt-4 flex space-x-2">
                <Button onClick={toggleRunning}>{isRunning ? 'Stop' : 'Start'}</Button>
                <Button onClick={onRemove} variant="destructive">
                    Remove Contributor
                </Button>
            </div>

            {/* Stats */}
            <div className="mt-4">
                <p className="neutral mt-2 text-xs">
                    Improve Library Count: {stats.improveLibraryCount} ({stats.elapsedTime})
                </p>
                <p className="neutral mt-2 text-xs">Average Request Time: {addCommas(averageRequestTime)}s</p>
                <p className="neutral mt-2 text-xs">Requests per Minute: {addCommas(requestsPerMinute)}</p>
                <p className="neutral mt-2 text-xs">p50 Request Time: {addCommas(p50RequestTime)}s</p>
                <p className="neutral mt-2 text-xs">p90 Request Time: {addCommas(p90RequestTime)}s</p>
                <p className="neutral mt-2 text-xs">p99 Request Time: {addCommas(p99RequestTime)}s</p>
            </div>
        </div>
    );
}

// Component - LibraryBuilderPage
export function LibraryBuilderPage() {
    // State for contributors
    const [contributors, setContributors] = React.useState<ContributorType[]>([
        {
            id: 1,
            digitalIntelligenceApiUrl: 'http://10.10.100.1:1234',
            selectedApiEndpoint: 'improveLibrary',
            isRunning: false,
            stats: {
                improveLibraryCount: 0,
                elapsedTime: '0.0s',
                requestDurations: [],
            },
        },
        {
            id: 2,
            digitalIntelligenceApiUrl: 'http://10.10.100.10:1234',
            selectedApiEndpoint: 'improveLibrary',
            isRunning: false,
            stats: {
                improveLibraryCount: 0,
                elapsedTime: '0.0s',
                requestDurations: [],
            },
        },
        {
            id: 3,
            digitalIntelligenceApiUrl: 'http://10.10.100.20:1234',
            selectedApiEndpoint: 'improveLibrary',
            isRunning: false,
            stats: {
                improveLibraryCount: 0,
                elapsedTime: '0.0s',
                requestDurations: [],
            },
        },
    ]);

    // Function to add a new contributor
    function addContributor() {
        const newContributor: ContributorType = {
            id: Date.now(), // Simple unique id
            digitalIntelligenceApiUrl: '',
            selectedApiEndpoint: 'improveLibrary',
            isRunning: false,
            stats: {
                improveLibraryCount: 0,
                elapsedTime: '0.0s',
                requestDurations: [],
            },
        };
        setContributors([...contributors, newContributor]);
    }

    // Function to remove a contributor
    function removeContributor(id: number) {
        setContributors(
            contributors.filter(function (contributor) {
                return contributor.id !== id;
            }),
        );
    }

    // Function to update a contributor
    function updateContributor(
        id: number,
        updatedFields: Partial<ContributorType> | ((prevContributor: ContributorType) => Partial<ContributorType>),
    ) {
        setContributors(function (prevContributors) {
            return prevContributors.map(function (contributor) {
                if(contributor.id === id) {
                    let updated: Partial<ContributorType>;
                    if(typeof updatedFields === 'function') {
                        updated = updatedFields(contributor);
                    }
                    else {
                        updated = updatedFields;
                    }

                    const { stats: updatedStats, ...otherUpdatedFields } = updated;
                    return {
                        ...contributor,
                        ...otherUpdatedFields,
                        stats: {
                            ...contributor.stats,
                            ...updatedStats,
                        },
                    };
                }
                else {
                    return contributor;
                }
            });
        });
    }

    // Render the component
    return (
        <div className="container pb-32 pt-8">
            <h1 className="mb-8 text-3xl font-medium">Library Builder</h1>

            {/* Global Statistics */}
            <GlobalStatistics contributors={contributors} />

            {/* List of Contributors */}
            {contributors.map(function (contributor) {
                return (
                    <Contributor
                        key={contributor.id}
                        contributor={contributor}
                        onUpdate={function (updatedFields) {
                            updateContributor(contributor.id, updatedFields);
                        }}
                        onRemove={function () {
                            removeContributor(contributor.id);
                        }}
                    />
                );
            })}

            {/* Add Contributor Button */}
            <Button onClick={addContributor} className="mt-4">
                Add a Contributor
            </Button>
        </div>
    );
}

// Export - Default
export default LibraryBuilderPage;
