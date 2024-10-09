// Dependencies - Prompts
import ToolPrompt from './ToolPrompt.md';

// Class - PromptBuilder
export class PromptBuilder {
    static getGuidelines() {
        return ToolPrompt;
    }

    static constructInitialPrompt(titles: string[]) {
        return `May we ask for your help in maintaining and expanding our health concepts graph?

${this.getGuidelines()}

## Important Notes

- Ensure that abbreviations are not two letters long. Only abbreviations that are 3 characters or longer should be used.
- If the abbreviation doesn't add clarity or is not widely recognized, it should be omitted.
- Focus on correcting misspellings and ensuring consistent capitalization.
- Minor formatting changes like adding commas are acceptable for clarity, but avoid unnecessary stylistic changes.
- If a node is unnecessary, outdated, or irrelevant, suggest deleting it using the "nodeDelete" command.

## Current Nodes

These nodes are randomly selected from the library for you to review:

${JSON.stringify(titles, null, 4)}
`;
    }

    static constructReviewerPrompt(commands: any[], originalTitle: string) {
        return `We need your help to review a proposed change for our health concepts graph.

${this.getGuidelines()}

## Proposed Change

Original Title: "${originalTitle}"

Proposed Change:

\`\`\`
${JSON.stringify(commands, null, 4)}
\`\`\`

Do you accept this change? Answer with "Accept" or "Reject" and provide a brief reason. Make sure to evaluate if the node should be updated, deleted, or left unchanged.`;
    }

    static constructArticlePrompt(title: string, feedbackList: string[]): string {
        let feedbackSection = '';
        if(feedbackList && feedbackList.length > 0) {
            feedbackSection = `

Please consider the following feedback while writing the article:
${feedbackList.map((feedback, index) => `Feedback ${index + 1}: ${feedback}`).join('\n')}
`;
        }

        return `Please write a comprehensive article in markdown about "${title}". The article should be informative, well-structured, and suitable for inclusion in our library.${feedbackSection}`;
    }

    static constructArticleReviewPrompt(articleContent: string, originalTitle: string): string {
        return `Please review the following article for accuracy, relevance, and quality. Decide whether to accept or reject it for inclusion in the library under the title "${originalTitle}". Provide your decision as "Accept" or "Reject" on the first line, followed by any specific feedback on how to improve the article in subsequent lines.

Article Content:
${articleContent}`;
    }
}

// Export - Default
export default PromptBuilder;
