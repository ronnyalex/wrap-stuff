# Development Guide for wrap-stuff

This document provides guidelines for developing and maintaining the `wrap-stuff` extension.

## Development Workflow

### Making Changes

1. Clone the repository
2. Make your code changes
3. Test your changes locally
   - always bump the version number in `package.json`
   - `vsce package`
   - `code --install-extension wrap-stuff-0.0.9.vsix`
   - Reload vscode
4. Update documentation if necessary

### Version Management

package.json

```json
{
  "name": "wrap-stuff",
  "displayName": "wrap-stuff",
  "description": "...",
  "version": "0.0.10", // Bump this number
  ...
}
```

README.md

```json
{
...
## Release Notes

### 0.0.9 // Bump this number
  ...
}
```

Follow [Semantic Versioning](https://semver.org/) principles:

- PATCH version (0.0.x) for backwards-compatible bug fixes
- MINOR version (0.x.0) for new functionality in a backwards-compatible manner
- MAJOR version (x.0.0) for incompatible API changes

### Packaging and Publishing

To package the extension:

```bash
vsce package
```

This will create a `.vsix` file that can be installed in VS Code.

To publish the extension:

```bash
vsce publish
```

Remember to always:

1. Bump the version in `package.json` first
2. Update the CHANGELOG.md with your changes
3. Test the extension thoroughly before publishing

## Feature Ideas and Roadmap

- Support for additional programming languages
- Customizable wrapping templates
- More keyboard shortcuts for improved efficiency
- Integration with popular testing frameworks

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request with your improvements or bug fixes.

## Debugging Tips

To debug the extension:

1. Press F5 in VS Code with the project open
2. This will launch a new Extension Development Host window
3. In this window, you can test your extension and set breakpoints

Remember to check the Developer Tools console (Help > Toggle Developer Tools) for any runtime errors.
