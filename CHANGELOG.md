# Change Log

All notable changes to the "wrap-stuff" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.14] - 2023-XX-XX

### Added

- New command: "Convert to template string" (`codeblock.convert.to.template.string`) that converts a standard string to a template literal by detecting the enclosing quotes at the cursor position

## [0.0.10] - 2023-11-XX

### Added

- Empty template literals: When no text is selected, pressing the template literal wrap command now creates empty backticks with cursor between them
- Empty code blocks: When no text is selected, pressing the code block wrap command now creates an empty markdown code block with cursor positioned inside
- Empty console.log statements: When no text is selected, pressing the log wrap commands now creates an empty log statement with cursor positioned between quotes

### Fixed

- Cursor positioning for empty wrapping elements to improve typing experience
- Reduced timeout for cursor positioning from 500ms to 50ms for better responsiveness

## [0.0.9] - 2023-11-XX

### Added

- Initial release of wrap-stuff
- Support for console.log/var_dump wrapping with variable name
- Support for template literal wrapping
- Support for code block wrapping
