// Dependencies - Next.js
import type { NextRequest } from 'next/server';

import { slug } from '@structure/source/utilities/String';

// Dependencies - SQLite
import { Database } from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';

// Interfaces
export interface LibraryNodeInterface {
    id: string;
    status: string;
    title: string;
    slug: string;
    updatedAt: string;
    createdAt: string;
}

export interface LibraryNodeHistoryInterface {
    id: string;
    libraryNodeId: string;
    librarianId: string;
    action: string;
    metadata: string;
    createdAt: string;
}

export interface LibraryNodeRelationshipInterface {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    relationshipTypeId: string;
    confidence: number; // 0 to 1
    updatedAt: string;
    createdAt: string;
}

export interface LibraryNodeRelationshipHistoryInterface {
    id: string;
    libraryNodeRelationshipId: string;
    librarianId: string;
    action: string;
    metadata: string;
    createdAt: string;
}

export interface LibraryNodeRelationshipTypeInterface {
    id: string;
    parentId?: string;
    type: string;
    slug: string;
    synonyms: string[];
    updatedAt: string;
    createdAt: string;
}

export interface LibraryNodeRelationshipTypeHistoryInterface {
    id: string;
    libraryNodeRelationshipTypeId: string;
    librarianId: string;
    action: string;
    metadata: string;
    createdAt: string;
}

export interface LibrarianInterface {
    id: string;

    title: string;
    description: string;

    type: 'Human' | 'DigitalIntelligence';

    // Human
    accountId?: string;
    profileId?: string;

    // DigitalIntelligence
    digitalIntelligenceId?: string;

    updatedAt: string;
    createdAt: string;
}

export interface DigitalIntelligenceInterface {
    id: string;
    apiUrl: string; // The endpoint URL for accessing the model via API
    identifier: string; // lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF or GPT-4 or Grok2
    title: string; // Llama or GPT-4 or Grok2
    author: string; // Meta, OpenAI, xAI (for Grok2)
    inputCapabilities: string; // 'Text', 'Image', 'TextAndImage'
    outputCapabilities: string; // 'Text', 'Image', 'TextAndImage'
    version?: string; // 3.2 for Llama, 4 for GPT-4, or unknown for some proprietary models
    description?: string; // A tiny and speedy Llama model from Meta, or a description of GPT-4 or Grok2
    url?: string; // URL about the model
    architecture?: string; // llama, transformer, or undefined for GPT-4/Grok2 if architecture isn't public
    parameters?: string; // 1B for Llama, unknown for GPT-4/Grok2
    quantization?: string; // Q4_K_M or undefined if not applicable for proprietary models
    sizeOnDiskInGigabytes?: number; // 1.2, or undefined if not downloadable for GPT-4/Grok2
    format?: string; // gguf for Llama, or undefined for GPT-4/Grok2
    updatedAt: string;
    createdAt: string;
}

export interface DigitalIntelligenceTextHyperparametersInterface {
    id: string;
    identifier: string;
    description: string;
    temperature: number;
    maximumTokens: number;
    topP: number;
    topK: number;
    frequencyPenalty: number;
    presencePenalty: number;
    stopSequences: string[];
    updatedAt: string;
    createdAt: string;
}

export interface DigitalIntelligencePromptInterface {
    id: string;
    identifier: string;
    description: string;
    prompt: string;
    updatedAt: string;
    createdAt: string;
}

export interface ChangeDetailInterface {
    field: string;
    oldValue?: any;
    newValue?: any;
    reason?: string; // Explanation for the change
}

export interface LibraryPostInterface {
    id: string;
    title: string;
    description: string;
    content: string;
    libraryNodeId?: string;
    libraryNodeRelationshipId?: string;
    updatedAt: string;
    createdAt: string;
}

export interface ComphrensiveLibraryNodeInterface extends LibraryNodeInterface {
    inboundRelationships: LibraryNodeRelationshipInterface[];
    outboundRelationships: LibraryNodeRelationshipInterface[];
    history: LibraryNodeHistoryInterface[];
}

export interface ConciseLibraryNodeRelationship {
    relationship: LibraryNodeRelationshipTypeInterface['type'];
    confidence: LibraryNodeRelationshipInterface['confidence'];
}

export interface ConciseLibraryNodeInboundRelationship extends ConciseLibraryNodeRelationship {
    sourceNodeTitle: LibraryNodeInterface['title'];
}

export interface ConciseLibraryNodeOutboundRelationship extends ConciseLibraryNodeRelationship {
    targetNodeTitle: LibraryNodeInterface['title'];
}

export interface ConciseLibraryNodeWithRelationships {
    title: LibraryNodeInterface['title'];
    inboundRelationships: ConciseLibraryNodeInboundRelationship[];
    outboundRelationships: ConciseLibraryNodeOutboundRelationship[];
}

