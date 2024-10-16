// Dependencies - Next.js
import headers from 'next/headers';

// Dependencies - Prompts
import { PromptBuilder } from '@project/source/api/prompts/PromptBuilder';

// Dependencies - API
import { LibraryDatabase } from '@project/source/api/LibraryDatabase';
import {
    LibraryNodeInterface,
    LibraryNodeProposalInterface,
    LibraryNodeProposalReviewInterface,
    LibraryNodeHistoryInterface,
    LibraryNodeRelationshipInterface,
    LibraryNodeRelationshipTypeInterface,
    LibraryNodeComprehensiveInterface,
    LibraryPostInterface,
    LibraryPostHistoryInterface,
    LibraryPostVersionInterface,
    LibraryPostVersionReviewInterface,
    LibraryPostVersionAnnotationInterface,
} from '@project/source/api/LibraryApiInterfaces';

// Dependencies - Utilities
import { slug, uniqueIdentifier } from '@structure/source/utilities/String';

// Class - LibraryAgent
export class LibraryAgent {
    // Define tasks with their associated weights
    static tasks = [
        { name: 'proposeTitleChanges', method: LibraryAgent.proposeTitleChanges, weight: 1 },
        { name: 'createPostForLibraryNode', method: LibraryAgent.createPostForLibraryNode, weight: 0 },
    ];

    static async improveLibrary(database: LibraryDatabase, digitalIntelligenceHost: string) {
        if(!digitalIntelligenceHost) {
            throw new Error('Digital Intelligence host is not defined.');
        }

        try {
            // Select a task based on weights
            const task = LibraryAgent.selectTaskBasedOnWeight();
            if(task) {
                await task.method.call(LibraryAgent, database, digitalIntelligenceHost);

                // Sleep for 3000 ms
                // await LibraryAgent.delay(3000);
            }
            else {
                console.error('No task selected.');
            }
        }
        catch(error) {
            console.error('Error in improveLibrary:', error);
        }
    }

    static selectTaskBasedOnWeight() {
        const totalWeight = this.tasks.reduce((sum, task) => sum + task.weight, 0);
        const randomValue = Math.random() * totalWeight;
        let cumulativeWeight = 0;
        for(const task of this.tasks) {
            cumulativeWeight += task.weight;
            if(randomValue < cumulativeWeight) {
                return task;
            }
        }
        return null;
    }

    static async proposeTitleChanges(database: LibraryDatabase, digitalIntelligenceHost: string) {
        // Step 1 - Get a random node
        const randomNode = database.getRandomLibraryNode();

        // Step 2 - Get the proposed changes (title update or delete)
        const proposal = await this.getProposedTitleChange(randomNode, digitalIntelligenceHost);
        // console.log('proposal:', proposal);

        if(!proposal) {
            return;
        }

        // Get the proposed change
        const action = proposal.command === 'nodeTitleUpdate' ? 'UpdateTitle' : 'Delete';
        const metadata =
            proposal.command === 'nodeTitleUpdate'
                ? {
                      currentTitle: randomNode.title,
                      proposedTitle: proposal.proposedTitle,
                      reason: proposal.reason,
                  }
                : { reason: proposal.reason };

        // Create the LibraryNodeProposal object
        const libraryNodeProposal = database.createLibraryNodeProposal(randomNode.id, 'System', action, metadata);

        // If the proposed changes include a delete, log the node title
        if(proposal.command === 'nodeDelete') {
            // console.log(`Proposed deletion of node: "${randomNode.title}"`);
        }

        // Step 3 - Review the proposed changes 3 times in parallel
        const isAccepted = await this.reviewProposedChange(
            database,
            proposal,
            randomNode.title,
            randomNode.id,
            libraryNodeProposal.id,
            digitalIntelligenceHost,
        );

        // Update the library node proposal status
        database.updateLibraryNodeProposalStatus(libraryNodeProposal.id, isAccepted ? 'Accepted' : 'Rejected');

        // Step 4 - Handle accepted changes (update or delete node)
        if(isAccepted) {
            this.applyChanges(database, randomNode, proposal);
        }
    }

