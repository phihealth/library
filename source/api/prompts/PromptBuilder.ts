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

## Current Node

This nodes is randomly selected from the library for you to review:

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

Do you accept this change? Reply with a JSON object. That conforms to this interface:

\`\`\`
{
    "decision": string;
    "reason": string;
}
\`\`\`

The decision string my be "Accept" or "Reject". The reason string should be a brief explanation of your decision.

Only output a valid JSON object. Do not include any additional text or comments.
`;
    }

    static constructArticlePrompt(title: string, previousArticleContent?: string, feedbackList?: string[]): string {
        let feedbackSection = '';
        if(feedbackList && feedbackList.length > 0) {
            feedbackSection = `
**Important: Carefully review and fully address the following feedback in your revision. Failure to do so will result in rejection of the article.**

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

        const newArticleStatement = `Your task is to **create a new, high-quality article** titled "${title}".`;
        const reviseArticleStatement = `Your task is to **revise and significantly improve** the article titled "${title}" by fully incorporating the feedback provided.`;

        const yourTask =
            previousArticleContent && previousArticleContent.length ? reviseArticleStatement : newArticleStatement;

        return `You are an expert health writer contributing to our comprehensive health library. ${yourTask} The article should be clear, concise, and informative, suitable for a broad audience interested in health topics.

**Target Audience:** General public seeking reliable health information.

${feedbackSection}

${previousArticleSection}

**Guidelines:**

- **Objective:** **Produce a final, high-quality article that fully addresses the feedback and meets all guidelines.**
- **Revision Limit:** **This is the final revision opportunity. Ensure all feedback is thoroughly addressed to produce a complete and polished article.**
- **Length:** **Aim for approximately 300-500 words.**
- **Structure:**
    - **Introduction:** Briefly introduce the topic and its relevance.
    - **Main Body:** Cover key aspects such as **history of the topic, causes/risk factors, symptoms, diagnosis, treatment options, prevention strategies, and what the future holds in store for the topic.**. Maintain a logical flow and clear focus on the main theme.
    - **Conclusion:** Summarize the main points or provide a final thought with a clear call to action if appropriate. If appropriate, include how learnings from topic can help positively impact the reader's healthspan, which is the length of time a person lives in good health.
- **Tone:** Maintain a **neutral, informative tone** throughout the article.
- **Language:** Use **clear and concise language**. Avoid medical jargon; if technical terms are necessary, provide simple explanations.
- **Style:**
    - **Organize content with headings and subheadings.**
    - **Use bullet points or numbered lists where appropriate.**
    - **Include relevant and specific examples or anecdotes** to illustrate key points and enhance relatability.
- **Formatting:** Use proper markdown formatting for headings, lists, and emphasis.
- **Citations:** Do **not** include citations or references.

**Note:** Focus on significant improvements that enhance clarity, depth, and usefulness of the article. Ensure conciseness by avoiding redundancies and overly complex sentences.

After completing the article, please provide a brief summary (in 3-4 bullet points) of how you have addressed the feedback.

Begin writing the revised article below.`;
    }

    static constructArticleReviewPrompt(articleContent: string, originalTitle: string): string {
        return `You are a senior health editor for our comprehensive health library. Please review the following article titled "${originalTitle}" for adherence to our guidelines.

**Instructions:**

- Begin your review with your **Decision**: State "Accept" if the article meets the guidelines, or "Revise" if it requires further improvement.
- If you choose "Revise," provide **Two Most Important Suggestions** for improvement.
- Your feedback should be specific, actionable, and aimed at helping the author enhance the article.
- Focus on significant issues that impact the clarity, accuracy, and usefulness of the article.
- Ensure the article conforms to the length target of 300-500 words.
- Do **not** comment on minor grammatical or stylistic issues unless they significantly affect comprehension.
- Do **not** penalize the author for not including visual aids, as they will be provided by the design team.
- Do **not** penalize the author for not including citations or statistics.

---

**Article Content:**

${articleContent}`;
    }
}

// Export - Default
export default PromptBuilder;
