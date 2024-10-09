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
        { name: 'proposeTitleChanges', method: LibraryAgent.proposeTitleChanges, weight: 0 },
        { name: 'createArticleForNode', method: LibraryAgent.createArticleForNode, weight: 1 },
        // You can add more tasks here with their weights
    ];

    static async improveLibrary(database: LibraryDatabase) {
        try {
            // Select a task based on weights
            const task = this.selectTaskBasedOnWeight();
            if(task) {
                await task.method.call(this, database);
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
        const proposedChanges = await this.getProposedTitleChange(randomNode);

        if(!proposedChanges || proposedChanges.length === 0) {
            return;
        }

        // If the proposed changes include a delete, log the node title
        if(proposedChanges.some((change) => change.command === 'nodeDelete')) {
            console.log(`Proposed deletion of node: "${randomNode.title}"`);
        }

        // Step 3 - Review the proposed changes 3 times in parallel
        const isAccepted = await this.reviewProposedChange(proposedChanges, randomNode.title);

        // Step 4 - Handle accepted changes (update or delete node)
        if(isAccepted) {
            this.applyChanges(database, randomNode, proposedChanges);
        }

        return {
            commands: proposedChanges,
        };
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
    ): Promise<string | null> {
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
        const feedbacks = [];

        for(let i = 0; i < 3; i++) {
            const reviewerPrompt = PromptBuilder.constructArticleReviewPrompt(articleContent, originalTitle);

            const response = await this.callDigitalIntelligenceWithRetry(reviewerPrompt);
            reviewerResponses.push(response);
        }

        let acceptCount = 0;
        reviewerResponses.forEach((response) => {
            if(response) {
                const [decisionLine, ...feedbackLines] = response.split('\n');
                const decision = decisionLine.trim().toLowerCase();

                const feedback = feedbackLines.join('\n').trim();
                if(feedback) {
                    feedbacks.push(feedback);
                }

                if(decision.includes('accept')) {
                    acceptCount++;
                }
            }
        });

        return { isAccepted: acceptCount === 3, feedbacks };
    }

    private static async getProposedTitleChange(randomNode: any) {
        const prompt = PromptBuilder.constructInitialPrompt([randomNode.title]);
        const generatedText = await this.callDigitalIntelligenceWithRetry(prompt);

        if(!generatedText) {
            console.error('Failed to get a response for proposed changes.');
            return [];
        }

        const commands = this.parseCommands(generatedText);
        return commands;
    }

    private static async reviewProposedChange(commands: any[], originalTitle: string) {
        const reviewerResponses = [];
        for(let i = 0; i < 3; i++) {
            const reviewerPrompt = PromptBuilder.constructReviewerPrompt(commands, originalTitle);

            const response = await this.callDigitalIntelligenceWithRetry(reviewerPrompt);
            reviewerResponses.push(response);
        }

        let acceptCount = 0;
        reviewerResponses.forEach((response) => {
            if(response && response.toLowerCase().includes('accept')) {
                acceptCount++;
            }
        });

        return acceptCount === 3;
    }

    private static applyChanges(database: LibraryDatabase, node: any, commands: any[]) {
        commands.forEach((command) => {
            // Node title update
            if(command.command === 'nodeTitleUpdate') {
                // Handle node title update
                if(node.title !== command.newTitle) {
                    console.log(`Updating node title: "${node.title}" to "${command.newTitle}"`);

                    let newTitle = command.newTitle;
                    newTitle = newTitle.trim();

                    // Replace all & with 'and'
                    newTitle = newTitle.replace(/&/g, 'and');

                    database.updateLibraryNodeTitle(node.title, newTitle);
                }
                else {
                    console.log('Proposed title is identical to current title. No update needed.');
                }
            }
            // Node deletion
            else if(command.command === 'nodeDelete') {
                // Handle node deletion
                console.log(`Deleting node: "${node.title}"`);
                database.deleteLibraryNodeByTitle(node.title);
            }
        });
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
                    if(
                        !command.command ||
                        (command.command !== 'nodeTitleUpdate' && command.command !== 'nodeDelete') ||
                        (command.command === 'nodeTitleUpdate' && !command.newTitle)
                    ) {
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
