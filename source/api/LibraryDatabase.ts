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

// Class - LibraryDatabase
export class LibraryDatabase {
    // Function to open a SQLite database connection
    getDatabaseConnection(): Database {
        return new Database('ProjectDatabase.sqlite', function (error) {
            if(error) {
                console.error('Failed to open database:', error);
                throw error;
            }
        });
    }

    // Function to close the database connection
    closeDatabase(sqliteDatabase: Database) {
        sqliteDatabase.close(function (error) {
            if(error) {
                console.error('Failed to close the database:', error);
            }
            else {
                // console.log('Database connection closed');
            }
        });
    }

    createLibraryNode(sqliteDatabase: Database, title: string, librarianId?: string) {
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

    createLibraryNodeRelationship(
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

    createLibraryNodeRelationshipType(sqliteDatabase: Database, type: string) {
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

    getLibraryNodeByTitle(sqliteDatabase: Database, title: string): Promise<LibraryNodeInterface> {
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

    getOrCreateLibraryNodeByTitle(sqliteDatabase: Database, title: string): Promise<LibraryNodeInterface> {
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

    getLibraryNodeRelationshipTypeByName(
        sqliteDatabase: Database,
        type: string,
    ): Promise<LibraryNodeRelationshipTypeInterface> {
        return new Promise<LibraryNodeRelationshipTypeInterface>((resolve, reject) => {
            sqliteDatabase.get(
                `SELECT * FROM LibraryNodeRelationshipType WHERE type = ?`,
                [type],
                function (error, row) {
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
                },
            );
        });
    }

    showTables(): Promise<{ name: string }[]> {
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

    getRandomLibraryNode(): Promise<ConciseLibraryNodeWithRelationships> {
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

    getLibraryNodeBySlug(slug: string): Promise<getLibraryNodeBySlugResponseInterface> {
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

    getLibraryNodes(
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

    getLibraryNode(): Promise<LibraryNodeInterface> {
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

    getLibraryNodeRelationships(
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

    getLibraryNodeHistory(libraryNodeId: string): Promise<LibraryNodeHistoryInterface[]> {
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

    getTableRecordCounts(): Promise<{ tableName: string; tableRecordCount: number }[]> {
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
                                    sqliteDatabase.get(
                                        `SELECT COUNT(*) as count FROM ${tableName}`,
                                        function (error, row) {
                                            if(error) {
                                                console.error(
                                                    `Failed to retrieve record count for ${tableName}:`,
                                                    error,
                                                );
                                                reject(error);
                                            }
                                            else {
                                                resolve(row.count);
                                            }
                                        },
                                    );
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
}

// Instance
export const libraryDatabase = new LibraryDatabase();

// Export - Default
export default LibraryDatabase;
