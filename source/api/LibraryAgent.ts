// Dependencies - Prompts
import { PromptBuilder } from '@project/source/api/prompts/PromptBuilder';

// Dependencies - API
import { LibraryDatabase } from '@project/source/api/LibraryDatabase';

// Dependencies - Utilities
import { slug } from '@structure/source/utilities/String';

// Class - LibraryAgent
export class LibraryAgent {
    // Define tasks with their associated weights
    static tasks = [
        { name: 'proposeTitleChanges', method: LibraryAgent.proposeTitleChanges, weight: 1 },
        { name: 'createArticleForNode', method: LibraryAgent.createArticleForNode, weight: 0 },
    ];

    static async improveLibrary(database: LibraryDatabase) {
        try {
            // Select a task based on weights
            const task = LibraryAgent.selectTaskBasedOnWeight();
            if(task) {
                await task.method.call(LibraryAgent, database);
            }
            else {
                console.error('No task selected.');
            }
        }
        catch(error) {
            console.error('Error in improveLibrary:', error);
        }
    }

    private static selectTaskBasedOnWeight() {
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

    private static async proposeTitleChanges(database: LibraryDatabase) {
        // Existing code for proposing title changes
        // Step 1 - Get a random node
        const randomNode = database.getRandomLibraryNode();

        // Step 2 - Get the proposed changes (title update or delete)
        const proposal = await this.getProposedTitleChange(randomNode);
        console.log('proposal:', proposal);

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
            console.log(`Proposed deletion of node: "${randomNode.title}"`);
        }

        // Step 3 - Review the proposed changes 3 times in parallel
        const isAccepted = await this.reviewProposedChange(database, proposal, randomNode.title, randomNode.id);

        // Update the library node proposal status
        database.updateLibraryNodeProposalStatus(libraryNodeProposal.id, isAccepted ? 'Accepted' : 'Rejected');

        // Step 4 - Handle accepted changes (update or delete node)
        if(isAccepted) {
            this.applyChanges(database, randomNode, proposal);
        }
    }

    private static async createArticleForNode(database: LibraryDatabase) {
        // Step 1 - Get a random node
        const randomNode = database.getRandomLibraryNode();
        console.log('\n\n\n');
        console.log(`\n=== Creating article for: "${randomNode.title}" ===\n`);

        // Step 2 - Initialize variables
        let articleContent = '';
        let iteration = 0;
        let feedback: string[] = [];

        const loopCount = 5;

        // Step 3 - Loop x times
        while(iteration < loopCount) {
            iteration++;
            console.log(`\n--- Iteration ${iteration} ---\n`);

            // Generate article content with feedback
            articleContent = await this.getGeneratedArticle(randomNode, articleContent, feedback);
            console.log(`Generated article for node: "${randomNode.title}"`);
            console.log(randomNode.title, 'Article Content:');
            console.log(articleContent);
            console.log('------------------------------------');

            if(!articleContent) {
                console.error('Failed to generate article content.');
                return;
            }

            // Only review if not on the last iteration
            if(loopCount !== iteration) {
                // Review the generated article
                const reviewResult = await this.reviewGeneratedArticle(articleContent, randomNode.title);
                console.log('\n\n\n');
                console.log(`--- Iteration ${iteration} Feedback ---\n`);
                reviewResult.feedbacks.forEach((feedback, index) => {
                    console.log('\n\n');
                    console.log(`- Reviewer ${index + 1} Feedback -`);
                    console.log('\n\n');
                    console.log(feedback);
                    console.log('\n\n');
                    console.log('------------');
                });
                console.log('------------------------------------');

                // Update feedbacks for the next iteration
                feedback = reviewResult.feedbacks;
            }
        }

        // Step 4 - Accept the article in its current state
        // database.updateLibraryNodeArticle(randomNode.title, articleContent);
        // console.log(`Article saved for node: "${randomNode.title}"`);
        console.log('\n=== Final Article Content ===\n');
        console.log(articleContent);
    }