    static async createPostForLibraryNode(database: LibraryDatabase, digitalIntelligenceHost: string) {
        // TODO: This will need to change as we scale up
        let libraryNode = null;
        let libraryPost = null;
        while(!libraryPost) {
            // Get a random node
            libraryNode = database.getRandomLibraryNode();

            // Check if there is already a post for the node
            const possiblyExistingLibraryPost = database.getLibraryPostForLibraryNode(libraryNode.id);

            // If there is no post for the node, create one
            if(!possiblyExistingLibraryPost) {
                // Create the library post
                libraryPost = database.getOrCreateLibraryPostForLibraryNode(libraryNode.id);
            }
        }

        // Bail if we don't have a random node and a post for that node
        if(!libraryNode || !libraryPost) {
            return;
        }

        // We now have a random node and a post for that node
        console.log('\n\n\n');
        console.log(`\n=== Creating post for: "${libraryNode.title}" ===\n`);

        // Now we are ready to write the post

        // Initialize variables
        let articleObject = null;
        let iteration = 0;
        let libraryPostVersionReviews: LibraryPostVersionReviewInterface[] = [];
        const loopCount = 4;

        // Loop x times
        while(iteration < loopCount) {
            iteration++;
            console.log(`\n--- Iteration ${iteration} for ${libraryNode.title} ---\n`);

            // Generate article content with feedback
            let newArticleObject = await this.getGeneratedArticle(
                digitalIntelligenceHost,
                libraryNode,
                articleObject,
                libraryPostVersionReviews,
            );
            console.log(`Generated article for node: "${libraryNode.title}"`);
            console.log(libraryNode.title, 'Article Content:');
            console.log(newArticleObject);
            console.log('------------------------------------');

            if(!newArticleObject || !newArticleObject.content) {
                continue;
            }

            articleObject = newArticleObject;

            // Create the LibraryPostVersion
            const libraryPostVersion = database.createLibraryPostVersion({
                libraryPostId: libraryPost.id,
                librarianId: 'System',
                status: 'Draft',
                title: articleObject.title,
                subtitle: articleObject.subtitle,
                content: articleObject.content,
                description: articleObject.description,
                notesForReviewers: articleObject.notesForReviewers,
            });

            // If we are not on the last iteration, it's time to go to review
            if(loopCount !== iteration) {
                // Review the generated article
                const libraryPostVersionReview = await this.reviewLibraryPostVersionForLibraryNode(
                    database,
                    digitalIntelligenceHost,
                    libraryNode,
                    libraryPostVersion,
                );

                if(libraryPostVersionReview) {
                    console.log('\n\n\n');
                    console.log(`--- Iteration ${iteration} for ${libraryNode.title} Feedback ---\n`);
                    console.log(libraryPostVersionReview);
                    console.log('\n\n\n');

                    // Update feedbacks for the next iteration
                    libraryPostVersionReviews = [libraryPostVersionReview];
                }
            }
        }

        // Step 4 - Accept the article in its current state
        // database.updateLibraryNodeArticle(randomLibraryNode.title, articleContent);
        // console.log(`Article saved for node: "${randomLibraryNode.title}"`);
        console.log('\n=== Final Article Content ===\n');
        console.log(articleObject);
    }

    static async getGeneratedArticle(
        digitalIntelligenceHost: string,
        randomNode: any,
        articleObject?: ReturnType<typeof LibraryAgent.parseGeneratedArticle> | null,
        libraryPostVersionReviews?: LibraryPostVersionReviewInterface[],
    ) {
        const prompt = PromptBuilder.constructArticlePrompt(randomNode.title, articleObject, libraryPostVersionReviews);

        // console.log('\n\n\n\n');
        // console.log('Prompt for article generation:');
        // console.log(prompt);
        // console.log('\n\n\n\n');

        const generatedText = await this.callDigitalIntelligenceWithRetry(prompt, digitalIntelligenceHost);
        if(!generatedText) {
            console.error('Failed to get a response for article generation.');
            return null;
        }

        return LibraryAgent.parseGeneratedArticle(generatedText);
    }

