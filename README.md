# Wrap Log

The `wrap-stuff` extension enhances your debugging experience by automatically '

- wrapping your selected code in a `console.log` statement if you're working in JavaScript, or a `var_dump` statement if you're working in PHP. It also removes any quotes in the name of the selected variable. If no text is selected, it creates an empty log statement with the cursor positioned inside the quotes.
- included is a template-literals wrap that wraps the \`selection\` with template-literals \`. If no text is selected, it inserts empty template literals and places your cursor between them.
- included is a code-block wrap that wraps the \`\`\`selection\`\`\` with markdown code blocks. If no text is selected, it creates an empty code block and places your cursor inside it.

## Known Issues

Currently, there are no known issues with the `wrap-stuff` extension. If you encounter any problems, please open an issue on the [GitHub repository](https://github.com/ronnyalex/log-wrap/issues).

## Release Notes

### 0.0.10

- Added feature to create empty template literals when no text is selected
- Added feature to create empty code blocks when no text is selected
- Added feature to create empty console.log statements when no text is selected

### 0.0.9

Initial release of `wrap-stuff`.
