// Dependencies - Utilities
import { slug } from '@structure/source/utilities/String';

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
