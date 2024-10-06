// Dependencies - Next.js
import type { NextRequest } from 'next/server';

// Dependencies - API
import { Database } from 'sqlite3';
import { v4 as Uuidv4 } from 'uuid';
import {
    LibraryNodeInterface,
    LibraryNodeHistoryInterface,
    LibraryNodeRelationshipInterface,
    LibraryNodeRelationshipHistoryInterface,
    LibraryNodeRelationshipTypeInterface,
    LibraryNodeRelationshipTypeHistoryInterface,
    LibrarianInterface,
    DigitalIntelligenceInterface,
    DigitalIntelligenceTextHyperparametersInterface,
    DigitalIntelligencePromptInterface,
    ChangeDetailInterface,
    LibraryPostInterface,
    ComphrensiveLibraryNodeInterface,
    ConciseLibraryNodeRelationship,
    ConciseLibraryNodeInboundRelationship,
    ConciseLibraryNodeOutboundRelationship,
    ConciseLibraryNodeWithRelationships,
} from '@project/source/api/LibraryApiInterfaces';

// Dependencies - Utilities
import { slug } from '@structure/source/utilities/String';

// Function to open a SQLite database connection
function getDatabaseConnection(): Database {
    return new Database('ProjectDatabase.sqlite', function (error) {
        if(error) {
            console.error('Failed to open database:', error);
            throw error;
        }
    });
}

// Function to close the database connection
function closeDatabase(sqliteDatabase: Database) {
    sqliteDatabase.close(function (error) {
        if(error) {
            console.error('Failed to close the database:', error);
        }
        else {
            // console.log('Database connection closed');
        }
    });
}

