// Dependencies - Prompts
import ToolPrompt from './ToolPrompt.md';

// Dependencies - API
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
import { LibraryAgent } from '@project/source/api/LibraryAgent';

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

    static constructArticlePrompt(
        title: string,
        articleObject?: ReturnType<typeof LibraryAgent.parseGeneratedArticle> | null,
        libraryPostVersionReviews?: LibraryPostVersionReviewInterface[],
    ): string {
        let feedbackSection = '';
        if(libraryPostVersionReviews && libraryPostVersionReviews.length > 0) {
            feedbackSection = `
**Important: Carefully review and fully address the following feedback in your revision. Failure to do so will result in rejection of the article.**

${libraryPostVersionReviews
    .map((libraryPostVersionReview, index) => `Feedback ${index + 1}:\n${libraryPostVersionReview.review}`)
    .join('\n\n')}
`;
        }

        let previousArticleSection = '';
        if(articleObject) {
            previousArticleSection = `
**Previous Article Content for Reference:**

Title: ${articleObject.title}

Subtitle: ${articleObject.subtitle}

Description: ${articleObject.description}

Content:
${articleObject.content}

---
`;
        }

        const newArticleStatement = `Your task is to **create a new, high-quality article** titled "${title}".`;
        const reviseArticleStatement = `Your task is to **revise and significantly improve** the article titled "${title}" by fully incorporating the feedback provided.`;

        const yourTask = articleObject && articleObject.content ? reviseArticleStatement : newArticleStatement;

        return `You are an expert health writer contributing to our comprehensive health library. ${yourTask} The article should be clear, concise, and informative.

**Target Audience:**
Think deeply about the most likely persona of the reader interested in the content. This is who you are writing for. Empathize with their needs and knowledge level. Incorporate appropriate references pop culture. Tailor the content to be engaging and informative for them.

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

Your response must be structured as follows:

ARTICLE_TITLE_START
The Article Title
ARTICLE_TITLE_END

ARTICLE_SUBTITLE_START
The Article Subtitle
ARTICLE_SUBTITLE_END

FEEDBACK_RESPONSE_START
A brief summary (in 3-4 bullet points) of how you have addressed the feedback.
FEEDBACK_RESPONSE_END

ARTICLE_CONTENT_START
The article content goes here in markdown format. Do not include the title or subtitle again. Be sure to use markdown, which is helpful for headings and lists where appropriate.
ARTICLE_CONTENT_END

ARTICLE_SUMMARY_START
One to two sentences summarizing the article.
ARTICLE_SUMMARY_END

Please begin.`;
    }

    static constructArticleReviewPrompt(
        libraryPostVersion: LibraryPostVersionInterface,
        libraryNodeTyle: string,
    ): string {
        return `You are a senior health editor for our comprehensive health library. Please review the following article about the topic "${libraryNodeTyle}" for adherence to our guidelines.

**Instructions:**

- Begin your review with your **Decision**: State "Accept" if the article meets the guidelines, or "Revise" if it requires further improvement.
- If you choose "Revise," provide **Top Most Important Suggestions** for improvement. Include one, two, or three suggestions.
- Your feedback should be specific, actionable, and aimed at helping the author enhance the article.
- Focus on significant issues that impact the clarity, accuracy, and usefulness of the article.
- Ensure the article conforms to the length target of 300-500 words.
- Make sure the article content is written in markdown.
- Do **not** comment on minor grammatical or stylistic issues unless they significantly affect comprehension.
- Do **not** penalize the author for not including visual aids, as they will be provided by the design team.
- Do **not** penalize the author for not including citations or statistics.

---

**Article Content:**

Title: ${libraryPostVersion.title}
Subtitle: ${libraryPostVersion.subtitle}
Summary: ${libraryPostVersion.description}
Content:
${libraryPostVersion.content}`;
    }
}

// Export - Default
export default PromptBuilder;