    private static async getGeneratedArticle(
        randomNode: any,
        previousArticleContent?: string,
        feedbackList?: string[],
    ) {
        const prompt = PromptBuilder.constructArticlePrompt(randomNode.title, previousArticleContent, feedbackList);

        // console.log('\n\n\n\n');
        // console.log('Prompt for article generation:');
        // console.log(prompt);
        // console.log('\n\n\n\n');

        const generatedText = await this.callDigitalIntelligenceWithRetry(prompt);

        if(!generatedText) {
            console.error('Failed to get a response for article generation.');
            return '';
        }

        return generatedText;
    }

    private static async reviewGeneratedArticle(
        articleContent: string,
        originalTitle: string,
    ): Promise<{ isAccepted: boolean; feedbacks: string[] }> {
        const reviewerResponses = [];
        const feedbacks: string[] = [];

        for(let i = 0; i < 3; i++) {
            const reviewerPrompt = PromptBuilder.constructArticleReviewPrompt(articleContent, originalTitle);

            const response = await this.callDigitalIntelligenceWithRetry(reviewerPrompt);
            reviewerResponses.push(response);
        }

        let acceptCount = 0;
        reviewerResponses.forEach((response) => {
            if(response) {
                const [decisionLine, ...feedbackLines] = response.split('\n');
                if(decisionLine) {
                    const decision = decisionLine.trim().toLowerCase();

                    const feedback = feedbackLines.join('\n').trim();
                    if(feedback) {
                        feedbacks.push(feedback);
                    }

                    if(decision.includes('accept')) {
                        acceptCount++;
                    }
                }
            }
        });

        return { isAccepted: acceptCount === 3, feedbacks };
    }

    private static async getProposedTitleChange(randomNode: any) {
        const prompt = PromptBuilder.constructInitialPrompt([randomNode.title]);
        const generatedText = await this.callDigitalIntelligenceWithRetry(prompt);
        console.log('Generated Text:', generatedText);

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

    private static async reviewProposedChange(
        database: LibraryDatabase,
        commands: any[],
        originalTitle: string,
        libraryNodeId: string,
    ) {
        // Store how many reviewers accepted the change
        let acceptCount = 0;

        // Prompt the reviewers
        const reviewCount = 3;
        for(let i = 0; i < reviewCount; i++) {
            // Get the prompt
            const reviewerPrompt = PromptBuilder.constructReviewerPrompt(commands, originalTitle);

            // Get the response
            const response = await this.callDigitalIntelligenceWithRetry(reviewerPrompt);
            console.log('response:', response);

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
                    console.log('Decision:', responseObject.decision);

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
                database.createLibraryNodeProposalReview(libraryNodeId, 'System', decision, reason, metadata);
            }
        }

        return acceptCount === reviewCount;
    }

    private static applyChanges(database: LibraryDatabase, node: any, command: any) {
        // Node title update
        if(command.command === 'nodeTitleUpdate') {
            // Handle node title update
            if(node.title !== command.proposedTitle) {
                console.log(`Updating node title: "${node.title}" to "${command.proposedTitle}"`);

                let proposedTitle = command.proposedTitle;
                proposedTitle = proposedTitle.trim();

                // Replace all & with 'and'
                proposedTitle = proposedTitle.replace(/&/g, 'and');

                database.updateLibraryNodeTitle(node.title, proposedTitle, 'System');
            }
            else {
                console.log('Proposed title is identical to current title. No update needed.');
            }
        }
        // Node deletion
        else if(command.command === 'nodeDelete') {
            // Handle node deletion
            console.log(`Deleting node: "${node.title}"`);
            database.deleteLibraryNodeByTitle(node.title, 'System');
        }
    }

    private static async callDigitalIntelligenceWithRetry(prompt: string, retries = 3): Promise<string | null> {
        const apiKey = process.env.OPENAI_API_KEY;
        // const url = 'http://localhost:1234/v1/chat/completions';
        const url = 'http://10.10.100.1:1234/v1/chat/completions';

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
    private static validateCommand(command: any): boolean {
        return (
            command && command.command && (command.command === 'nodeTitleUpdate' || command.command === 'nodeDelete')
        );
    }

    // Assumes a JSON object with a single command in the generated text
    private static parseCommand(generatedText: string) {
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
    private static parseCommands(generatedText: string) {
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

    private static delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

// Export - Default
export default LibraryAgent;
