// Dependencies - API
import { default as BetterSqlite3Database, Database } from 'better-sqlite3';
import { v4 as uuid } from 'uuid';
import {
    LibraryNodeInterface,
    LibraryNodeHistoryInterface,
    LibraryNodeRelationshipInterface,
    LibraryNodeRelationshipTypeInterface,
    LibraryNodeComprehensiveInterface,
} from '@project/source/api/LibraryApiInterfaces';

// Dependencies - Utilities
import { slug } from '@structure/source/utilities/String';

// Class - LibraryDatabase
export class LibraryDatabase {
    database: Database;

    constructor() {
        // Connect to the database
        this.database = new BetterSqlite3Database('ProjectDatabase.sqlite');
    }

    getTables() {
        const database = this.database;

        // Get the tables
        const tables = database.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all() as {
            name: string;
        }[];

        // Get the record counts
        const tableRecordCounts = tables.map(function (table) {
            const tableRecordCount = database.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as {
                count: number;
            };

            return {
                tableName: table.name,
                tableRecordCount: tableRecordCount.count,
            };
        });

        return tableRecordCounts;
    }

    createLibraryNode(title: string, librarianId?: string) {
        // Insert the LibraryNode
        const insertLibraryNodeRunResult = this.database
            .prepare('INSERT INTO LibraryNode (id, title, slug) VALUES (@id, @title, @slug)')
            .run({
                id: uuid(),
                title: title,
                slug: slug(title),
            });
        console.log('Inserted node:', title);

        // Insert the LibraryNodeHistory
        this.database
            .prepare(
                'INSERT INTO LibraryNodeHistory (id, libraryNodeId, librarianId, action, metadata) VALUES (@id, @libraryNodeId, @librarianId, @action, @metadata)',
            )
            .run({
                id: uuid(),
                libraryNodeId: insertLibraryNodeRunResult.lastInsertRowid,
                librarianId: librarianId,
                action: 'create',
                metadata: JSON.stringify({ title }),
            });
    }

    createLibraryNodeRelationship(sourceTitle: string, targetTitle: string, relationshipType: string) {
        const sourceLibraryNode = this.getLibraryNodeByTitle(sourceTitle);
        const targetLibraryNode = this.getLibraryNodeByTitle(targetTitle);
        const libraryNodeRelationshipType = this.getLibraryNodeRelationshipTypeByType(relationshipType);

        // Insert the LibraryNodeRelationship
        const insertLibraryNodeRelationshipRunResult = this.database
            .prepare(
                'INSERT INTO LibraryNodeRelationship (id, sourceNodeId, targetNodeId, relationshipTypeId) VALUES (@id, @sourceNodeId, @targetNodeId, @relationshipTypeId)',
            )
            .run({
                id: uuid(),
                sourceNodeId: sourceLibraryNode.id,
                targetNodeId: targetLibraryNode.id,
                relationshipTypeId: libraryNodeRelationshipType.id,
            });

        // Insert the LibraryNodeRelationshipHistory
        this.database
            .prepare(
                'INSERT INTO LibraryNodeRelationshipHistory (id, libraryNodeRelationshipId, librarianId, action, metadata) VALUES (@id, @libraryNodeRelationshipId, @librarianId, @action, @metadata)',
            )
            .run({
                id: uuid(),
                libraryNodeRelationshipId: insertLibraryNodeRelationshipRunResult.lastInsertRowid,
                librarianId: 'system',
                action: 'create',
                metadata: JSON.stringify({ relationshipType }),
            });
    }

    createLibraryNodeRelationshipType(type: string) {
        // Insert the LibraryNodeRelationshipType
        const insertLibraryNodeRelationshipTypeRunResult = this.database
            .prepare('INSERT INTO LibraryNodeRelationshipType (id, type) VALUES (@id, @type)')
            .run({
                id: uuid(),
                type: type,
            });
        console.log('Inserted relationship type:', type);

        // Insert the LibraryNodeRelationshipTypeHistory
        this.database
            .prepare(
                'INSERT INTO LibraryNodeRelationshipTypeHistory (id, libraryNodeRelationshipTypeId, librarianId, action, metadata) VALUES (@id, @libraryNodeRelationshipTypeId, @librarianId, @action, @metadata)',
            )
            .run({
                id: uuid(),
                libraryNodeRelationshipTypeId: insertLibraryNodeRelationshipTypeRunResult.lastInsertRowid,
                librarianId: 'system',
                action: 'create',
                metadata: JSON.stringify({ type }),
            });
    }

    getLibraryNodeComprehensive(libraryNode: LibraryNodeInterface) {
        // Get the relationships
        const inboundRelationships = this.getLibraryNodeRelationships(libraryNode.id, 'inbound');
        const outboundRelationships = this.getLibraryNodeRelationships(libraryNode.id, 'outbound');

        // Get the history
        const history = this.getLibraryNodeHistory(libraryNode.id);

        return {
            ...libraryNode,
            inboundRelationships,
            outboundRelationships,
            history,
        } as LibraryNodeComprehensiveInterface;
    }

