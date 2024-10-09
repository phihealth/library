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

    static constructArticlePrompt(title: string, previousArticleContent?: string, feedbackList?: string[]): string {
        let feedbackSection = '';
        if(feedbackList && feedbackList.length > 0) {
            feedbackSection = `
**Please carefully review and address the following feedback while revising the article:**
    
${feedbackList.map((feedback, index) => `Feedback ${index + 1}:\n${feedback}`).join('\n\n')}
`;
        }

        let previousArticleSection = '';
        if(previousArticleContent) {
            previousArticleSection = `
**Previous Article Content for Reference:**
    
${previousArticleContent}
    
---
`;
        }

        const newArticleStatement = `Your task is to create an article titled "${title}".`;
        const reviseArticleStatement = `Your task is to revise and improve the article titled "${title}" by effectively incorporating the feedback provided.`;

        const yourTask =
            previousArticleContent && previousArticleContent.length ? reviseArticleStatement : newArticleStatement;

        return `You are an expert health writer contributing to our comprehensive health library. ${yourTask} The article should be clear, concise, and informative, suitable for a broad audience interested in health topics.

${feedbackSection}

${previousArticleSection}

**Guidelines:**

- **Objective:** **Produce a final, high-quality article that fully addresses the feedback and meets all guidelines.**
- **Length:** **Aim for approximately 300-500 words.**
- **Structure:**
    - **Introduction:** Briefly introduce the topic and its relevance.
    - **Main Body:** Cover key aspects such as **causes/risk factors, symptoms, diagnosis, treatment options, and prevention strategies**.
    - **Conclusion:** Summarize the main points or provide a final thought.
- **Tone:** Maintain a **neutral, informative tone** throughout the article.
- **Language:** Use **clear and concise language**. Avoid medical jargon; if technical terms are necessary, provide simple explanations.
- **Style:**
    - **Organize content with headings and subheadings.**
    - **Use bullet points or numbered lists where appropriate.**
    - **Include relevant examples or analogies** to illustrate key points.
- **Formatting:** Use proper markdown formatting for headings, lists, and emphasis.
- **Citations:** Do **not** include citations or references.
- **Revision Limit:** **This is the final revision opportunity. Ensure all feedback is thoroughly addressed to produce a complete and polished article.**

After completing the article, please provide a brief summary (in 3-4 bullet points) of how you have addressed the feedback.

Begin writing the revised article below.`;
    }

    static constructArticleReviewPrompt(articleContent: string, originalTitle: string): string {
        return `You are a senior health editor for our comprehensive health library. Please review the following article titled "${originalTitle}" for adherence to our guidelines.

**Instructions:**

- Begin your review with your **Decision**: State "Accept" if the article meets the guidelines, or "Revise" if it requires further improvement.
- If you choose "Revise," provide a prioritized list of the **Top 3-5 Most Important Suggestions** for improvement.
- Your feedback should be specific, actionable, and aimed at helping the author enhance the article.
- Focus on significant issues that impact the clarity, accuracy, and usefulness of the article.
- Make sure the article conforms to the length target of 300-500 words.
- Do **not** comment on minor grammatical or stylistic issues unless they significantly affect comprehension.
- Do **not** penalize the author for not including visual aids, as they will be provided by the design team.
- Do **not** penalize the author for not including citations.

---

**Article Content:**

${articleContent}`;
    }
}

// Export - Default
export default PromptBuilder;