// GET request
export async function GET(request: NextRequest) {
    // console.log('request.nextUrl.pathname', request.nextUrl.pathname);

    // Show tables
    if(request.nextUrl.pathname === '/api/showTables') {
        console.log('Showing tables');
        const tables = await showTables();
        return new Response(JSON.stringify({ tables }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    // Get random LibraryNode
    else if(request.nextUrl.pathname === '/api/getRandomLibraryNode') {
        console.log('Getting random LibraryNode');
        const node = await getRandomLibraryNode();
        return new Response(JSON.stringify({ node }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    // Get library node by slug
    else if(request.nextUrl.pathname === '/api/getLibraryNodeBySlug') {
        console.log('Getting LibraryNode by slug');
        const slug = request.nextUrl.searchParams.get('slug')!;
        const getLibraryNodeBySlugResponse = await getLibraryNodeBySlug(slug);
        return new Response(JSON.stringify(getLibraryNodeBySlugResponse), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    // Get LibraryNodes
    else if(request.nextUrl.pathname === '/api/getLibraryNodes') {
        // console.log('Getting LibraryNodes');

        const page = request.nextUrl.searchParams.get('page') ? Number(request.nextUrl.searchParams.get('page')) : 1;
        const itemsPerPage = request.nextUrl.searchParams.get('itemsPerPage')
            ? Number(request.nextUrl.searchParams.get('itemsPerPage'))
            : 20;
        const searchTerm = request.nextUrl.searchParams.get('searchTerm');

        const getLibraryNodesResponse = await getLibraryNodes(page, itemsPerPage, searchTerm);
        // console.log('getLibraryNodesResponse', getLibraryNodesResponse);

        return new Response(JSON.stringify(getLibraryNodesResponse), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    // Get LibraryNode with inbound and outbound relationships
    else if(request.nextUrl.pathname === '/api/getLibraryNode') {
        console.log('Getting LibraryNode with relationships');
        const libraryNode = await getLibraryNode();
        return new Response(JSON.stringify({ libraryNode }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    // Improve the library
    else if(request.nextUrl.pathname === '/api/improveLibrary') {
        // console.log('Improving the library');
        const libraryImprovement = await improveLibrary();
        return new Response(JSON.stringify({ libraryImprovement }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    // Get table record counts
    else if(request.nextUrl.pathname === '/api/getTableRecordCounts') {
        console.log('Getting table record counts');
        const tableRecordCounts = await getTableRecordCounts();
        return new Response(JSON.stringify({ tableRecordCounts }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    return new Response(JSON.stringify({ message: 'Database operation attempted.' }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

async function createLibraryNode(sqliteDatabase: Database, title: string, librarianId?: string) {
    return new Promise<void>((resolve, reject) => {
        const nodeId = Uuidv4();
        sqliteDatabase.run(
            `INSERT INTO LibraryNode (id, title, slug) VALUES (?, ?, ?)`,
            [nodeId, title, slug(title)],
            function (error) {
                if(error) {
                    console.error(title + ' - Failed to insert into LibraryNode:', error);
                    reject(error);
                }
                else {
                    console.log(`Inserted node: ${title}`);

                    // Add to history
                    const historyId = Uuidv4();
                    sqliteDatabase.run(
                        `INSERT INTO LibraryNodeHistory (id, libraryNodeId, librarianId, action, metadata) VALUES (?, ?, ?, ?, ?)`,
                        [historyId, nodeId, librarianId, 'create', JSON.stringify({ title })],
                        function (error) {
                            if(error) {
                                console.error('Failed to insert into LibraryNodeHistory:', error);
                                reject(error);
                            }
                            else {
                                // console.log(`Inserted node history: ${title}`);
                                resolve();
                            }
                        },
                    );

                    resolve();
                }
            },
        );
    });
}

async function createLibraryNodeRelationship(
    sqliteDatabase: Database,
    sourceTitle: string,
    targetTitle: string,
    relationshipType: string,
) {
    const sourceNode = await getLibraryNodeByTitle(sqliteDatabase, sourceTitle);
    const targetNode = await getLibraryNodeByTitle(sqliteDatabase, targetTitle);
    const relationshipTypeData = await getLibraryNodeRelationshipTypeByName(sqliteDatabase, relationshipType);

    return new Promise<void>((resolve, reject) => {
        const relationshipId = Uuidv4();
        sqliteDatabase.run(
            `INSERT INTO LibraryNodeRelationship (id, sourceNodeId, targetNodeId, relationshipTypeId) VALUES (?, ?, ?, ?)`,
            [relationshipId, sourceNode.id, targetNode.id, relationshipTypeData.id],
            function (error) {
                if(error) {
                    console.error('Failed to insert into LibraryNodeRelationship:', error);
                    console.error(`Failed relationship: ${sourceTitle} ${relationshipType} ${targetTitle}`);
                    reject(error);
                }
                else {
                    console.log(`Inserted relationship: ${sourceTitle} ${relationshipType} ${targetTitle}`);

                    // Add to history
                    const historyId = Uuidv4();
                    sqliteDatabase.run(
                        `INSERT INTO LibraryNodeRelationshipHistory (id, libraryNodeRelationshipId, librarianId, action, metadata) VALUES (?, ?, ?, ?, ?)`,
                        [historyId, relationshipId, 'system', 'create', JSON.stringify({ relationshipType })],
                        function (error) {
                            if(error) {
                                console.error('Failed to insert into LibraryNodeRelationshipHistory:', error);
                                reject(error);
                            }
                            else {
                                console.log(
                                    `Inserted relationship history: ${sourceTitle} ${relationshipType} ${targetTitle}`,
                                );
                            }
                        },
                    );

                    resolve();
                }
            },
        );
    });
}

async function createLibraryNodeRelationshipType(sqliteDatabase: Database, type: string) {
    return new Promise<void>((resolve, reject) => {
        const relationshipTypeId = Uuidv4();
        sqliteDatabase.run(
            `INSERT INTO LibraryNodeRelationshipType (id, type) VALUES (?, ?)`,
            [relationshipTypeId, type],
            function (error) {
                if(error) {
                    console.error('Failed to insert into LibraryNodeRelationshipType:', error);
                    reject(error);
                }
                else {
                    console.log(`Inserted relationship type: ${type}`);

                    // Add to history
                    const historyId = Uuidv4();
                    sqliteDatabase.run(
                        `INSERT INTO LibraryNodeRelationshipTypeHistory (id, libraryNodeRelationshipTypeId, librarianId, action, metadata) VALUES (?, ?, ?, ?, ?)`,
                        [historyId, relationshipTypeId, 'system', 'create', JSON.stringify({ type })],
                        function (error) {
                            if(error) {
                                console.error('Failed to insert into LibraryNodeRelationshipTypeHistory:', error);
                                reject(error);
                            }
                            else {
                                console.log(`Inserted relationship type history: ${type}`);
                            }
                        },
                    );

                    resolve();
                }
            },
        );
    });
}

async function getLibraryNodeByTitle(sqliteDatabase: Database, title: string): Promise<LibraryNodeInterface> {
    return new Promise<LibraryNodeInterface>((resolve, reject) => {
        sqliteDatabase.get(
            `SELECT * FROM LibraryNode WHERE LOWER(title) = ?`,
            [title.toLocaleLowerCase()],
            function (error, row) {
                if(error) {
                    // console.error('Failed to retrieve LibraryNode by title:', error);
                    reject(title + ' - ' + error);
                }
                else if(row) {
                    resolve(row as LibraryNodeInterface);
                }
                else {
                    reject(new Error(title + ' - ' + 'LibraryNode not found'));
                }
            },
        );
    });
}

async function getOrCreateLibraryNodeByTitle(sqliteDatabase: Database, title: string): Promise<LibraryNodeInterface> {
    if(title == 'null') {
        throw new Error('Title is null');
    }

    try {
        return await getLibraryNodeByTitle(sqliteDatabase, title);
    }
    catch(error) {
        // console.log(`Creating node: ${title}`);
        await createLibraryNode(sqliteDatabase, title);
        return getLibraryNodeByTitle(sqliteDatabase, title);
    }
}

async function getLibraryNodeRelationshipTypeByName(
    sqliteDatabase: Database,
    type: string,
): Promise<LibraryNodeRelationshipTypeInterface> {
    return new Promise<LibraryNodeRelationshipTypeInterface>((resolve, reject) => {
        sqliteDatabase.get(`SELECT * FROM LibraryNodeRelationshipType WHERE type = ?`, [type], function (error, row) {
            if(error) {
                console.error('Failed to retrieve LibraryNodeRelationshipType by type:', error);
                reject(error);
            }
            else if(row) {
                resolve(row as LibraryNodeRelationshipTypeInterface);
            }
            else {
                reject(new Error(type + ' - LibraryNodeRelationshipType not found'));
            }
        });
    });
}

async function showTables(): Promise<{ name: string }[]> {
    const sqliteDatabase = getDatabaseConnection();
    try {
        return await new Promise<{ name: string }[]>((resolve, reject) => {
            sqliteDatabase.all(
                `SELECT name FROM sqlite_master WHERE type='table'`,
                function (error, rows: { name: string }[]) {
                    if(error) {
                        console.error('Failed to retrieve tables:', error);
                        reject(error);
                    }
                    else {
                        resolve(rows);
                    }
                },
            );
        });
    } finally {
        closeDatabase(sqliteDatabase);
    }
}

async function getRandomLibraryNode(): Promise<ConciseLibraryNodeWithRelationships> {
    const sqliteDatabase = getDatabaseConnection();
    try {
        return await new Promise(function (resolve, reject) {
            sqliteDatabase.get(
                // `SELECT * FROM LibraryNode WHERE id = '16a5a18e-c15f-4451-9a95-0ab066611149' ORDER BY RANDOM() LIMIT 1`,
                `SELECT * FROM LibraryNode ORDER BY RANDOM() LIMIT 1`,
                async function (error, row: LibraryNodeInterface) {
                    if(error) {
                        console.error('Failed to retrieve random LibraryNode:', error);
                        reject(error);
                    }
                    else if(row) {
                        // Get inbound relationships
                        const inboundRelationships = await getLibraryNodeRelationships(
                            sqliteDatabase,
                            row.id,
                            'inbound',
                        );

                        // Get outbound relationships
                        const outboundRelationships = await getLibraryNodeRelationships(
                            sqliteDatabase,
                            row.id,
                            'outbound',
                        );

                        resolve({
                            title: row.title,
                            inboundRelationships: inboundRelationships.map(function (relationship) {
                                return {
                                    sourceNodeTitle: relationship.libraryNodeTitle,
                                    relationship: relationship.relationshipType,
                                    confidence: relationship.confidence,
                                };
                            }),
                            outboundRelationships: outboundRelationships.map(function (relationship) {
                                return {
                                    relationship: relationship.relationshipType,
                                    targetNodeTitle: relationship.libraryNodeTitle,
                                    confidence: relationship.confidence,
                                };
                            }),
                        });
                    }
                    else {
                        reject(new Error('No LibraryNode found'));
                    }
                },
            );
        });
    } finally {
        closeDatabase(sqliteDatabase);
    }
}

async function getLibraryNodeBySlug(slug: string): Promise<getLibraryNodeBySlugResponseInterface> {
    // Get the database connection
    const sqliteDatabase = getDatabaseConnection();

    try {
        return await new Promise<getLibraryNodeBySlugResponseInterface>(function (resolve, reject) {
            sqliteDatabase.get(
                `SELECT * FROM LibraryNode WHERE slug = ?`,
                [slug],
                async function (error, row: LibraryNodeInterface) {
                    if(error) {
                        console.error('Failed to retrieve LibraryNode:', error);
                        reject({
                            error: error.message,
                        });
                    }
                    else if(row) {
                        // Get inbound relationships
                        const inboundRelationships = await getLibraryNodeRelationships(
                            sqliteDatabase,
                            row.id,
                            'inbound',
                        );

                        // Get outbound relationships
                        const outboundRelationships = await getLibraryNodeRelationships(
                            sqliteDatabase,
                            row.id,
                            'outbound',
                        );

                        // Get history
                        const history = await getLibraryNodeHistory(row.id);

                        resolve({
                            data: {
                                ...row,
                                inboundRelationships: inboundRelationships,
                                outboundRelationships: outboundRelationships,
                                history: history,
                            },
                        });
                    }
                    else {
                        reject({
                            error: 'No LibraryNode found',
                        });
                    }
                },
            );
        });
    } finally {
        closeDatabase(sqliteDatabase);
    }
}

async function getLibraryNodes(
    page: number = 1,
    itemsPerPage: number = 20,
    searchTerm?: string | null,
): Promise<getLibraryNodesResponseInterface> {
    // Get the database connection
    const sqliteDatabase = getDatabaseConnection();

    try {
        return await new Promise<getLibraryNodesResponseInterface>(function (resolve, reject) {
            const offset = (page - 1) * itemsPerPage;
            let query = `SELECT * FROM LibraryNode`;
            let countQuery = `SELECT COUNT(*) as total FROM LibraryNode`;
            const params: any[] = [];

            if(searchTerm) {
                query += ` WHERE title LIKE ?`;
                countQuery += ` WHERE title LIKE ?`;
                params.push(`%${searchTerm}%`);
            }

            query += ` ORDER BY title ASC LIMIT ? OFFSET ?`;
            params.push(itemsPerPage, offset);

            sqliteDatabase.all(query, params, function (error, rows: any[]) {
                if(error) {
                    console.error('Failed to retrieve LibraryNode:', error);
                    reject({
                        data: null,
                        error: error.message,
                    });
                }
                else if(rows) {
                    const countParams = searchTerm ? [`%${searchTerm}%`] : [];
                    sqliteDatabase.get(countQuery, countParams, function (countError, countRow: any) {
                        if(countError) {
                            console.error('Failed to count LibraryNode:', countError);
                            reject({
                                data: null,
                                error: countError.message,
                            });
                        }
                        else {
                            const totalItems = countRow.total;
                            const pagesTotal = Math.ceil(totalItems / itemsPerPage);
                            resolve({
                                data: {
                                    libraryNodes: rows,
                                    pagination: {
                                        itemsPerPage: itemsPerPage,
                                        itemsTotal: totalItems,
                                        page: page,
                                        pagesTotal: pagesTotal,
                                    },
                                },
                            });
                        }
                    });
                }
                else {
                    reject({
                        error: 'No LibraryNode found',
                    });
                }
            });
        });
    } finally {
        closeDatabase(sqliteDatabase);
    }
}

async function getLibraryNode(): Promise<LibraryNodeInterface> {
    const sqliteDatabase = getDatabaseConnection();
    try {
        return await new Promise<LibraryNodeInterface>((resolve, reject) => {
            sqliteDatabase.get(
                `SELECT * FROM LibraryNode WHERE id = '42409104-1cbc-4fe6-9439-d7aa61dc5911'`,
                async function (error, row: LibraryNodeInterface) {
                    if(error) {
                        console.error('Failed to retrieve LibraryNode:', error);
                        reject(error);
                    }
                    else if(row) {
                        resolve(row as LibraryNodeInterface);
                    }
                    else {
                        reject(new Error('No LibraryNode found'));
                    }
                },
            );
        });
    } finally {
        closeDatabase(sqliteDatabase);
    }
}

async function getLibraryNodeRelationships(
    sqliteDatabase: Database,
    libraryNodeId: string,
    nodeRelationshipDirection: 'inbound' | 'outbound',
): Promise<LibraryNodeRelationshipInterface[]> {
    return new Promise<LibraryNodeRelationshipInterface[]>((resolve, reject) => {
        let query = `
            SELECT 
                LibraryNodeRelationship.*, 
                LibraryNodeRelationshipType.type as relationshipType,
                LibraryNode.title as libraryNodeTitle, LibraryNode.slug as libraryNodeSlug
            FROM LibraryNodeRelationship
            JOIN LibraryNodeRelationshipType
            ON LibraryNodeRelationship.relationshipTypeId = LibraryNodeRelationshipType.id
            JOIN LibraryNode
        `;

        if(nodeRelationshipDirection === 'inbound') {
            query += `ON LibraryNodeRelationship.sourceNodeId = LibraryNode.id WHERE targetNodeId = ?`;
        }
        else if(nodeRelationshipDirection === 'outbound') {
            query += `ON LibraryNodeRelationship.targetNodeId = LibraryNode.id WHERE sourceNodeId = ?`;
        }

        const params = [libraryNodeId];

        sqliteDatabase.all(query, params, function (error, rows: LibraryNodeRelationshipInterface[]) {
            if(error) {
                console.error('Failed to retrieve LibraryNodeRelationship:', error);
                reject(error);
            }
            else if(rows) {
                resolve(rows);
            }
            else {
                reject(new Error('No LibraryNodeRelationship found'));
            }
        });
    });
}

async function getLibraryNodeHistory(libraryNodeId: string): Promise<LibraryNodeHistoryInterface[]> {
    const sqliteDatabase = getDatabaseConnection();
    try {
        return await new Promise<LibraryNodeHistoryInterface[]>((resolve, reject) => {
            sqliteDatabase.all(
                `SELECT * FROM LibraryNodeHistory WHERE LibraryNodeHistory.libraryNodeId = ? ORDER BY createdAt DESC`,
                [libraryNodeId],
                function (error, rows: LibraryNodeHistoryInterface[]) {
                    if(error) {
                        console.error('Failed to retrieve LibraryNodeHistory:', error);
                        reject(error);
                    }
                    else {
                        resolve(rows);
                    }
                },
            );
        });
    } finally {
        closeDatabase(sqliteDatabase);
    }
}

async function getTableRecordCounts(): Promise<{ tableName: string; tableRecordCount: number }[]> {
    const sqliteDatabase = getDatabaseConnection();
    try {
        return await new Promise<{ tableName: string; tableRecordCount: number }[]>((resolve, reject) => {
            sqliteDatabase.all(`SELECT * FROM sqlite_master WHERE type='table'`, async function (error, rows) {
                if(error) {
                    console.error('Failed to retrieve tables:', error);
                    reject(error);
                }
                else {
                    const tableRecordCounts = await Promise.all(
                        rows.map(async function (row: { name: string }) {
                            const tableName = row.name;
                            const tableRecordCount = await new Promise<number>((resolve, reject) => {
                                sqliteDatabase.get(`SELECT COUNT(*) as count FROM ${tableName}`, function (error, row) {
                                    if(error) {
                                        console.error(`Failed to retrieve record count for ${tableName}:`, error);
                                        reject(error);
                                    }
                                    else {
                                        resolve(row.count);
                                    }
                                });
                            });
                            return { tableName, tableRecordCount };
                        }),
                    );

                    resolve(tableRecordCounts);
                }
            });
        });
    } finally {
        closeDatabase(sqliteDatabase);
    }
}

// Function to improve the library
async function improveLibrary() {
    const sqliteDatabase = getDatabaseConnection();

    // Get a random node and its relationships
    const node = await getRandomLibraryNode();

    console.log('\n\n\n');
    console.log('Current node: ', node.title);

    const prompt = `May we ask for your help in maintaining and expanding our health concepts graph?

## Current Node

${JSON.stringify(node, null, 4)}

## Available Tools

#### nodeRelationshipCreate(sourceNodeTitle: string, relationshipType: string, targetNodeTitle: string, confidence: number)

Creates a relationship between two nodes. \`relationshipType\` is a string, all lowercase, with words separated by spaces.
For example, "is a form of", "supports", "regulates", etc.  \`confidence\` is an integer between 1 and 100 inclusive.
Choose a confidence level that reflects your certainty in the relationship.

## Node Titles

-   Node titles should always be in title case. For example, "ATP Production" instead of "ATP production".
-   For titles that use abbreviations, use the full term followed by the abbreviation in parentheses. For example, "High-intensity Interval Training (HIIT)".
-   For hyphenated compound words, lowercase the words after the first. For example, "Age-related" instead of "Age-Related".

## Your Task

-   Use the tools to improve the graph based on the current node and relationships provided.
-   You can invoke multiple tools in a single response. Attempt to invoke the \`nodeRelationshipCreate\` tool up to 25 times, but only if you are confident in the relationships you are creating.

## Constraints

-   Limit your response to the tools' commands without additional explanations.
-   Output tool invocations separated by new lines.
-   Focus on any concepts related to physical and mental health and the relationships between them.
`;

    /*
#### nodeCreate(title: string)

Creates a new node with the specified title.

#### nodeUpdateTitle(currentTitle: string, newTitle: string)

Updates the title of an existing node.

#### nodeAddSynonyms(nodeTitle: string, newSynonyms: string[])

Adds new synonyms to an existing node. Does not delete existing synonyms.

*/

    // console.log('prompt', prompt);

    try {
        const apiKey = process.env.OPENAI_API_KEY;

        const response = await fetch(
            // 'https://api.openai.com/v1/chat/completions',
            // 'http://localhost:1234/v1/chat/completions',
            'http://10.10.100.1:1234/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 500,
                    temperature: 0.7,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                }),
            },
        );

        if(!response.ok) {
            const error = await response.json();
            console.error('OpenAI API error:', error);
            return;
        }

        const data = (await response.json()) as any;
        // console.log('data', data);

        const generatedText = data.choices[0].message.content.trim();
        // console.log('AI COMMANDS ---');
        // console.log(generatedText);
        // console.log('---------------');

        const commands = generatedText.split('\n').map(function (command: string) {
            return command.trim();
        });

        // Execute the commands
        try {
            for(const command of commands) {
                // console.log('command', command);

                // Parse the command
                const commandParts = command.split('(');
                const functionName = commandParts[0];
                const functionArguments = commandParts[1]
                    .replace(')', '')
                    .split(',')
                    .map(function (argument: string) {
                        let argumentString = argument.trim();

                        // Remove quotes
                        argumentString = argumentString.replace(/^"|"$/g, '');

                        // Remove single quotes
                        argumentString = argumentString.replace(/^'|'$/g, '');

                        if(argumentString.startsWith('sourceNodeTitle: "')) {
                            argumentString = argumentString.replace('sourceNodeTitle: "', '');
                        }
                        if(argumentString.startsWith('targetNodeTitle: "')) {
                            argumentString = argumentString.replace('targetNodeTitle: "', '');
                        }

                        return argumentString;
                    });
                // console.log('functionName', functionName);
                // console.log('functionArguments', functionArguments);

                // Execute the function
                if(functionName === 'nodeRelationshipCreate') {
                    const sourceNodeTitle = functionArguments[0];
                    const relationshipType = functionArguments[1];
                    const targetNodeTitle = functionArguments[2];
                    const confidence = parseInt(functionArguments[3]);
                    // console.log('nodeRelationshipCreate');
                    // console.log('sourceNodeTitle', sourceNodeTitle);
                    // console.log('relationshipType', relationshipType);
                    // console.log('targetNodeTitle', targetNodeTitle);
                    // console.log('confidence', confidence);

                    // Get or create the source node
                    const sourceNode = await getOrCreateLibraryNodeByTitle(sqliteDatabase, sourceNodeTitle);
                    // console.log('sourceNode', sourceNode);

                    // Get or create the target node
                    const targetNode = await getOrCreateLibraryNodeByTitle(sqliteDatabase, targetNodeTitle);
                    // console.log('targetNode', targetNode);

                    // Get or create the relationship type

                    // Create the relationship
                }
            }
        }
        catch(error) {
            console.error('Error generating graph:', error);
            console.log('generatedText', generatedText);
        }

        return {
            commands: commands,
            tableRecordCounts: await getTableRecordCounts(),
        };
    }
    catch(error) {
        console.error('Error generating graph:', error);
    }
}