// Function to open a SQLite database connection
function getDatabaseConnection(): Database {
    return new Database('library.sqlite', function (error) {
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

    // Drop tables
    if(request.nextUrl.pathname === '/api/dropTables') {
        console.log('Deleting database');
        const results = await dropTables();
        console.log('results', results);
        return new Response(JSON.stringify({ results }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    // Create tables
    else if(request.nextUrl.pathname === '/api/createTables') {
        console.log('Creating database');
        await createTables();
    }
    // Show tables
    else if(request.nextUrl.pathname === '/api/showTables') {
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

async function dropTables() {
    return new Promise(function (resolve, reject) {
        // Get the database connection
        const sqliteDatabase = getDatabaseConnection();

        // Save the results
        const results: string[] = [];
        let operationsPending = 3; // Number of tables to drop

        function checkCompletion() {
            if(operationsPending === 0) {
                closeDatabase(sqliteDatabase);
                resolve(results);
            }
        }

        // LibraryNode
        sqliteDatabase.run(`DROP TABLE IF EXISTS LibraryNode`, function (error) {
            if(error) {
                results.push('Failed to drop LibraryNode table: ' + error.message);
            }
            else {
                results.push('Dropped LibraryNode table');
            }
            operationsPending--;
            checkCompletion();
        });

        // LibraryNodeHistory
        sqliteDatabase.run(`DROP TABLE IF EXISTS LibraryNodeHistory`, function (error) {
            if(error) {
                results.push('Failed to drop LibraryNodeHistory table: ' + error.message);
            }
            else {
                results.push('Dropped LibraryNodeHistory table');
            }
            operationsPending--;
            checkCompletion();
        });

        // LibraryNodeRelationship
        sqliteDatabase.run(`DROP TABLE IF EXISTS LibraryNodeRelationship`, function (error) {
            if(error) {
                results.push('Failed to drop LibraryNodeRelationship table: ' + error.message);
            }
            else {
                results.push('Dropped LibraryNodeRelationship table');
            }
            operationsPending--;
            checkCompletion();
        });

        // LibraryNodeRelationshipHistory
        sqliteDatabase.run(`DROP TABLE IF EXISTS LibraryNodeRelationshipHistory`, function (error) {
            if(error) {
                results.push('Failed to drop LibraryNodeRelationshipHistory table: ' + error.message);
            }
            else {
                results.push('Dropped LibraryNodeRelationshipHistory table');
            }
            operationsPending--;
            checkCompletion();
        });

        // LibraryNodeRelationshipType
        sqliteDatabase.run(`DROP TABLE IF EXISTS LibraryNodeRelationshipType`, function (error) {
            if(error) {
                results.push('Failed to drop LibraryNodeRelationshipType table: ' + error.message);
            }
            else {
                results.push('Dropped LibraryNodeRelationshipType table');
            }
            operationsPending--;
            checkCompletion();
        });

        // LibraryNodeRelationshipTypeHistory
        sqliteDatabase.run(`DROP TABLE IF EXISTS LibraryNodeRelationshipTypeHistory`, function (error) {
            if(error) {
                results.push('Failed to drop LibraryNodeRelationshipTypeHistory table: ' + error.message);
            }
            else {
                results.push('Dropped LibraryNodeRelationshipTypeHistory table');
            }
            operationsPending--;
            checkCompletion();
        });

        // Librarian
        sqliteDatabase.run(`DROP TABLE IF EXISTS Librarian`, function (error) {
            if(error) {
                results.push('Failed to drop Librarian table: ' + error.message);
            }
            else {
                results.push('Dropped Librarian table');
            }
            operationsPending--;
            checkCompletion();
        });

        // LibraryPost
        sqliteDatabase.run(`DROP TABLE IF EXISTS LibraryPost`, function (error) {
            if(error) {
                results.push('Failed to drop LibraryPost table: ' + error.message);
            }
            else {
                results.push('Dropped LibraryPost table');
            }
            operationsPending--;
            checkCompletion();
        });
    });
}

async function createTables() {
    const sqliteDatabase = getDatabaseConnection();
    try {
        // LibraryNode
        await createTable(
            sqliteDatabase,
            'LibraryNode',
            `
            id TEXT PRIMARY KEY,
            title TEXT UNIQUE NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        `,
            'LibraryNode table has been created or already exists.',
        );

        // LibraryNodeHistory
        await createTable(
            sqliteDatabase,
            'LibraryNodeHistory',
            `
            id TEXT PRIMARY KEY,
            libraryNodeId TEXT,
            librarianId TEXT,
            action TEXT NOT NULL,
            metadata TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        `,
            'LibraryNodeHistory table has been created or already exists.',
        );

        // LibraryNodeRelationship
        await createTable(
            sqliteDatabase,
            'LibraryNodeRelationship',
            `
            id TEXT PRIMARY KEY,
            sourceNodeId TEXT,
            targetNodeId TEXT,
            relationshipTypeId TEXT,
            confidence REAL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sourceNodeId) REFERENCES LibraryNode(id),
            FOREIGN KEY (targetNodeId) REFERENCES LibraryNode(id),
            FOREIGN KEY (relationshipTypeId) REFERENCES LibraryNodeRelationshipType(id)
        `,
            'LibraryNodeRelationship table has been created or already exists.',
        );

        // LibraryNodeRelationshipHistory
        await createTable(
            sqliteDatabase,
            'LibraryNodeRelationshipHistory',
            `
            id TEXT PRIMARY KEY,
            libraryNodeRelationshipId TEXT,
            librarianId TEXT,
            action TEXT,
            metadata TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        `,
            'LibraryNodeRelationshipHistory table has been created or already exists.',
        );

        // LibraryNodeRelationshipType
        await createTable(
            sqliteDatabase,
            'LibraryNodeRelationshipType',
            `
            id TEXT PRIMARY KEY,
            type TEXT UNIQUE NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        `,
            'LibraryNodeRelationshipType table has been created or already exists.',
        );

        // LibraryNodeRelationshipTypeHistory
        await createTable(
            sqliteDatabase,
            'LibraryNodeRelationshipTypeHistory',
            `
            id TEXT PRIMARY KEY,
            libraryNodeRelationshipTypeId TEXT,
            librarianId TEXT,
            action TEXT,
            metadata TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        `,
            'LibraryNodeRelationshipTypeHistory table has been created or already exists.',
        );

        // Librarian
        await createTable(
            sqliteDatabase,
            'Librarian',
            `
            id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            accountId TEXT,
            profileId TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        `,
            'Librarian table has been created or already exists.',
        );

        // LibraryPost
        await createTable(
            sqliteDatabase,
            'LibraryPost',
            `
            id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            content TEXT,
            libraryNodeId TEXT,
            libraryNodeRelationshipId TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (libraryNodeId) REFERENCES LibraryNode(id),
            FOREIGN KEY (libraryNodeRelationshipId) REFERENCES LibraryNodeRelationship(id)
        `,
            'LibraryPost table has been created or already exists.',
        );

        // Add initial data for Magnesium nodes and relationships
        await createLibraryNode(sqliteDatabase, 'Magnesium');
        await createLibraryNode(sqliteDatabase, 'Magnesium Glycinate');
        await createLibraryNode(sqliteDatabase, 'Magnesium Citrate');
        await createLibraryNode(sqliteDatabase, 'Magnesium Oxide');
        await createLibraryNode(sqliteDatabase, 'Calcium');
        await createLibraryNode(sqliteDatabase, 'Calcium Carbonate');
        await createLibraryNode(sqliteDatabase, 'Calcium Citrate');
        await createLibraryNode(sqliteDatabase, 'Vitamin D');
        await createLibraryNode(sqliteDatabase, 'Vitamin A');
        await createLibraryNode(sqliteDatabase, 'Vitamin B1', ['Thiamine']);
        await createLibraryNode(sqliteDatabase, 'Vitamin B2', ['Riboflavin']);
        await createLibraryNode(sqliteDatabase, 'Vitamin B3', ['Niacin']);
        await createLibraryNode(sqliteDatabase, 'Vitamin B5', ['Pantothenic Acid']);
        await createLibraryNode(sqliteDatabase, 'Vitamin B6', ['Pyridoxine']);
        await createLibraryNode(sqliteDatabase, 'Vitamin B7', ['Biotin']);
        await createLibraryNode(sqliteDatabase, 'Vitamin B9', ['Folate']);
        await createLibraryNode(sqliteDatabase, 'Vitamin B12', ['Cobalamin']);
        await createLibraryNode(sqliteDatabase, 'Vitamin C');
        await createLibraryNode(sqliteDatabase, 'Vitamin E');
        await createLibraryNode(sqliteDatabase, 'Vitamin K');
        await createLibraryNode(sqliteDatabase, 'Iron');
        await createLibraryNode(sqliteDatabase, 'Iron Sulfate');
        await createLibraryNode(sqliteDatabase, 'Iron Gluconate');
        await createLibraryNode(sqliteDatabase, 'Zinc');
        await createLibraryNode(sqliteDatabase, 'Zinc Gluconate');
        await createLibraryNode(sqliteDatabase, 'Zinc Sulfate');
        await createLibraryNode(sqliteDatabase, 'Omega-3 Fatty Acids');
        await createLibraryNode(sqliteDatabase, 'DHA', ['Docosahexaenoic Acid']);
        await createLibraryNode(sqliteDatabase, 'EPA', ['Eicosapentaenoic Acid']);
        await createLibraryNode(sqliteDatabase, 'Folic Acid');
        await createLibraryNode(sqliteDatabase, 'Potassium');
        await createLibraryNode(sqliteDatabase, 'Sodium');
        await createLibraryNode(sqliteDatabase, 'Chloride');
        await createLibraryNode(sqliteDatabase, 'Phosphorus');
        await createLibraryNode(sqliteDatabase, 'Iodine');
        await createLibraryNode(sqliteDatabase, 'Selenium');
        await createLibraryNode(sqliteDatabase, 'Copper');
        await createLibraryNode(sqliteDatabase, 'Chromium');
        await createLibraryNode(sqliteDatabase, 'Manganese');
        await createLibraryNode(sqliteDatabase, 'Molybdenum');
        await createLibraryNode(sqliteDatabase, 'Fluoride');
        await createLibraryNode(sqliteDatabase, 'Vitamin D2', ['Ergocalciferol']);
        await createLibraryNode(sqliteDatabase, 'Vitamin D3', ['Cholecalciferol']);
        await createLibraryNode(sqliteDatabase, 'Probiotics');
        await createLibraryNode(sqliteDatabase, 'Lactobacillus Acidophilus');
        await createLibraryNode(sqliteDatabase, 'Bifidobacterium Bifidum');
        await createLibraryNode(sqliteDatabase, 'Coenzyme Q10');
        await createLibraryNode(sqliteDatabase, 'Glucosamine');
        await createLibraryNode(sqliteDatabase, 'Chondroitin');
        await createLibraryNode(sqliteDatabase, 'MSM (Methylsulfonylmethane)');
        await createLibraryNode(sqliteDatabase, 'L-Arginine');
        await createLibraryNode(sqliteDatabase, 'L-Carnitine');
        await createLibraryNode(sqliteDatabase, 'L-Theanine');
        await createLibraryNode(sqliteDatabase, 'L-Tryptophan');
        await createLibraryNode(sqliteDatabase, 'Ginkgo Biloba');
        await createLibraryNode(sqliteDatabase, 'Ginseng');
        await createLibraryNode(sqliteDatabase, 'Echinacea');
        await createLibraryNode(sqliteDatabase, "St. John's Wort");
        await createLibraryNode(sqliteDatabase, 'Turmeric');
        await createLibraryNode(sqliteDatabase, 'Curcumin');
        await createLibraryNode(sqliteDatabase, 'Black Pepper Extract');
        await createLibraryNode(sqliteDatabase, 'Green Tea Extract');
        await createLibraryNode(sqliteDatabase, 'Resveratrol');
        await createLibraryNode(sqliteDatabase, 'Alpha-Lipoic Acid');
        await createLibraryNode(sqliteDatabase, 'Melatonin');
        await createLibraryNode(sqliteDatabase, 'Valerian Root');
        await createLibraryNode(sqliteDatabase, 'Magnesium Malate');
        await createLibraryNode(sqliteDatabase, 'Magnesium L-Threonate');
        await createLibraryNode(sqliteDatabase, 'Calcium Hydroxyapatite');
        await createLibraryNode(sqliteDatabase, 'Calcium Lactate');
        await createLibraryNode(sqliteDatabase, 'Fiber');
        await createLibraryNode(sqliteDatabase, 'Soluble Fiber');
        await createLibraryNode(sqliteDatabase, 'Insoluble Fiber');
        await createLibraryNode(sqliteDatabase, 'Prebiotics');
        await createLibraryNode(sqliteDatabase, 'Vitamin B Complex');
        await createLibraryNode(sqliteDatabase, 'Multivitamin');
        await createLibraryNode(sqliteDatabase, 'Antioxidants');
        await createLibraryNode(sqliteDatabase, 'Electrolytes');
        await createLibraryNode(sqliteDatabase, 'Collagen');
        await createLibraryNode(sqliteDatabase, 'Hyaluronic Acid');
        await createLibraryNode(sqliteDatabase, 'Biotin');
        await createLibraryNode(sqliteDatabase, 'Saw Palmetto');
        await createLibraryNode(sqliteDatabase, 'Cranberry Extract');
        await createLibraryNode(sqliteDatabase, 'Garlic Extract');
        await createLibraryNode(sqliteDatabase, 'Essential Amino Acids');
        await createLibraryNode(sqliteDatabase, 'Branched-Chain Amino Acids (BCAAs)');
        await createLibraryNode(sqliteDatabase, 'Vitamin K2');
        await createLibraryNode(sqliteDatabase, 'Probiotic Blend');
        await createLibraryNode(sqliteDatabase, 'Herbal Supplement');
        await createLibraryNode(sqliteDatabase, 'Omega-6 Fatty Acids');
        await createLibraryNode(sqliteDatabase, 'Gamma-Linolenic Acid (GLA)');
        await createLibraryNode(sqliteDatabase, 'Evening Primrose Oil');
        await createLibraryNode(sqliteDatabase, 'CLA (Conjugated Linoleic Acid)');
        await createLibraryNode(sqliteDatabase, 'Whey Protein');
        await createLibraryNode(sqliteDatabase, 'Casein Protein');
        await createLibraryNode(sqliteDatabase, 'Soy Protein');
        await createLibraryNode(sqliteDatabase, 'Pea Protein');
        await createLibraryNode(sqliteDatabase, 'Hemp Protein');
        await createLibraryNode(sqliteDatabase, 'Chia Seeds');
        await createLibraryNode(sqliteDatabase, 'Flax Seeds');
        await createLibraryNode(sqliteDatabase, 'Spirulina');
        await createLibraryNode(sqliteDatabase, 'Chlorella');
        await createLibraryNode(sqliteDatabase, 'Ashwagandha');
        await createLibraryNode(sqliteDatabase, 'Rhodiola Rosea');
        await createLibraryNode(sqliteDatabase, 'Maca Root');
        await createLibraryNode(sqliteDatabase, 'Aloe Vera');
        await createLibraryNode(sqliteDatabase, 'Apple Cider Vinegar');
        await createLibraryNode(sqliteDatabase, 'Omega-9 Fatty Acids');
        await createLibraryNode(sqliteDatabase, 'Oleic Acid');
        await createLibraryNode(sqliteDatabase, 'Medium-Chain Triglycerides (MCTs)');
        await createLibraryNode(sqliteDatabase, 'Coconut Oil');
        await createLibraryNode(sqliteDatabase, 'Fish Oil');
        await createLibraryNode(sqliteDatabase, 'Krill Oil');
        await createLibraryNode(sqliteDatabase, 'Algae Oil');
        await createLibraryNode(sqliteDatabase, 'Kelp');
        await createLibraryNode(sqliteDatabase, 'Seaweed');
        await createLibraryNode(sqliteDatabase, 'Iron Bisglycinate');
        await createLibraryNode(sqliteDatabase, 'Chelated Minerals');
        await createLibraryNode(sqliteDatabase, 'Electrolyte Drink');
        await createLibraryNode(sqliteDatabase, 'Sports Drink');
        await createLibraryNode(sqliteDatabase, 'Hydration');
        await createLibraryNode(sqliteDatabase, 'Detoxification');
        await createLibraryNode(sqliteDatabase, 'Liver Support');
        await createLibraryNode(sqliteDatabase, 'Milk Thistle');
        await createLibraryNode(sqliteDatabase, 'N-Acetylcysteine (NAC)');
        await createLibraryNode(sqliteDatabase, 'Glutathione');
        await createLibraryNode(sqliteDatabase, 'Vitamin E Tocopherols');
        await createLibraryNode(sqliteDatabase, 'Vitamin E Tocotrienols');
        await createLibraryNode(sqliteDatabase, 'Lycopene');
        await createLibraryNode(sqliteDatabase, 'Lutein');
        await createLibraryNode(sqliteDatabase, 'Zeaxanthin');
        await createLibraryNode(sqliteDatabase, 'Bilberry Extract');
        await createLibraryNode(sqliteDatabase, 'Eye Health');
        await createLibraryNode(sqliteDatabase, 'Bone Health');
        await createLibraryNode(sqliteDatabase, 'Joint Health');
        await createLibraryNode(sqliteDatabase, 'Skin Health');
        await createLibraryNode(sqliteDatabase, 'Hair Health');
        await createLibraryNode(sqliteDatabase, 'Nail Health');
        await createLibraryNode(sqliteDatabase, 'Immune Support');
        await createLibraryNode(sqliteDatabase, 'Energy Metabolism');
        await createLibraryNode(sqliteDatabase, 'Metabolic Syndrome');
        await createLibraryNode(sqliteDatabase, 'Diabetes');
        await createLibraryNode(sqliteDatabase, 'Hypertension');
        await createLibraryNode(sqliteDatabase, 'Cardiovascular Health');
        await createLibraryNode(sqliteDatabase, 'Cholesterol Management');
        await createLibraryNode(sqliteDatabase, 'HDL Cholesterol');
        await createLibraryNode(sqliteDatabase, 'LDL Cholesterol');
        await createLibraryNode(sqliteDatabase, 'Triglycerides');
        await createLibraryNode(sqliteDatabase, 'Blood Sugar Regulation');
        await createLibraryNode(sqliteDatabase, 'Insulin Sensitivity');
        await createLibraryNode(sqliteDatabase, 'Hormonal Balance');
        await createLibraryNode(sqliteDatabase, 'Thyroid Function');
        await createLibraryNode(sqliteDatabase, 'Adrenal Support');
        await createLibraryNode(sqliteDatabase, 'Stress Management');
        await createLibraryNode(sqliteDatabase, 'Sleep Aid');
        await createLibraryNode(sqliteDatabase, 'Cognitive Function');
        await createLibraryNode(sqliteDatabase, 'Memory Enhancement');
        await createLibraryNode(sqliteDatabase, 'Mood Support');
        await createLibraryNode(sqliteDatabase, 'Depression');
        await createLibraryNode(sqliteDatabase, 'Anxiety');
        await createLibraryNode(sqliteDatabase, 'Antidepressants');
        await createLibraryNode(sqliteDatabase, 'SSRIs');
        await createLibraryNode(sqliteDatabase, 'SNRIs');
        await createLibraryNode(sqliteDatabase, 'MAOIs');
        await createLibraryNode(sqliteDatabase, 'Therapy');
        await createLibraryNode(sqliteDatabase, 'Psychotherapy');
        await createLibraryNode(sqliteDatabase, 'Counseling');
        await createLibraryNode(sqliteDatabase, 'Physical Therapy');
        await createLibraryNode(sqliteDatabase, 'Occupational Therapy');
        await createLibraryNode(sqliteDatabase, 'Speech Therapy');
        await createLibraryNode(sqliteDatabase, 'Rehabilitation');
        await createLibraryNode(sqliteDatabase, 'Pain Management');
        await createLibraryNode(sqliteDatabase, 'Analgesics');
        await createLibraryNode(sqliteDatabase, 'NSAIDs');
        await createLibraryNode(sqliteDatabase, 'Acetaminophen');
        await createLibraryNode(sqliteDatabase, 'Opioids');
        await createLibraryNode(sqliteDatabase, 'Addiction');
        await createLibraryNode(sqliteDatabase, 'Substance Abuse');
        await createLibraryNode(sqliteDatabase, 'Recovery');
        await createLibraryNode(sqliteDatabase, 'Detox');
        await createLibraryNode(sqliteDatabase, 'Alcoholism');
        await createLibraryNode(sqliteDatabase, 'Smoking Cessation');
        await createLibraryNode(sqliteDatabase, 'Nicotine Replacement Therapy');
        await createLibraryNode(sqliteDatabase, 'Varenicline');
        await createLibraryNode(sqliteDatabase, 'Bupropion');
        await createLibraryNode(sqliteDatabase, 'Weight Loss');
        await createLibraryNode(sqliteDatabase, 'Obesity');
        await createLibraryNode(sqliteDatabase, 'Bariatric Surgery');
        await createLibraryNode(sqliteDatabase, 'Diet');
        await createLibraryNode(sqliteDatabase, 'Ketogenic Diet');
        await createLibraryNode(sqliteDatabase, 'Mediterranean Diet');
        await createLibraryNode(sqliteDatabase, 'Vegan Diet');
        await createLibraryNode(sqliteDatabase, 'Vegetarian Diet');
        await createLibraryNode(sqliteDatabase, 'Paleo Diet');
        await createLibraryNode(sqliteDatabase, 'Intermittent Fasting');
        await createLibraryNode(sqliteDatabase, 'Exercise');
        await createLibraryNode(sqliteDatabase, 'Aerobic Exercise');
        await createLibraryNode(sqliteDatabase, 'Strength Training');
        await createLibraryNode(sqliteDatabase, 'Flexibility Training');
        await createLibraryNode(sqliteDatabase, 'Yoga');
        await createLibraryNode(sqliteDatabase, 'Pilates');
        await createLibraryNode(sqliteDatabase, 'High-Intensity Interval Training (HIIT)');
        await createLibraryNode(sqliteDatabase, 'Cardio');
        await createLibraryNode(sqliteDatabase, 'Running');
        await createLibraryNode(sqliteDatabase, 'Swimming');
        await createLibraryNode(sqliteDatabase, 'Cycling');
        await createLibraryNode(sqliteDatabase, 'Walking');
        await createLibraryNode(sqliteDatabase, 'Meditation');
        await createLibraryNode(sqliteDatabase, 'Mindfulness');
        await createLibraryNode(sqliteDatabase, 'Mental Health');
        await createLibraryNode(sqliteDatabase, 'Wellness');
        await createLibraryNode(sqliteDatabase, 'Preventive Medicine');
        await createLibraryNode(sqliteDatabase, 'Vaccination');
        await createLibraryNode(sqliteDatabase, 'Immunization');
        await createLibraryNode(sqliteDatabase, 'Flu Shot');
        await createLibraryNode(sqliteDatabase, 'COVID-19 Vaccine');
        await createLibraryNode(sqliteDatabase, 'Infectious Diseases');
        await createLibraryNode(sqliteDatabase, 'Antibiotics');
        await createLibraryNode(sqliteDatabase, 'Antivirals');
        await createLibraryNode(sqliteDatabase, 'Antifungals');
        await createLibraryNode(sqliteDatabase, 'Antiparasitics');
        await createLibraryNode(sqliteDatabase, 'Antimalarials');
        await createLibraryNode(sqliteDatabase, 'Travel Medicine');
        await createLibraryNode(sqliteDatabase, 'Altitude Sickness');
        await createLibraryNode(sqliteDatabase, 'Jet Lag');
        await createLibraryNode(sqliteDatabase, 'Sleep Disorders');
        await createLibraryNode(sqliteDatabase, 'Insomnia');
        await createLibraryNode(sqliteDatabase, 'Sleep Apnea');
        await createLibraryNode(sqliteDatabase, 'Restless Leg Syndrome');
        await createLibraryNode(sqliteDatabase, 'Narcolepsy');
        await createLibraryNode(sqliteDatabase, 'Gastrointestinal Health');
        await createLibraryNode(sqliteDatabase, 'Digestive Enzymes');
        await createLibraryNode(sqliteDatabase, 'Lactase');
        await createLibraryNode(sqliteDatabase, 'Gluten');
        await createLibraryNode(sqliteDatabase, 'Celiac Disease');
        await createLibraryNode(sqliteDatabase, 'Irritable Bowel Syndrome (IBS)');
        await createLibraryNode(sqliteDatabase, 'Inflammatory Bowel Disease (IBD)');
        await createLibraryNode(sqliteDatabase, "Crohn's Disease");
        await createLibraryNode(sqliteDatabase, 'Ulcerative Colitis');
        await createLibraryNode(sqliteDatabase, 'Acid Reflux');
        await createLibraryNode(sqliteDatabase, 'GERD');
        await createLibraryNode(sqliteDatabase, 'Peptic Ulcer');
        await createLibraryNode(sqliteDatabase, 'H. Pylori');
        await createLibraryNode(sqliteDatabase, 'Prostate Health');
        await createLibraryNode(sqliteDatabase, 'Benign Prostatic Hyperplasia (BPH)');
        await createLibraryNode(sqliteDatabase, 'Erectile Dysfunction');
        await createLibraryNode(sqliteDatabase, 'Testosterone');
        await createLibraryNode(sqliteDatabase, 'Estrogen');
        await createLibraryNode(sqliteDatabase, 'Progesterone');
        await createLibraryNode(sqliteDatabase, 'Menopause');
        await createLibraryNode(sqliteDatabase, 'Osteoporosis');
        await createLibraryNode(sqliteDatabase, 'Arthritis');
        await createLibraryNode(sqliteDatabase, 'Rheumatoid Arthritis');
        await createLibraryNode(sqliteDatabase, 'Gout');
        await createLibraryNode(sqliteDatabase, 'Fibromyalgia');
        await createLibraryNode(sqliteDatabase, 'Chronic Fatigue Syndrome');
        await createLibraryNode(sqliteDatabase, 'Lyme Disease');
        await createLibraryNode(sqliteDatabase, 'Autoimmune Diseases');
        await createLibraryNode(sqliteDatabase, 'Baseball');
        await createLibraryNode(sqliteDatabase, 'Shoulder Injuries');
        await createLibraryNode(sqliteDatabase, 'Elbow Injuries');
        await createLibraryNode(sqliteDatabase, 'Rotator Cuff Injuries');
        await createLibraryNode(sqliteDatabase, 'Ulnar Collateral Ligament (UCL) Injuries');
        await createLibraryNode(sqliteDatabase, 'Tommy John Surgery');
        await createLibraryNode(sqliteDatabase, 'Sports Medicine');
        await createLibraryNode(sqliteDatabase, 'Athletic Training');
        await createLibraryNode(sqliteDatabase, 'Concussion');
        await createLibraryNode(sqliteDatabase, 'Sports Nutrition');
        await createLibraryNode(sqliteDatabase, 'Warm-up Exercises');
        await createLibraryNode(sqliteDatabase, 'Stretching');
        await createLibraryNode(sqliteDatabase, 'Cardiovascular Fitness');
        await createLibraryNode(sqliteDatabase, 'Overuse Injuries');
        await createLibraryNode(sqliteDatabase, 'Mental Health in Sports');
        await createLibraryNode(sqliteDatabase, 'Performance Anxiety');
        await createLibraryNode(sqliteDatabase, 'Sleep for Athletes');
        await createLibraryNode(sqliteDatabase, 'Heat Exhaustion');
        await createLibraryNode(sqliteDatabase, 'Electrolyte Balance');
        await createLibraryNode(sqliteDatabase, 'Dynamic Stretching');
        await createLibraryNode(sqliteDatabase, 'Static Stretching');
        await createLibraryNode(sqliteDatabase, 'Plyometric Exercises');
        await createLibraryNode(sqliteDatabase, 'Core Strength');
        await createLibraryNode(sqliteDatabase, 'Agility Training');
        await createLibraryNode(sqliteDatabase, 'Reaction Time');
        await createLibraryNode(sqliteDatabase, 'Muscle Recovery');
        await createLibraryNode(sqliteDatabase, 'Protein Supplements');
        await createLibraryNode(sqliteDatabase, 'Energy Drinks');
        await createLibraryNode(sqliteDatabase, 'Dehydration');
        await createLibraryNode(sqliteDatabase, 'Sprains and Strains');
        await createLibraryNode(sqliteDatabase, 'First Aid');
        await createLibraryNode(sqliteDatabase, 'Athletic Footwear');
        await createLibraryNode(sqliteDatabase, 'Protective Gear');
        await createLibraryNode(sqliteDatabase, 'Eye Protection');
        await createLibraryNode(sqliteDatabase, 'Sun Protection');
        await createLibraryNode(sqliteDatabase, 'Vitamin D Synthesis');
        await createLibraryNode(sqliteDatabase, 'Stress Fractures');
        await createLibraryNode(sqliteDatabase, 'Muscle Cramps');
        await createLibraryNode(sqliteDatabase, 'Lactic Acid');
        await createLibraryNode(sqliteDatabase, 'Anaerobic Exercise');
        await createLibraryNode(sqliteDatabase, 'Team Dynamics');
        await createLibraryNode(sqliteDatabase, 'Sports Psychology');
        await createLibraryNode(sqliteDatabase, 'Goal Setting');
        await createLibraryNode(sqliteDatabase, 'Visualization Techniques');
        await createLibraryNode(sqliteDatabase, 'MDMA');
        await createLibraryNode(sqliteDatabase, 'Cocaine');
        await createLibraryNode(sqliteDatabase, 'THC');
        await createLibraryNode(sqliteDatabase, 'Orgasm');
        await createLibraryNode(sqliteDatabase, 'Psilocybin');
        await createLibraryNode(sqliteDatabase, 'Sexual Health');
        await createLibraryNode(sqliteDatabase, 'Penis');
        await createLibraryNode(sqliteDatabase, 'Vagina');
        await createLibraryNode(sqliteDatabase, 'Marijuana');
        await createLibraryNode(sqliteDatabase, 'Pornography');
        await createLibraryNode(sqliteDatabase, 'Anemia');
        await createLibraryNode(sqliteDatabase, 'Muscle Function');
        await createLibraryNode(sqliteDatabase, 'Digestion');
        await createLibraryNode(sqliteDatabase, 'Constipation');
        await createLibraryNode(sqliteDatabase, 'Bone Density');
        await createLibraryNode(sqliteDatabase, 'Immune System');
        await createLibraryNode(sqliteDatabase, 'Vision');
        await createLibraryNode(sqliteDatabase, 'Immune Health');
        await createLibraryNode(sqliteDatabase, 'Nervous System Health');
        await createLibraryNode(sqliteDatabase, 'Cholesterol Levels');
        await createLibraryNode(sqliteDatabase, 'Energy Production');
        await createLibraryNode(sqliteDatabase, 'Brain Health');
        await createLibraryNode(sqliteDatabase, 'Cell Growth');
        await createLibraryNode(sqliteDatabase, 'TAVR');
        await createLibraryNode(sqliteDatabase, 'Red Blood Cell Production');
        await createLibraryNode(sqliteDatabase, 'Collagen Production');
        await createLibraryNode(sqliteDatabase, 'Immune Function');
        await createLibraryNode(sqliteDatabase, 'Blood Clotting');
        await createLibraryNode(sqliteDatabase, 'Blood Production');
        await createLibraryNode(sqliteDatabase, 'TRT');
        await createLibraryNode(sqliteDatabase, 'Low Estrogen');
        await createLibraryNode(sqliteDatabase, 'High Estrogen');
        await createLibraryNode(sqliteDatabase, 'Wound Healing');
        await createLibraryNode(sqliteDatabase, 'Growth');
        await createLibraryNode(sqliteDatabase, 'Inflammation');
        await createLibraryNode(sqliteDatabase, 'Brain Development');
        await createLibraryNode(sqliteDatabase, 'Heart Health');
        await createLibraryNode(sqliteDatabase, 'Pregnancy');
        await createLibraryNode(sqliteDatabase, 'DNA Synthesis');
        await createLibraryNode(sqliteDatabase, 'Full Genome Sequencing');
        await createLibraryNode(sqliteDatabase, 'Blood Pressure');
        await createLibraryNode(sqliteDatabase, 'Muscle Contraction');
        await createLibraryNode(sqliteDatabase, 'Fluid Balance');
        await createLibraryNode(sqliteDatabase, 'Nerve Function');
        await createLibraryNode(sqliteDatabase, 'Bone Strength');
        await createLibraryNode(sqliteDatabase, 'Iron Metabolism');
        await createLibraryNode(sqliteDatabase, 'Bone Development');
        await createLibraryNode(sqliteDatabase, 'Enzyme Function');
        await createLibraryNode(sqliteDatabase, 'Dental Health');
        await createLibraryNode(sqliteDatabase, 'Gut Flora');
        await createLibraryNode(sqliteDatabase, 'Digestive Health');
        await createLibraryNode(sqliteDatabase, 'Blood Flow');
        await createLibraryNode(sqliteDatabase, 'Small Penis');
        await createLibraryNode(sqliteDatabase, 'Fat Metabolism');
        await createLibraryNode(sqliteDatabase, 'Hair Transplant');
        await createLibraryNode(sqliteDatabase, 'Cosmetic Surgery');
        await createLibraryNode(sqliteDatabase, 'Boob Job');
        await createLibraryNode(sqliteDatabase, 'Stress Relief');
        await createLibraryNode(sqliteDatabase, 'Sleep');
        await createLibraryNode(sqliteDatabase, 'Deep Sleep');
        await createLibraryNode(sqliteDatabase, 'Light Sleep');
        await createLibraryNode(sqliteDatabase, 'REM Sleep');
        await createLibraryNode(sqliteDatabase, 'Energy Levels');
        await createLibraryNode(sqliteDatabase, 'Mood Balance');
        await createLibraryNode(sqliteDatabase, 'Glucose Metabolism');
        await createLibraryNode(sqliteDatabase, 'Bowel Regularity');

        await createLibraryNodeRelationshipType(sqliteDatabase, 'is a form of');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is a source of');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'supports');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'supports absorption of');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is a precursor to');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is a symptom of');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is a side effect of');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is a treatment for');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is a risk factor for');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is a cause of');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is a deficiency of');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is a common injury from');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is a common complication of');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'triggers');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is a synthetic form of');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'contains');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'regulates');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is used to treat');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'interacts with');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'contraindicated with');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'enhances absorption of');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'reduces absorption of');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is metabolized into');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is converted into');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is synthesized from');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'has side effect of');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'benefits');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'harms');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is recommended for');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is contraindicated for');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is cofactor for');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is a component of');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'directs to');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is equivalent to');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is a class of');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is used for');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'leads to');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'deficiency causes');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is used as');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is a type of');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is essential for');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'is important for');
        await createLibraryNodeRelationshipType(sqliteDatabase, 'reduces');

        await createLibraryNodeRelationship(sqliteDatabase, 'Magnesium Glycinate', 'Magnesium', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Magnesium Citrate', 'Magnesium', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Magnesium Oxide', 'Magnesium', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Calcium Carbonate', 'Calcium', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Calcium Citrate', 'Calcium', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin D3', 'Vitamin D', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin D2', 'Vitamin D', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B Complex', 'Vitamin B1', 'contains');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B Complex', 'Vitamin B2', 'contains');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B Complex', 'Vitamin B3', 'contains');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B Complex', 'Vitamin B5', 'contains');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B Complex', 'Vitamin B6', 'contains');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B Complex', 'Vitamin B7', 'contains');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B Complex', 'Vitamin B9', 'contains');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B Complex', 'Vitamin B12', 'contains');
        await createLibraryNodeRelationship(sqliteDatabase, 'Multivitamin', 'Vitamin A', 'contains');
        await createLibraryNodeRelationship(sqliteDatabase, 'Multivitamin', 'Vitamin B Complex', 'contains');
        await createLibraryNodeRelationship(sqliteDatabase, 'Multivitamin', 'Vitamin C', 'contains');
        await createLibraryNodeRelationship(sqliteDatabase, 'Multivitamin', 'Vitamin D', 'contains');
        await createLibraryNodeRelationship(sqliteDatabase, 'Multivitamin', 'Vitamin E', 'contains');
        await createLibraryNodeRelationship(sqliteDatabase, 'Multivitamin', 'Vitamin K', 'contains');
        await createLibraryNodeRelationship(sqliteDatabase, 'Multivitamin', 'Iron', 'contains');
        await createLibraryNodeRelationship(sqliteDatabase, 'Multivitamin', 'Zinc', 'contains');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin C', 'Immune Support', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin D', 'Bone Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Calcium', 'Bone Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Magnesium', 'Muscle Recovery', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Protein Supplements', 'Muscle Recovery', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Omega-3 Fatty Acids', 'Cardiovascular Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Fish Oil', 'Omega-3 Fatty Acids', 'is a source of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Krill Oil', 'Omega-3 Fatty Acids', 'is a source of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Algae Oil', 'Omega-3 Fatty Acids', 'is a source of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin E', 'Antioxidants', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin C', 'Antioxidants', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Antioxidants', 'Immune Support', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Curcumin', 'Turmeric', 'is a component of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin C', 'Iron', 'enhances absorption of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Calcium', 'Iron', 'reduces absorption of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin D', 'Calcium', 'supports absorption of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin K2', 'Bone Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Probiotics', 'Gastrointestinal Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Prebiotics', 'Gastrointestinal Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Lactobacillus Acidophilus', 'Probiotics', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Bifidobacterium Bifidum', 'Probiotics', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Soluble Fiber', 'Fiber', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Insoluble Fiber', 'Fiber', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Saw Palmetto', 'Prostate Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Glucosamine', 'Joint Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Chondroitin', 'Joint Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'MSM (Methylsulfonylmethane)', 'Joint Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Biotin', 'Hair Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Biotin', 'Nail Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Collagen', 'Skin Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Hyaluronic Acid', 'Skin Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B12', 'Energy Metabolism', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Iron', 'Anemia', 'deficiency causes');
        await createLibraryNodeRelationship(sqliteDatabase, 'Folic Acid', 'Anemia', 'deficiency causes');
        await createLibraryNodeRelationship(sqliteDatabase, 'Green Tea Extract', 'Antioxidants', 'contains');
        await createLibraryNodeRelationship(sqliteDatabase, 'Alpha-Lipoic Acid', 'Antioxidants', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Melatonin', 'Sleep Aid', 'is used as');
        await createLibraryNodeRelationship(sqliteDatabase, 'Valerian Root', 'Sleep Aid', 'is used as');
        await createLibraryNodeRelationship(sqliteDatabase, "St. John's Wort", 'Depression', 'is a treatment for');
        await createLibraryNodeRelationship(sqliteDatabase, 'Ashwagandha', 'Stress Management', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Rhodiola Rosea', 'Stress Management', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'L-Theanine', 'Stress Management', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Ginkgo Biloba', 'Cognitive Function', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'L-Tryptophan', 'Mood Support', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Antidepressants', 'Depression', 'is a treatment for');
        await createLibraryNodeRelationship(sqliteDatabase, 'SSRIs', 'Antidepressants', 'is a class of');
        await createLibraryNodeRelationship(sqliteDatabase, 'SNRIs', 'Antidepressants', 'is a class of');
        await createLibraryNodeRelationship(sqliteDatabase, 'MAOIs', 'Antidepressants', 'is a class of');
        await createLibraryNodeRelationship(sqliteDatabase, 'NSAIDs', 'Pain Management', 'is used for');
        await createLibraryNodeRelationship(sqliteDatabase, 'Acetaminophen', 'Pain Management', 'is used for');
        await createLibraryNodeRelationship(sqliteDatabase, 'Opioids', 'Pain Management', 'is used for');
        await createLibraryNodeRelationship(sqliteDatabase, 'Opioids', 'Addiction', 'is a risk factor for');
        await createLibraryNodeRelationship(sqliteDatabase, 'Addiction', 'Substance Abuse', 'leads to');
        await createLibraryNodeRelationship(sqliteDatabase, 'Recovery', 'Addiction', 'is a treatment for');
        await createLibraryNodeRelationship(sqliteDatabase, 'Smoking Cessation', 'Cardiovascular Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Exercise', 'Cardiovascular Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Exercise', 'Weight Loss', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Diet', 'Weight Loss', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Ketogenic Diet', 'Diet', 'is a type of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vegan Diet', 'Diet', 'is a type of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Paleo Diet', 'Diet', 'is a type of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Intermittent Fasting', 'Diet', 'is a type of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin D', 'Osteoporosis', 'deficiency causes');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin K', 'Bone Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Calcium Hydroxyapatite', 'Calcium', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Gout', 'Arthritis', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Lycopene', 'Prostate Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Lutein', 'Eye Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Zeaxanthin', 'Eye Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Bilberry Extract', 'Eye Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Chia Seeds', 'Omega-3 Fatty Acids', 'is a source of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Flax Seeds', 'Omega-3 Fatty Acids', 'is a source of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Hemp Protein', 'Protein Supplements', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Whey Protein', 'Protein Supplements', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Soy Protein', 'Protein Supplements', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Pea Protein', 'Protein Supplements', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Magnesium', 'Muscle Function', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Magnesium', 'Bone Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Magnesium', 'Cardiovascular Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Magnesium', 'Calcium', 'regulates');
        await createLibraryNodeRelationship(sqliteDatabase, 'Magnesium Citrate', 'Digestion', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Magnesium Glycinate', 'Anxiety', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Magnesium Glycinate', 'Sleep Aid', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Magnesium Oxide', 'Constipation', 'is a treatment for');
        await createLibraryNodeRelationship(sqliteDatabase, 'Calcium', 'Bone Density', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Calcium', 'Osteoporosis', 'is a treatment for');
        await createLibraryNodeRelationship(sqliteDatabase, 'Calcium Carbonate', 'Acid Reflux', 'is a treatment for');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin D', 'Calcium', 'supports absorption of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin D', 'Bone Health', 'is essential for');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin D', 'Immune System', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin A', 'Vision', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin A', 'Immune Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B1', 'Energy Metabolism', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B1', 'Nervous System Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B2', 'Energy Metabolism', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B2', 'Skin Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B3', 'Cholesterol Levels', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B3', 'Cognitive Function', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B5', 'Energy Production', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B6', 'Brain Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B6', 'Mood Support', 'is important for');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B7', 'Hair Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B7', 'Nail Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B9', 'Cell Growth', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin B12', 'Red Blood Cell Production', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin C', 'Immune System', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin C', 'Antioxidants', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin C', 'Collagen Production', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin E', 'Skin Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin E', 'Immune Function', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin K', 'Blood Clotting', 'is essential for');
        await createLibraryNodeRelationship(sqliteDatabase, 'Vitamin K', 'Bone Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Iron', 'Anemia', 'is used to treat');
        await createLibraryNodeRelationship(sqliteDatabase, 'Iron', 'Blood Production', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Zinc', 'Immune Function', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Zinc', 'Wound Healing', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Zinc', 'Growth', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Omega-3 Fatty Acids', 'Brain Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Omega-3 Fatty Acids', 'Inflammation', 'reduces');
        await createLibraryNodeRelationship(sqliteDatabase, 'DHA', 'Brain Development', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'EPA', 'Heart Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Folic Acid', 'Pregnancy', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Folic Acid', 'DNA Synthesis', 'is essential for');
        await createLibraryNodeRelationship(sqliteDatabase, 'Potassium', 'Blood Pressure', 'regulates');
        await createLibraryNodeRelationship(sqliteDatabase, 'Potassium', 'Muscle Contraction', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Sodium', 'Fluid Balance', 'regulates');
        await createLibraryNodeRelationship(sqliteDatabase, 'Sodium', 'Nerve Function', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Chloride', 'Electrolyte Balance', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Phosphorus', 'Bone Strength', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Iodine', 'Thyroid Function', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Selenium', 'Antioxidants', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Copper', 'Iron Metabolism', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Chromium', 'Blood Sugar Regulation', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Manganese', 'Bone Development', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Molybdenum', 'Enzyme Function', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Fluoride', 'Dental Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Probiotics', 'Gut Flora', 'supports');
        await createLibraryNodeRelationship(
            sqliteDatabase,
            'Lactobacillus Acidophilus',
            'Digestive Health',
            'supports',
        );
        await createLibraryNodeRelationship(sqliteDatabase, 'Bifidobacterium Bifidum', 'Immune Function', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Coenzyme Q10', 'Heart Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Glucosamine', 'Joint Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Chondroitin', 'Joint Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'MSM (Methylsulfonylmethane)', 'Inflammation', 'reduces');
        await createLibraryNodeRelationship(sqliteDatabase, 'L-Arginine', 'Blood Flow', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'L-Carnitine', 'Fat Metabolism', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'L-Theanine', 'Stress Relief', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'L-Tryptophan', 'Sleep', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Ginkgo Biloba', 'Cognitive Function', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Ginseng', 'Energy Levels', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Echinacea', 'Immune Support', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, "St. John's Wort", 'Mood Balance', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Turmeric', 'Inflammation', 'reduces');
        await createLibraryNodeRelationship(sqliteDatabase, 'Curcumin', 'Joint Health', 'supports');
        await createLibraryNodeRelationship(
            sqliteDatabase,
            'Black Pepper Extract',
            'Curcumin',
            'enhances absorption of',
        );
        await createLibraryNodeRelationship(sqliteDatabase, 'Green Tea Extract', 'Weight Loss', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Resveratrol', 'Antioxidants', 'is a form of');
        await createLibraryNodeRelationship(sqliteDatabase, 'Alpha-Lipoic Acid', 'Glucose Metabolism', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Melatonin', 'Sleep', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Valerian Root', 'Sleep Aid', 'is used as');
        await createLibraryNodeRelationship(sqliteDatabase, 'Magnesium Malate', 'Energy Production', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Magnesium L-Threonate', 'Cognitive Function', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Calcium Hydroxyapatite', 'Bone Strength', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Calcium Lactate', 'Bone Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Fiber', 'Digestive Health', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Soluble Fiber', 'Cholesterol Levels', 'supports');
        await createLibraryNodeRelationship(sqliteDatabase, 'Insoluble Fiber', 'Bowel Regularity', 'supports');
    }
    catch(error) {
        console.error('Failed to create database:', error);
    } finally {
        closeDatabase(sqliteDatabase);
    }
}

async function createTable(sqliteDatabase: Database, tableName: string, schema: string, successMessage: string) {
    return new Promise<void>((resolve, reject) => {
        sqliteDatabase.run(`CREATE TABLE IF NOT EXISTS ${tableName} (${schema})`, function (error) {
            if(error) {
                console.error(`Failed to create ${tableName} table:`, error);
                reject(error);
            }
            else {
                console.log(successMessage);
                resolve();
            }
        });
    });
}

async function createLibraryNode(sqliteDatabase: Database, title: string, librarianId?: string) {
    return new Promise<void>((resolve, reject) => {
        const nodeId = uuidv4();
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
                    const historyId = uuidv4();
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
        const relationshipId = uuidv4();
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
                    const historyId = uuidv4();
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
        const relationshipTypeId = uuidv4();
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
                    const historyId = uuidv4();
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

interface ResponseInterface {
    error?: string;
    data?: any;
}

interface ResponsePaginationInterface {
    itemsPerPage: number;
    itemsTotal: number;
    page: number;
    pagesTotal: number;
}

export interface getLibraryNodeBySlugResponseInterface extends ResponseInterface {
    data: ComphrensiveLibraryNodeInterface;
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

export interface getLibraryNodesResponseInterface extends ResponseInterface {
    data: {
        libraryNodes: LibraryNodeInterface[];
        pagination: ResponsePaginationInterface;
    };
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
