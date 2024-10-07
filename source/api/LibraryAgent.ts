// Dependencies - API
import { LibraryDatabase } from '@project/source/api/LibraryDatabase';

// Dependencies - Utilities
import { slug } from '@structure/source/utilities/String';

// Class - LibraryAgent
export class LibraryAgent {
    static async improveLibrary(database: LibraryDatabase) {
        // Get a random node and its relationships
        const randomLibraryNode = database.getRandomLibraryNode();

        console.log('\n\n\n');
        console.log('Current node: ', randomLibraryNode.title);

        const prompt = `May we ask for your help in maintaining and expanding our health concepts graph?

## Current Node

${JSON.stringify(randomLibraryNode, null, 4)}

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

        const commands = generatedText.split('\n').reduce(function (accumulator: string[], command: string) {
            let commandString = command.trim();

            // Only add commands that end with a closing parenthesis
            if(commandString && commandString.endsWith(')')) {
                accumulator.push(commandString);
            }
            else {
                console.log('Skipping command:', commandString);
            }

            return accumulator;
        }, []);

        // Execute the commands
        try {
            for(const command of commands) {
                // console.log('command', command);

                // Parse the command

                // Split the command at the first opening parenthesis
                // Do not use split('(') because the function arguments may contain parentheses
                const firstParenthesisIndex = command.indexOf('(');
                const commandParts = [
                    command.substring(0, firstParenthesisIndex),
                    command.substring(firstParenthesisIndex + 1),
                ];

                // Function name is the first part
                const functionName = commandParts[0].trim();

                // Function arguments are the second part
                let functionArgumentsString = commandParts[1];
                functionArgumentsString = functionArgumentsString.trim();
                functionArgumentsString = functionArgumentsString.substring(0, functionArgumentsString.length - 1);

                const functionArguments = functionArgumentsString.split(',').map(function (argument: string) {
                    let argumentString = argument.trim();

                    // Remove quotes
                    argumentString = argumentString.replace(/^"|"$/g, '');

                    // Remove single quotes
                    argumentString = argumentString.replace(/^'|'$/g, '');

                    if(argumentString.startsWith("'")) {
                        argumentString = argumentString.replace("'", '');
                    }
                    if(argumentString.startsWith('sourceNodeTitle: "')) {
                        argumentString = argumentString.replace('sourceNodeTitle: "', '');
                    }
                    if(argumentString.startsWith('targetNodeTitle: "')) {
                        argumentString = argumentString.replace('targetNodeTitle: "', '');
                    }
                    if(argumentString.startsWith('relationshipType: "')) {
                        argumentString = argumentString.replace('relationshipType: "', '');
                    }
                    if(argumentString.startsWith('confidence: "')) {
                        argumentString = argumentString.replace('confidence: "', '');
                    }

                    argumentString = argumentString.trim();

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

                    if(
                        !sourceNodeTitle ||
                        !relationshipType ||
                        !targetNodeTitle ||
                        !confidence ||
                        sourceNodeTitle.startsWith('(') ||
                        targetNodeTitle.startsWith('(')
                    ) {
                        console.error('Invalid arguments for nodeRelationshipCreate ---');
                        console.log('command ---');
                        console.log(command);
                        console.log('functionArguments ---');
                        console.log(functionArguments);
                        console.log('------------------------');
                        continue;
                    }

                    // Get or create the source node
                    // console.log('sourceNodeTitle', sourceNodeTitle);
                    const sourceNode = database.getOrCreateLibraryNodeByTitle(sourceNodeTitle);
                    // console.log('sourceNode', sourceNode);

                    // Get or create the target node
                    // console.log('targetNodeTitle', targetNodeTitle);
                    const targetNode = database.getOrCreateLibraryNodeByTitle(targetNodeTitle);
                    // console.log('targetNode', targetNode);

                    // Get or create the relationship type

                    // Create the relationship
                }
            }
        }
        catch(error) {
            console.error('Error generating graph:', error);
            console.log('GENERATED TEXT ---------------------');
            console.log(generatedText);
            console.log('------------------------------------');
        }

        return {
            commands: commands,
        };
    }
}

// Export - Default
export default LibraryAgent;
