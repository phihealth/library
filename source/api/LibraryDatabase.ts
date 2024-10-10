// Dependencies - API
import { default as BetterSqlite3Database, Database } from 'better-sqlite3';
import { v4 as uuid } from 'uuid';
import {
    LibraryNodeInterface,
    LibraryNodeProposalInterface,
    LibraryNodeProposalReviewInterface,
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

    getMySqlDateTimeInUtc() {
        const date = new Date();
        const year = date.getUTCFullYear();
        const month = ('0' + (date.getUTCMonth() + 1)).slice(-2); // Add leading 0
        const day = ('0' + date.getUTCDate()).slice(-2); // Add leading 0
        const hours = ('0' + date.getUTCHours()).slice(-2); // Add leading 0
        const minutes = ('0' + date.getUTCMinutes()).slice(-2); // Add leading 0
        const seconds = ('0' + date.getUTCSeconds()).slice(-2); // Add leading 0

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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

    createLibraryNode(title: string, librarianId: string) {
        const libraryNodeId = uuid();

        // Insert the LibraryNode
        const insertLibraryNodeRunResult = this.database
            .prepare('INSERT INTO LibraryNode (id, title, slug, createdAt) VALUES (@id, @title, @slug, @createdAt)')
            .run({
                id: libraryNodeId,
                title: title,
                slug: slug(title),
                createdAt: this.getMySqlDateTimeInUtc(),
            });
        // console.log('Inserted node:', title);

        // Insert the LibraryNodeHistory
        this.database
            .prepare(
                'INSERT INTO LibraryNodeHistory (id, libraryNodeId, librarianId, action, metadata, createdAt) VALUES (@id, @libraryNodeId, @librarianId, @action, @metadata, @createdAt)',
            )
            .run({
                id: uuid(),
                libraryNodeId: libraryNodeId,
                librarianId: librarianId,
                action: 'Create',
                metadata: JSON.stringify({ title }),
                createdAt: this.getMySqlDateTimeInUtc(),
            });
    }

    updateLibraryNodeTitle(currentTitle: string, newTitle: string, librarianId: string) {
        // console.log('Getting library node by title:', currentTitle);

        // Get the LibraryNode
        const libraryNode = this.getLibraryNodeByTitle(currentTitle);
        // console.log('libraryNode', libraryNode);

        if(!libraryNode) {
            console.error('LibraryNode not found for title:', currentTitle);
            return;
        }

        // Check to see if another library node has the same slug as the new title
        const possiblyExistingLibraryNodeWithNewSlug = this.getLibraryNodeBySlug(slug(newTitle));
        // console.log('possiblyExistingLibraryNodeWithNewSlug', possiblyExistingLibraryNodeWithNewSlug);

        // If the new title is already in use under a different node, delete the current library node
        if(possiblyExistingLibraryNodeWithNewSlug && possiblyExistingLibraryNodeWithNewSlug.id !== libraryNode.id) {
            console.log('New title is already in use:', newTitle);

            // Delete any LibraryNodeRelationships with the current LibraryNode as either the source or target
            this.database
                .prepare(
                    'DELETE FROM LibraryNodeRelationship WHERE sourceNodeId = @sourceNodeId OR targetNodeId = @targetNodeId',
                )
                .run({
                    sourceNodeId: libraryNode.id,
                    targetNodeId: libraryNode.id,
                });

            // Insert the LibraryNodeRelationshipHistory
            this.database
                .prepare(
                    'INSERT INTO LibraryNodeRelationshipHistory (id, libraryNodeRelationshipId, librarianId, action, metadata, createdAt) VALUES (@id, @libraryNodeRelationshipId, @librarianId, @action, @metadata, @createdAt)',
                )
                .run({
                    id: uuid(),
                    libraryNodeRelationshipId: libraryNode.id,
                    librarianId: librarianId,
                    action: 'Delete',
                    metadata: JSON.stringify({ title: currentTitle }),
                    createdAt: this.getMySqlDateTimeInUtc(),
                });

            // Delete the LibraryNode
            this.database.prepare('DELETE FROM LibraryNode WHERE id = @id').run({
                id: libraryNode.id,
            });
            console.log('Deleted node:', currentTitle);

            // Insert the LibraryNodeHistory
            this.database
                .prepare(
                    'INSERT INTO LibraryNodeHistory (id, libraryNodeId, librarianId, action, metadata, createdAt) VALUES (@id, @libraryNodeId, @librarianId, @action, @metadata, @createdAt)',
                )
                .run({
                    id: uuid(),
                    libraryNodeId: libraryNode.id,
                    librarianId: librarianId,
                    action: 'Delete',
                    metadata: JSON.stringify({ title: currentTitle }),
                    createdAt: this.getMySqlDateTimeInUtc(),
                });
        }
        // If the new title is not in use, update the current library node
        else {
            // Update the LibraryNode
            this.database
                .prepare('UPDATE LibraryNode SET title = @title, slug = @slug, updatedAt = @updatedAt WHERE id = @id')
                .run({
                    id: libraryNode.id,
                    title: newTitle,
                    slug: slug(newTitle),
                    updatedAt: this.getMySqlDateTimeInUtc(),
                });
            console.log('- Updated Node Title -');
            console.log('    ', currentTitle, '->');
            console.log('    ', newTitle);

            // Insert the LibraryNodeHistory
            this.database
                .prepare(
                    'INSERT INTO LibraryNodeHistory (id, libraryNodeId, librarianId, action, metadata, createdAt) VALUES (@id, @libraryNodeId, @librarianId, @action, @metadata, @createdAt)',
                )
                .run({
                    id: uuid(),
                    libraryNodeId: libraryNode.id,
                    librarianId: librarianId,
                    action: 'Update',
                    metadata: JSON.stringify({ previousTitle: currentTitle, newTitle: newTitle }),
                    createdAt: this.getMySqlDateTimeInUtc(),
                });
        }
    }

    deleteLibraryNodeByTitle(title: string, librarianId: string) {
        // Get the LibraryNode
        const libraryNode = this.getLibraryNodeByTitle(title);

        // Delete the LibraryNode
        this.database.prepare('DELETE FROM LibraryNode WHERE id = @id').run({
            id: libraryNode.id,
        });
        // console.log('Deleted node:', title);

        // Insert the LibraryNodeHistory
        this.database
            .prepare(
                'INSERT INTO LibraryNodeHistory (id, libraryNodeId, librarianId, action, metadata, createdAt) VALUES (@id, @libraryNodeId, @librarianId, @action, @metadata, @createdAt)',
            )
            .run({
                id: uuid(),
                libraryNodeId: libraryNode.id,
                librarianId: librarianId,
                action: 'Delete',
                metadata: JSON.stringify({ title }),
                createdAt: this.getMySqlDateTimeInUtc(),
            });
    }

    getLibraryNodeProposal(libraryNodeProposalId: LibraryNodeProposalInterface['id']) {
        return this.database
            .prepare('SELECT * FROM LibraryNodeProposal WHERE id = @id')
            .get({ id: libraryNodeProposalId }) as LibraryNodeProposalInterface;
    }

    createLibraryNodeProposal(
        libraryNodeId: LibraryNodeProposalInterface['libraryNodeId'],
        librarianId: LibraryNodeProposalInterface['librarianId'],
        action: LibraryNodeProposalInterface['action'],
        metadata: LibraryNodeProposalInterface['metadata'],
    ) {
        const libraryNodeProposalId = uuid();

        // Insert the LibraryNodeProposal
        const insertLibraryNodeProposalRunResult = this.database
            .prepare(
                'INSERT INTO LibraryNodeProposal (id, libraryNodeId, librarianId, action, metadata, createdAt) VALUES (@id, @libraryNodeId, @librarianId, @action, @metadata, @createdAt)',
            )
            .run({
                id: libraryNodeProposalId,
                libraryNodeId: libraryNodeId,
                librarianId: librarianId,
                action: action,
                metadata: JSON.stringify(metadata),
                createdAt: this.getMySqlDateTimeInUtc(),
            });
        // console.log('Inserted proposal:', insertLibraryNodeProposalRunResult, action, metadata);

        return this.getLibraryNodeProposal(libraryNodeProposalId);
    }

    updateLibraryNodeProposalStatus(
        libraryNodeProposalId: LibraryNodeProposalInterface['id'],
        status: LibraryNodeProposalInterface['status'],
    ) {
        // Update the LibraryNodeProposal
        this.database
            .prepare('UPDATE LibraryNodeProposal SET status = @status, updatedAt = @updatedAt WHERE id = @id')
            .run({
                id: libraryNodeProposalId,
                status: status,
                updatedAt: this.getMySqlDateTimeInUtc(),
            });
        // console.log('Updated proposal status:', libraryNodeProposalId, status);
    }

    createLibraryNodeProposalReview(
        libraryNodeProposalId: LibraryNodeProposalReviewInterface['libraryNodeProposalId'],
        librarianId: LibraryNodeProposalReviewInterface['librarianId'],
        decision: LibraryNodeProposalReviewInterface['decision'],
        reason: LibraryNodeProposalReviewInterface['reason'],
        metadata: Record<string, any>,
    ) {
        // Insert the LibraryNodeProposalReview
        const insertLibraryNodeProposalReviewRunResult = this.database
            .prepare(
                'INSERT INTO LibraryNodeProposalReview (id, libraryNodeProposalId, librarianId, decision, reason, metadata, createdAt) VALUES (@id, @libraryNodeProposalId, @librarianId, @decision, @reason, @metadata, @createdAt)',
            )
            .run({
                id: uuid(),
                libraryNodeProposalId: libraryNodeProposalId,
                librarianId: librarianId,
                decision: decision,
                reason: reason,
                metadata: JSON.stringify(metadata),
                createdAt: this.getMySqlDateTimeInUtc(),
            });
        // console.log('Inserted proposal review:', insertLibraryNodeProposalReviewRunResult, decision, reason);
    }

    createLibraryNodeRelationship(sourceTitle: string, targetTitle: string, relationshipType: string) {
        const sourceLibraryNode = this.getLibraryNodeByTitle(sourceTitle);
        const targetLibraryNode = this.getLibraryNodeByTitle(targetTitle);
        const libraryNodeRelationshipType = this.getLibraryNodeRelationshipTypeByType(relationshipType);

        // Insert the LibraryNodeRelationship
        const libraryNodeRelationshipId = uuid();
        const insertLibraryNodeRelationshipRunResult = this.database
            .prepare(
                'INSERT INTO LibraryNodeRelationship (id, sourceNodeId, targetNodeId, relationshipTypeId, createdAt) VALUES (@id, @sourceNodeId, @targetNodeId, @relationshipTypeId, @createdAt)',
            )
            .run({
                id: libraryNodeRelationshipId,
                sourceNodeId: sourceLibraryNode.id,
                targetNodeId: targetLibraryNode.id,
                relationshipTypeId: libraryNodeRelationshipType.id,
                createdAt: this.getMySqlDateTimeInUtc(),
            });

        // Insert the LibraryNodeRelationshipHistory
        this.database
            .prepare(
                'INSERT INTO LibraryNodeRelationshipHistory (id, libraryNodeRelationshipId, librarianId, action, metadata, createdAt) VALUES (@id, @libraryNodeRelationshipId, @librarianId, @action, @metadata, @createdAt)',
            )
            .run({
                id: uuid(),
                libraryNodeRelationshipId: libraryNodeRelationshipId,
                librarianId: 'system',
                action: 'Create',
                metadata: JSON.stringify({ relationshipType }),
                createdAt: this.getMySqlDateTimeInUtc(),
            });
    }

    createLibraryNodeRelationshipType(type: string) {
        // Insert the LibraryNodeRelationshipType
        const libraryNodeRelationshipTypeId = uuid();
        const insertLibraryNodeRelationshipTypeRunResult = this.database
            .prepare('INSERT INTO LibraryNodeRelationshipType (id, type, createdAt) VALUES (@id, @type, @createdAt)')
            .run({
                id: libraryNodeRelationshipTypeId,
                type: type,
                createdAt: this.getMySqlDateTimeInUtc(),
            });
        // console.log('Inserted relationship type:', type);

        // Insert the LibraryNodeRelationshipTypeHistory
        this.database
            .prepare(
                'INSERT INTO LibraryNodeRelationshipTypeHistory (id, libraryNodeRelationshipTypeId, librarianId, action, metadata, createdAt) VALUES (@id, @libraryNodeRelationshipTypeId, @librarianId, @action, @metadata, @createdAt)',
            )
            .run({
                id: uuid(),
                libraryNodeRelationshipTypeId: libraryNodeRelationshipTypeId,
                librarianId: 'system',
                action: 'Create',
                metadata: JSON.stringify({ type }),
                createdAt: this.getMySqlDateTimeInUtc(),
            });
    }

    getLibraryNodeComprehensive(libraryNode: LibraryNodeInterface) {
        // Get the relationships
        const inboundRelationships = this.getLibraryNodeRelationships(libraryNode.id, 'inbound');
        const outboundRelationships = this.getLibraryNodeRelationships(libraryNode.id, 'outbound');

        // Get the history
        const history = this.getLibraryNodeHistory(libraryNode.id);

        // Get the proposals and reviews
        const proposals = this.getLibraryNodeProposals(libraryNode.id);

        return {
            ...libraryNode,
            inboundRelationships,
            outboundRelationships,
            history: history,
            proposals: proposals,
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
            .prepare('SELECT * FROM LibraryNode ORDER BY lastReviewedAt ASC LIMIT 1')
            .get() as LibraryNodeInterface;
        // console.log('libraryNode', libraryNode);

        // Update lastReviewedAt
        this.database.prepare('UPDATE LibraryNode SET lastReviewedAt = @lastReviewedAt WHERE id = @id').run({
            id: libraryNode.id,
            lastReviewedAt: this.getMySqlDateTimeInUtc(),
        });

        if(comprehensive) {
            return this.getLibraryNodeComprehensive(libraryNode);
        }

        return libraryNode;
    }

    getRandomLibraryNodes(count: number = 10, comprehensive: boolean = false) {
        // Get the LibraryNodes
        const libraryNodes = this.database
            .prepare('SELECT * FROM LibraryNode ORDER BY RANDOM() LIMIT @count')
            .all({ count }) as LibraryNodeInterface[];

        if(comprehensive) {
            return libraryNodes.map(
                function (this: LibraryDatabase, libraryNode: LibraryNodeInterface) {
                    return this.getLibraryNodeComprehensive(libraryNode);
                }.bind(this),
            );
        }

        return libraryNodes;
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
            this.createLibraryNode(title, 'System');

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

    getLibraryNodeProposals(libraryNodeId: string) {
        // Get the LibraryNodeProposals
        const libraryNodeProposals = this.database
            .prepare('SELECT * FROM LibraryNodeProposal WHERE libraryNodeId = @libraryNodeId ORDER BY createdAt DESC')
            .all({ libraryNodeId }) as LibraryNodeProposalInterface[];
        // console.log('libraryNodeProposals', libraryNodeProposals);

        // Get the LibraryNodeProposalReviews
        const libraryNodeProposalReviews = this.database
            .prepare(
                'SELECT * FROM LibraryNodeProposalReview WHERE libraryNodeProposalId IN (' +
                    libraryNodeProposals.map((libraryNodeProposal) => `'${libraryNodeProposal.id}'`).join(', ') +
                    ') ORDER BY createdAt DESC',
            )
            .all() as LibraryNodeProposalReviewInterface[];
        // console.log('libraryNodeProposalReviews', libraryNodeProposalReviews);

        // Map reviews to their corresponding proposals
        const proposalsWithReviews = libraryNodeProposals.map((proposal) => {
            const reviews = libraryNodeProposalReviews.filter((review) => review.libraryNodeProposalId === proposal.id);
            return {
                ...proposal,
                reviews,
            };
        });

        return proposalsWithReviews;
    }
}

// Export - Default
export default LibraryDatabase;
