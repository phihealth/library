// Dependencies - API
import { type LibraryDatabase } from '@project/source/api/LibraryDatabase';

export interface LibraryNodeInterface {
    id: string;
    status: string;
    title: string;
    slug: string;
    lastReviewedAt: string;
    updatedAt: string;
    createdAt: string;
}

// Define Metadata Types
interface LibraryNodeProposalUpdateTitleMetadataInterface {
    currentTitle: string;
    proposedTitle: string;
    reason: string;
}

interface LibraryNodeProposalDeleteMetadataInterface {
    reason: string;
}

interface LibraryNodeProposalCreateMetadataInterface {
    title: string;
    reason?: string;
}

interface LibraryNodeProposalMergeMetadataInterface {
    sourceNodeId: string;
    targetNodeId: string;
    reason?: string;
}

// Discriminated Union for LibraryNodeProposalInterface
export interface LibraryNodeProposalBaseInterface {
    id: string;
    libraryNodeId: string;
    librarianId: string;
    status: 'Pending' | 'Accepted' | 'Rejected';
    updatedAt: string;
    createdAt: string;
}

export interface UpdateTitleProposal extends LibraryNodeProposalBaseInterface {
    action: 'UpdateTitle';
    metadata: LibraryNodeProposalUpdateTitleMetadataInterface;
}

export interface DeleteProposal extends LibraryNodeProposalBaseInterface {
    action: 'Delete';
    metadata: LibraryNodeProposalDeleteMetadataInterface;
}

export interface CreateProposal extends LibraryNodeProposalBaseInterface {
    action: 'Create';
    metadata: LibraryNodeProposalCreateMetadataInterface;
}

export interface MergeProposal extends LibraryNodeProposalBaseInterface {
    action: 'Merge';
    metadata: LibraryNodeProposalMergeMetadataInterface;
}

// Union Type for LibraryNodeProposalInterface
export type LibraryNodeProposalInterface = UpdateTitleProposal | DeleteProposal | CreateProposal | MergeProposal;

export interface LibraryNodeProposalReviewInterface {
    id: string;
    libraryNodeProposalId: string;
    librarianId: string;
    decision: string; // 'Accept' or 'Reject'
    reason: string; // Explanation for the decision in markdown
    metadata: string; // JSON string
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
    libraryNodeId?: string;
    libraryNodeRelationshipId?: string;
    activeLibraryPostVersionId?: string;
    status: 'Draft' | 'Published' | 'Archived';
    updatedAt: string;
    createdAt: string;
}

export interface LibraryPostHistoryInterface {
    id: string;
    libraryPostId: string;
    librarianId: string;
    action: string;
    metadata: string;
    createdAt: string;
}

export interface LibraryPostVersionInterface {
    id: string;
    libraryPostId: string;
    librarianId: string;
    status: 'Draft' | 'InReview' | 'Approved' | 'Rejected';
    title: string;
    subtitle: string;
    content: string;
    description: string;
    notesForReviewers?: string; // Notes by the author to reviewers
    updatedAt: string;
    createdAt: string;
}

export interface LibraryPostVersionReviewInterface {
    id: string;
    librarianId: string;
    libraryPostVersionId: string;
    decision: 'Accept' | 'Revise' | 'Reject';
    review: string; // Review in markdown
    updatedAt: string;
    createdAt: string;
}

export interface LibraryPostVersionAnnotationInterface {
    id: string;
    libraryPostVersionId: string;
    librarianId: string;
    startOffset: number;
    endOffset: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export interface LibraryPostVersionWithReviewsInterface extends LibraryPostVersionInterface {
    reviews: LibraryPostVersionReviewInterface[];
}

export interface LibraryPostWithAssetsAndVersionsAndReviewsInterface extends LibraryPostInterface {
    assets: LibraryPostAssetInterface[];
    versions: LibraryPostVersionWithReviewsInterface[];
}

export interface LibraryPostAssetInterface {
    id: string;
    libraryPostId: string;
    librarianId: string;
    role: string;
    type: string;
    format: string;
    fileNameWithExtension: string;
    title?: string;
    caption?: string;
    revisedPrompt?: string;
    updatedAt?: string;
    createdAt: string;
}

export interface LibraryNodeComprehensiveInterface extends LibraryNodeInterface {
    inboundRelationships: LibraryNodeRelationshipInterface[];
    outboundRelationships: LibraryNodeRelationshipInterface[];
    history: LibraryNodeHistoryInterface[];
    postsWithAssetsAndVersionsAndReviews: LibraryPostWithAssetsAndVersionsAndReviewsInterface[];
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

export interface LibraryPostWithLatestVersionInterface extends LibraryPostInterface {
    libraryPostVersion: LibraryPostVersionInterface;
}

export interface LibraryNodeWithLibraryPostWithLatestVersionInterface extends LibraryNodeInterface {
    libraryPost: LibraryPostWithLatestVersionInterface;
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
    getRandomLibraryNodes: {
        parameters: {
            count: number;
            comprehensive?: boolean;
        };
        response: {
            data: LibraryNodeComprehensiveInterface[];
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
    getLibraryNodesWithLibraryPostsWithLatestVersions: {
        parameters: {
            page: number;
            itemsPerPage: number;
            searchTerm?: string;
        };
        response: {
            data: {
                libraryNodes: LibraryNodeWithLibraryPostWithLatestVersionInterface[];
                pagination: PaginationResponseInterface;
            };
        };
    };
    improveLibrary: {
        parameters: {
            digitalIntelligenceHost: string;
        };
        response: {
            data: string;
        };
    };
    addBannerImagesToLibraryPosts: {
        parameters: undefined;
        response: {
            data: string;
        };
    };
}
