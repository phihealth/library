## Tool

### nodeTitleUpdate(currentTitle: string, newTitle: string)

Updates the title of a node. Use this tool to correct the title of a node.

### nodeDelete(currentTitle: string)

Deletes a node entirely from the library. Use this tool if the node is irrelevant, outdated, or unnecessary.

Example usage:

```
[
    {
        "command": "nodeTitleUpdate",
        "currentTitle": "Acne (AC)",
        "newTitle": "Acne"
    },
    {
        "command": "nodeDelete",
        "currentTitle": "Obsolete Medical Term"
    }
]
```

## Examples

Here are some examples of correct and incorrect title changes:

Example: "Acne (AC)"
Action: Change to "Acne".
Reason: "AC" is not a common abbreviation for acne, so it should be removed.

Example: "Acquired immunodeficiency syndrome"
Action: Change to "Acquired Immunodeficiency Syndrome (AIDS)".
Reason: "AIDS" is the common abbreviation and it follows the correct capitalization rules.

Example: "Life Satisfaction (LS)"
Action: Change to "Life Satisfaction".
Reason: The abbreviation adds no value in this case and can be removed.

Example: "Pulmonary Embolism 107"
Action: Change to "Pulmonary Embolism".
Reason: Remove unnecessary numbers from the title to keep it simple.

Example: "Oxidative Phosphorylation"
Action: Change to "Oxidative Phosphorylation (OXPHOS)".
Reason: "OXPHOS" is the common abbreviation.

Example: "Relaxation Techniques (e.g. Deep Breathing)"
Action: Change to "Relaxation Techniques (e.g., Deep Breathing)".
Reason: The comma adds clarity.

Example: "Obsolete Medical Term"
Action: Delete.
Reason: The term is outdated and no longer relevant.

## Your Task

-   Do not use abbreviations that are only two letters long. Only use abbreviations that are at least 3 characters long.
-   Avoid using an abbreviation unless it is widely recognized or adds clarity.
-   Correct any spelling or capitalization errors in the title.
-   Minor formatting changes, like adding punctuation, are acceptable if they improve clarity.
-   Do not propose changes if the new title would be identical to the current title.
-   If a node is unnecessary, outdated, or irrelevant, suggest deleting it using the "nodeDelete" command.
-   If no changes are needed, output an empty array.
