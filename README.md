## Markdown parser

### List of requirements
- We are going to create an application to parse markdown
- The user will type into a text area
- Every time the text area changes, we will parse the entire document again
- We will break the document down based on where the user presses the Enter key
- The opening characters will determine whether or not the line is markdown
- Entering # followed by a space is replaced by an H1 heading
- Entering ## followed by a space is replaced by an H2 heading
- Entering ### followed by a space is replaced by an H3 heading
- Entering --- is replaced by a horizontal rule
- If the line does not start with markdown, the line is treated as a paragraph
- The resulting HTML will be displayed in a label
- If the content in the markdown text area is empty, the label will contain an empty paragraph
- The layout will be done in Bootstrap and the content will stretch to 100% height