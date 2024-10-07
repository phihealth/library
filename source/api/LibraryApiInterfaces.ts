// Dependencies - API
import { type LibraryDatabase } from '@project/source/api/LibraryDatabase';

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

// export interface ChangeDetailInterface {
//     field: string;
//     oldValue?: any;
//     newValue?: any;
//     reason?: string; // Explanation for the change
// }

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

export interface LibraryNodeComprehensiveInterface extends LibraryNodeInterface {
    inboundRelationships: LibraryNodeRelationshipInterface[];
    outboundRelationships: LibraryNodeRelationshipInterface[];
    history: LibraryNodeHistoryInterface[];
}

export interface LibraryNodeRelationshipConciseInterface {
    relationship: LibraryNodeRelationshipTypeInterface['type'];
    confidence: LibraryNodeRelationshipInterface['confidence'];
}

export interface LibraryNodeInboundRelationshipConciseInterface extends LibraryNodeRelationshipConciseInterface {
    sourceNodeTitle: LibraryNodeInterface['title'];
}

export interface LibraryNodeOutboundRelationshipConciseInterface extends LibraryNodeRelationshipConciseInterface {
    targetNodeTitle: LibraryNodeInterface['title'];
}

export interface LibraryNodeWithRelationshipsConciseInterface {
    title: LibraryNodeInterface['title'];
    inboundRelationships: LibraryNodeInboundRelationshipConciseInterface[];
    outboundRelationships: LibraryNodeOutboundRelationshipConciseInterface[];
}

export interface PaginationResponseInterface {
    itemsPerPage: number;
    itemsTotal: number;
    page: number;
    pagesTotal: number;
}

// Define a type map of API calls
export interface LibraryApiInterface {
    getTables: {
        parameters: undefined;
        response: {
            data: ReturnType<LibraryDatabase['getTables']>;
        };
    };
    getRandomLibraryNode: {
        parameters: undefined;
        response: {
            data: LibraryNodeComprehensiveInterface;
        };
    };
    getLibraryNodeBySlug: {
        parameters: {
            slug: string;
        };
        response: {
            data: LibraryNodeComprehensiveInterface;
        };
    };
    getLibraryNodes: {
        parameters: {
            page: number;
            itemsPerPage: number;
            searchTerm?: string;
        };
        response: {
            data: {
                libraryNodes: LibraryNodeInterface[];
                pagination: PaginationResponseInterface;
            };
        };
    };
    improveLibrary: {
        parameters: undefined;
        response: {
            data: string;
        };
    };
}
