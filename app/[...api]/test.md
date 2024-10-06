May we ask for your help in maintaining and expanding our health concepts graph?

## Current Node

{
"title": "Meditation",
"synonyms": "",
"inboundRelationships": [],
"outboundRelationships": []
}

## Available Tools

#### nodeCreate(title: string, synonyms: string[] = [])

Creates a new node with the specified title and synonyms.

#### nodeUpdateTitle(currentTitle: string, newTitle: string)

Updates the title of an existing node.

#### nodeAddSynonyms(nodeTitle: string, newSynonyms: string[])

Adds new synonyms to an existing node. Does not delete existing synonyms.

#### nodeRelationshipCreate(sourceNodeTitle: string, targetNodeTitle: string, relationshipType: string)

Creates a relationship between two nodes.

## Your Task

-   Use the tools to improve the graph based on the current node and relationships provided.
-   You can invoke multiple tools in a single response.

## Constraints

-   Limit your response to the tools' commands without additional explanations.
-   Output tool invocations separated by new lines.