    static parseGeneratedArticle(generatedText: string) {
        const articleTitle = this.getTrimmedSegment(generatedText, 'ARTICLE_TITLE_START', 'ARTICLE_TITLE_END', true);
        const articleSubtitle = this.getTrimmedSegment(
            generatedText,
            'ARTICLE_SUBTITLE_START',
            'ARTICLE_SUBTITLE_END',
            true,
        );
        const feedbackResponse = this.getTrimmedSegment(
            generatedText,
            'FEEDBACK_RESPONSE_START',
            'FEEDBACK_RESPONSE_END',
        );
        const articleContent = this.getTrimmedSegment(generatedText, 'ARTICLE_CONTENT_START', 'ARTICLE_CONTENT_END');
        const articleSummary = this.getTrimmedSegment(
            generatedText,
            'ARTICLE_SUMMARY_START',
            'ARTICLE_SUMMARY_END',
            true,
        );

        return {
            title: articleTitle,
            subtitle: articleSubtitle,
            notesForReviewers: feedbackResponse,
            content: articleContent,
            description: articleSummary,
        };
    }

    static getTrimmedSegment(
        text: string,
        startMarker: string,
        endMarker: string,
        removeMarkdown: boolean = false,
    ): string {
        const startIndex = text.indexOf(startMarker) + startMarker.length;
        const endIndex = text.indexOf(endMarker);
        if(startIndex < startMarker.length || endIndex === -1) {
            return '';
        }
        let segment = text.substring(startIndex, endIndex).trim();

        if(removeMarkdown) {
            // Remove all new lines
            segment = segment.replace(/\n/g, ' ');

            // Remove extra spaces
            segment = segment.replace(/\s+/g, ' ');

            // Remove all markdown
            segment = segment.replace(/[*_`]/g, '');

            // Remove #
            segment = segment.replace(/#/g, '');

            segment = segment.trim();
        }

        return segment;
    }

    static async reviewLibraryPostVersionForLibraryNode(
        database: LibraryDatabase,
        digitalIntelligenceHost: string,
        libraryNode: LibraryNodeInterface,
        libraryPostVersion: LibraryPostVersionInterface,
    ) {
        // Get the prompt
        const reviewerPrompt = PromptBuilder.constructArticleReviewPrompt(libraryPostVersion, libraryNode.title);
        console.log('Reviewer Prompt:', reviewerPrompt);

        // Get the review
        const review = await this.callDigitalIntelligenceWithRetry(reviewerPrompt, digitalIntelligenceHost);
        if(!review) {
            console.error('Failed to get a response for article review.');
            return null;
        }

        // Create the LibraryPostVersionReview
        const libraryPostVersionReview = database.createLibraryPostVersionReview({
            librarianId: 'System',
            libraryPostVersionId: libraryPostVersion.id,
            decision: 'Accept',
            review: review,
        });

        return libraryPostVersionReview;
    }

    static async getProposedTitleChange(randomNode: LibraryNodeInterface, digitalIntelligenceHost: string) {
        const prompt = PromptBuilder.constructInitialPrompt([randomNode.title]);
        const generatedText = await this.callDigitalIntelligenceWithRetry(prompt, digitalIntelligenceHost);
        console.log('getProposedTitleChange', randomNode.title, digitalIntelligenceHost);

        // console.log('Generated Text:', generatedText);

        if(!generatedText) {
            console.error('Failed to get a response for proposed changes.');
            return null;
        }

        const command = this.parseCommand(generatedText);

        // If the command is nodeTitleUpdate and the new title is the same as the current title, ignore the change
        if(command && command.command === 'nodeTitleUpdate' && command.proposedTitle === randomNode.title) {
            return null;
        }

        // If the command is nodeTitleUpdate and the new title empty, ignore the change
        if(command && command.command === 'nodeTitleUpdate' && command.proposedTitle === '') {
            return null;
        }

        return command;
    }

    static async reviewProposedChange(
        database: LibraryDatabase,
        commands: any[],
        originalTitle: string,
        libraryNodeId: string,
        libraryNodeProposalId: string,
        digitalIntelligenceHost: string,
    ) {
        // Store how many reviewers accepted the change
        let acceptCount = 0;

        // Prompt the reviewers
        const reviewCount = 3;
        for(let i = 0; i < reviewCount; i++) {
            // Get the prompt
            const reviewerPrompt = PromptBuilder.constructReviewerPrompt(commands, originalTitle);

            // Get the response
            const response = await this.callDigitalIntelligenceWithRetry(reviewerPrompt, digitalIntelligenceHost);
            // console.log('response:', response);

            if(response) {
                // Parse the response
                const jsonStart = response.indexOf('{');
                const jsonEnd = response.lastIndexOf('}') + 1;
                if(jsonStart === -1 || jsonEnd === -1) {
                    throw new Error('JSON object not found in the response.');
                }
                const jsonString = response.substring(jsonStart, jsonEnd);
                // console.log('jsonString', jsonString);

                const responseObject = JSON.parse(jsonString);
                // console.log('command', command);

                if(responseObject.decision) {
                    // console.log('Decision:', responseObject.decision);

                    if(responseObject.decision.toLowerCase().includes('accept')) {
                        acceptCount++;
                    }
                }

                const decision = responseObject.decision;
                const reason = responseObject.reason;
                const metadata = {
                    title: originalTitle,
                };

                // Store in the database
                database.createLibraryNodeProposalReview(libraryNodeProposalId, 'System', decision, reason, metadata);
            }
        }

        return acceptCount === reviewCount;
    }

    static applyChanges(database: LibraryDatabase, node: any, command: any) {
        // Node title update
        if(command.command === 'nodeTitleUpdate') {
            // Handle node title update
            if(node.title !== command.proposedTitle) {
                // console.log(`Updating node title: "${node.title}" to "${command.proposedTitle}"`);

                let proposedTitle = command.proposedTitle;
                proposedTitle = proposedTitle.trim();

                // Replace all & with 'and'
                proposedTitle = proposedTitle.replace(/&/g, 'and');

                database.updateLibraryNodeTitle(node.title, proposedTitle, 'System');
            }
            else {
                // console.log('Proposed title is identical to current title. No update needed.');
            }
        }
        // Node deletion
        else if(command.command === 'nodeDelete') {
            // Handle node deletion
            // console.log(`Deleting node: "${node.title}"`);
            database.deleteLibraryNodeByTitle(node.title, 'System');
        }
    }

    static async callDigitalIntelligenceWithRetry(
        prompt: string,
        digitalIntelligenceHost: string,
        retries = 3,
    ): Promise<string | null> {
        const apiKey = process.env.OPENAI_API_KEY;
        // const url = 'http://localhost:1234/v1/chat/completions';
        // const url = 'http://10.10.100.1:1234/v1/chat/completions';
        const url = digitalIntelligenceHost + '/v1/chat/completions';
        // console.log('callDigitalIntelligenceWithRetry', url);

        if(!digitalIntelligenceHost) {
            throw new Error('Digital Intelligence host is not defined.');
        }

        for(let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: 'gpt-4',
                        messages: [{ role: 'user', content: prompt }],
                        max_tokens: 2000,
                    }),
                });

                if(!response.ok) {
                    const error = await response.json();
                    console.error('LLM API error:', error);
                }

                const data = (await response.json()) as any;
                const generatedText = data.choices[0].message.content.trim();

                return generatedText;
            }
            catch(error: any) {
                console.warn(`Attempt ${attempt} failed:`, error.message);
                if(attempt === retries) {
                    console.error('Max retries reached. Failing the request.');
                    return null;
                }
                await this.delay(1000 * attempt); // Exponential backoff
            }
        }
        return null;
    }

    // Validate a single command
    static validateCommand(command: any): boolean {
        return (
            command && command.command && (command.command === 'nodeTitleUpdate' || command.command === 'nodeDelete')
        );
    }

    // Assumes a JSON object with a single command in the generated text
    static parseCommand(generatedText: string) {
        try {
            // Remove code block markers and any text before/after JSON
            const jsonStart = generatedText.indexOf('{');
            const jsonEnd = generatedText.lastIndexOf('}') + 1;
            if(jsonStart === -1 || jsonEnd === -1) {
                throw new Error('JSON object not found in the response.');
            }
            const jsonString = generatedText.substring(jsonStart, jsonEnd);
            // console.log('jsonString', jsonString);

            const command = JSON.parse(jsonString);
            // console.log('command', command);

            // Validate command
            if(this.validateCommand(command)) {
                // console.log('Valid command:', command);
                return command;
            }
            else {
                // console.error('Invalid command format or no actual change.', command);
                return null;
            }
        }
        catch(error) {
            console.error('Error parsing command:', error);
            console.debug('Generated Text:', generatedText);
            return null;
        }
    }

    // Assumes a JSON array of commands in the generated text
    static parseCommands(generatedText: string) {
        try {
            // Remove code block markers and any text before/after JSON
            const jsonStart = generatedText.indexOf('[');
            const jsonEnd = generatedText.lastIndexOf(']') + 1;
            if(jsonStart === -1 || jsonEnd === -1) {
                throw new Error('JSON array not found in the response.');
            }
            const jsonString = generatedText.substring(jsonStart, jsonEnd);

            const commands = JSON.parse(jsonString);

            // Validate commands
            if(Array.isArray(commands) && commands.length > 0) {
                for(const command of commands) {
                    if(!this.validateCommand(command)) {
                        throw new Error('Invalid command format or no actual change.');
                    }
                }
                return commands;
            }
            else {
                return [];
            }
        }
        catch(error) {
            console.error('Error parsing commands:', error);
            console.debug('Generated Text:', generatedText);
            return [];
        }
    }

    static delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    static async addBannerImagesToLibraryPosts(database: LibraryDatabase) {
        const libraryPostWithoutBannerImage = database.getLibraryPostWithVersionsWithoutBannerImage();
        // console.log('libraryNode', libraryNode);

        if(!libraryPostWithoutBannerImage) {
            console.log('No library post found.');
            return;
        }

        const libraryPostVersion = libraryPostWithoutBannerImage.versions[0]!;
        let libraryPostContentTruncated = libraryPostVersion.content.substring(0, 3000);
        // Remove the last line if at 3000 characters limit
        if(libraryPostContentTruncated.length === 3000) {
            libraryPostContentTruncated = libraryPostContentTruncated.substring(
                0,
                libraryPostContentTruncated.lastIndexOf('\n'),
            );
        }

        const prompt = `Please create a beautiful watercolor image for this article. Do not have any text in the image. Focus on a single element that represents the article. Keep it very simple and elegant.

---
${libraryPostVersion.title}
${libraryPostVersion.subtitle}

${libraryPostVersion.description}

${libraryPostContentTruncated}
---
`;

        console.log('PROMPT');
        console.log(prompt);

        const apiKey = process.env.OPENAI_API_KEY;
        const url = 'https://api.openai.com/v1/images/generations';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt: prompt,
                n: 1,
                // quality: 'standard',
                quality: 'hd',
                // size: '1024x1024',
                size: '1792x1024',
                response_format: 'b64_json',
                // style: 'natural', // natural or vivid
            }),
        });

        if(!response.ok) {
            const error = await response.json();
            console.error('LLM API error:', error);
        }

        const data = (await response.json()) as any;

        console.log('data', data);

        const image = data.data[0].b64_json;

        // Save the image file
        const buffer = Buffer.from(image, 'base64');
        // const fileName = libraryPost.id + '-' + slug(libraryPostVersion.title) + '.png';
        const fileName = slug(libraryPostVersion.title) + '-' + uniqueIdentifier(6) + '.png';
        const filePath = `./public/images/articles/${fileName}`;
        require('fs').writeFileSync(filePath, buffer);

        // Create the LibraryPostAsset
        const libraryPostAsset = database.createLibraryPostAsset({
            libraryPostId: libraryPostWithoutBannerImage.id,
            librarianId: 'System',
            role: 'Banner',
            type: 'Image',
            format: 'png',
            fileNameWithExtension: fileName,
            title: '',
            caption: '',
            revisedPrompt: data.data[0].revised_prompt,
        });

        return libraryPostAsset;
    }
}

// Export - Default
export default LibraryAgent;