    getLibraryNodeByTitle(title: string, comprehensive: boolean = false) {
        let libraryNode = this.database
            .prepare('SELECT * FROM LibraryNode WHERE title = @title')
            .get({ title }) as LibraryNodeInterface;

        if(comprehensive) {
            libraryNode = this.getLibraryNodeComprehensive(libraryNode);
        }

        return libraryNode;
    }

    getLibraryNodeBySlug(slug: string, comprehensive: boolean = false) {
        let libraryNode = this.database
            .prepare('SELECT * FROM LibraryNode WHERE slug = @slug')
            .get({ slug }) as LibraryNodeInterface;

        if(comprehensive) {
            libraryNode = this.getLibraryNodeComprehensive(libraryNode);
        }

        return libraryNode;
    }

    getRandomLibraryNode(comprehensive: boolean = false) {
        // Get the LibraryNode
        const libraryNode = this.database
            .prepare('SELECT * FROM LibraryNode ORDER BY RANDOM() LIMIT 1')
            .get() as LibraryNodeInterface;

        if(comprehensive) {
            return this.getLibraryNodeComprehensive(libraryNode);
        }

        return libraryNode;
    }

    getOrCreateLibraryNodeByTitle(title: string) {
        if(!title || title == 'null') {
            throw new Error('Title is null');
        }

        // Get the LibraryNode using slug, as the title is case insensitive
        let libraryNode = this.getLibraryNodeBySlug(slug(title));

        // If the LibraryNode does not exist
        if(!libraryNode) {
            // Create the LibraryNode
            // console.log('Creating node:', title);
            this.createLibraryNode(title);

            // Get the LibraryNode
            libraryNode = this.getLibraryNodeBySlug(slug(title));
        }

        return libraryNode;
    }

    getLibraryNodeRelationshipTypeByType(type: string) {
        return this.database
            .prepare('SELECT * FROM LibraryNodeRelationshipType WHERE type = @type')
            .get({ type }) as LibraryNodeRelationshipTypeInterface;
    }

    getLibraryNodes(page: number = 1, itemsPerPage: number = 20, searchTerm?: string | null) {
        // Build the queries
        let libraryNodesQuery = `SELECT * FROM LibraryNode`;
        let libraryNodesCountQuery = `SELECT COUNT(*) as total FROM LibraryNode`;

        // If there is a searchTerm, add the WHERE clause
        if(searchTerm) {
            libraryNodesQuery += ` WHERE title LIKE @searchTerm`;
            libraryNodesCountQuery += ` WHERE title LIKE @searchTerm`;
        }

        // Calculate the offset
        const offset = (page - 1) * itemsPerPage;

        // Add the ORDER BY, LIMIT, and OFFSET clauses
        libraryNodesQuery += ` ORDER BY title ASC LIMIT @itemsPerPage OFFSET @offset`;

        // Get the LibraryNodes
        const libraryNodes = this.database.prepare(libraryNodesQuery).all({
            itemsPerPage,
            offset,
            searchTerm: searchTerm ? `%${searchTerm}%` : null,
        }) as LibraryNodeInterface[];

        // Get the LibraryNodes count
        const libraryNodesCount = this.database.prepare(libraryNodesCountQuery).get({
            searchTerm: searchTerm ? `%${searchTerm}%` : null,
        }) as { total: number };

        // Calculate the total number of pages
        const pagesTotal = Math.ceil(libraryNodesCount.total / itemsPerPage);

        return {
            libraryNodes,
            pagination: {
                itemsPerPage,
                itemsTotal: libraryNodesCount.total,
                page,
                pagesTotal,
            },
        };
    }

    getLibraryNodeRelationships(libraryNodeId: string, nodeRelationshipDirection: 'inbound' | 'outbound') {
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

        // Inbound, use targetNodeId
        if(nodeRelationshipDirection === 'inbound') {
            query += `ON LibraryNodeRelationship.sourceNodeId = LibraryNode.id WHERE targetNodeId = @libraryNodeId`;
        }
        // Outbound, use sourceNodeId
        else if(nodeRelationshipDirection === 'outbound') {
            query += `ON LibraryNodeRelationship.targetNodeId = LibraryNode.id WHERE sourceNodeId = @libraryNodeId`;
        }

        return this.database.prepare(query).all({
            libraryNodeId,
        }) as LibraryNodeRelationshipInterface[];
    }

    getLibraryNodeHistory(libraryNodeId: string) {
        // Get the LibraryNodeHistory
        return this.database
            .prepare('SELECT * FROM LibraryNodeHistory WHERE libraryNodeId = @libraryNodeId ORDER BY createdAt DESC')
            .all({ libraryNodeId }) as LibraryNodeHistoryInterface[];
    }
}

// Export - Default
export default LibraryDatabase;
