const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */


var currentEditor

function activate(context) {
	currentEditor = vscode.window.activeTextEditor;
	vscode.window.onDidChangeActiveTextEditor((editor) => (currentEditor = editor));

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('log.wrap',()=>
			handle('nameValue')
		)
	);
	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('log.wrap.name',()=>
			handle('name')
		)
	);
	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('template.literal.wrap',()=>
			handle('literal')
		)
	);
	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('code.block.wrap',()=>
			handle('codeblock')
		)
	);

	// Add new command for converting to template string
	context.subscriptions.push(
		vscode.commands.registerCommand('codeblock.convert.to.template.string', () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showInformationMessage(
					"Open a file to convert strings to template strings."
				);
				return;
			}

			const document = editor.document;
			const selections = editor.selections;

			editor.edit((editBuilder) => {
				selections.forEach((selection) => {
					const range = getEnclosingStringRange(document, selection.active);
					if (range) {
						const text = document.getText(range);
						// Convert the string into a template string by replacing quotes with backticks.
						const newText = text.replace(/^(['"])(.*)\1$/, "`$2`");
						editBuilder.replace(range, newText);
						vscode.window.showInformationMessage(
							"Formatted to template string literal"
						);
					}
				});
			});
		})
	);
}

/**
 * Get the range of the string that encloses the cursor position
 * @param {vscode.TextDocument} document - The current document
 * @param {vscode.Position} position - The current cursor position
 * @returns {vscode.Range|null} - The range of the enclosing string, or null if not found
 */
function getEnclosingStringRange(document, position) {
	const lineText = document.lineAt(position.line).text;
	let startQuotePos = -1;
	let endQuotePos = -1;
	let quoteChar = '';

	// Look backward from the cursor for the start quote
	for (let i = position.character - 1; i >= 0; i--) {
		if (lineText[i] === '"' || lineText[i] === "'") {
			startQuotePos = i;
			quoteChar = lineText[i];
			break;
		}
	}

	// Look forward from the cursor for the end quote of the same type
	for (let i = position.character; i < lineText.length; i++) {
		if (lineText[i] === quoteChar) {
			endQuotePos = i;
			break;
		}
	}

	if (startQuotePos !== -1 && endQuotePos !== -1 && quoteChar) {
		// Create a range that includes the quotes
		return new vscode.Range(position.line, startQuotePos, position.line, endQuotePos + 1);
	}

	return null;
}

function handle(type) {
	new Promise((resolve, reject) => {
		let languageId = currentEditor.document.languageId;
		let funcName = languageId === 'php' ? 'dump' : 'console.log';
	 	let sel = currentEditor.selection;
		let len = sel.end.character - sel.start.character;

		let ran =
			len == 0
			? currentEditor.document.getWordRangeAtPosition(sel.anchor)
			: new vscode.Range(sel.start, sel.end);

		// Allow all types to proceed even without a selection/word
		let doc = currentEditor.document;
		let lineNumber = ran ? ran.start.line : sel.active.line;
		let item = ran ? doc.getText(ran) : '';
		let cursorPosition = sel.active;

		let idx = doc.lineAt(lineNumber).firstNonWhitespaceCharacterIndex;
		let ind = doc.lineAt(lineNumber).text.substring(0, idx);
		let wrapData = {
			txt: 'console.log',
			item: item,
			doc: doc,
			ran: ran || new vscode.Range(cursorPosition, cursorPosition), // Use cursor position if no range
			idx: idx,
			ind: ind,
			line: lineNumber,
			sel: sel,
			cursorPosition: cursorPosition,
			lastLine: doc.lineCount - 1 == lineNumber,
			type: type,
			isEmpty: ran == undefined // Flag to indicate if we're dealing with an empty selection/no word
		};
		const semicolon = ';';

		if (type === 'nameValue') {
			if (wrapData.isEmpty) {
				wrapData.txt = funcName + "('')" + semicolon; // Empty console.log
				wrapData.emptyLogStatement = true;
			} else {
				wrapData.txt = funcName + "('".concat(wrapData.item.replace(/['"]+/g, ''), "', ", wrapData.item, ')', semicolon);
			}
		} else if (type === 'name') {
			if (wrapData.isEmpty) {
				wrapData.txt = funcName + "('')" + semicolon; // Empty console.log
				wrapData.emptyLogStatement = true;
			} else {
				wrapData.txt = funcName + "('".concat(wrapData.item.replace(/['"]+/g, ''), "')", semicolon);
			}
		} else if (type === 'literal') {
			// For literal type, check if we have a selection/word
			if (wrapData.isEmpty) {
				wrapData.txt = '``'; // Empty template literal
			} else {
				wrapData.txt = '`' + item + '`';
			}
		} else if (type === 'codeblock') {
			// For code block, wrap with triple backticks and add new lines
			if (wrapData.isEmpty) {
				wrapData.txt = '```\n\n```'; // Empty code block with a blank line between backticks
			} else {
				wrapData.txt = '```\n' + item + '\n```';
			}
		}
		resolve(wrapData);
	})
	.then((wrap) => {
		if (wrap.type === 'literal' || wrap.type === 'codeblock') {
			// For literal type and code block, replace the selection with wrapped text
			let startPos = wrap.ran.start;
			let finalText = wrap.txt;

			currentEditor.edit(editBuilder => {
				editBuilder.replace(wrap.ran, finalText);
			}).then(() => {
				// Using setTimeout to ensure the edit is fully applied
				setTimeout(() => {
					if (wrap.type === 'literal' && wrap.isEmpty) {
						// For empty template literals, place cursor between the backticks
						let cursorPos = new vscode.Position(startPos.line, startPos.character + 1);
						currentEditor.selection = new vscode.Selection(cursorPos, cursorPos);
					} else if (wrap.type === 'codeblock' && wrap.isEmpty) {
						// For empty code blocks, place cursor on the blank line between backticks
						let cursorPos = new vscode.Position(startPos.line + 1, 0);
						currentEditor.selection = new vscode.Selection(cursorPos, cursorPos);
					} else {
						// Create a range from the start position to start + length of the wrapped text
						let startPosition = new vscode.Position(startPos.line, startPos.character);
						let endPosition = new vscode.Position(
							// For multiline text (like codeblocks with newlines), we need to calculate the end line
							startPos.line + (finalText.match(/\n/g) || []).length,
							// If we're on the last line, use the remaining text length after the last newline
							// otherwise for first line, use the full start position + text length
							finalText.includes('\n')
								? finalText.substring(finalText.lastIndexOf('\n') + 1).length
								: startPos.character + finalText.length
						);

						// Set the selection to cover the entire wrapped text
						currentEditor.selection = new vscode.Selection(startPosition, endPosition);
					}
				}, 50);
			});
		} else {
			// For log wrap types (nameValue and name)
			if (wrap.isEmpty && wrap.emptyLogStatement) {
				// For empty log statements, insert inline and position cursor inside quotes
				let startPos = wrap.ran.start;
				let finalText = wrap.txt;

				currentEditor.edit(editBuilder => {
					editBuilder.replace(wrap.ran, finalText);
				}).then(() => {
					// Using setTimeout to ensure the edit is fully applied
					setTimeout(() => {
						 // Find the position of the first single quote in the text
						let firstQuotePos = finalText.indexOf("'");

						// Position cursor between the quotes (after first quote)
						let cursorPos = new vscode.Position(
							startPos.line,
							startPos.character + firstQuotePos + 1
						);
						currentEditor.selection = new vscode.Selection(cursorPos, cursorPos);
					}, 50);
				});
			} else {
				// For regular log statements with selection/word, add on a new line
				let nxtLine
				let nxtLineInd
				if (!wrap.lastLine) {
					nxtLine = wrap.doc.lineAt(wrap.line + 1);
					nxtLineInd = nxtLine.text.substring(0, nxtLine.firstNonWhitespaceCharacterIndex);
				} else {
					nxtLineInd = '';
				}
				currentEditor
					.edit((e) => {
						e.insert(
							new vscode.Position(
								wrap.line,
								wrap.doc.lineAt(wrap.line).range.end.character
							),
							'\n'.concat(nxtLineInd > wrap.ind ? nxtLineInd : wrap.ind, wrap.txt)
						);
					})
					.then(() => {
						currentEditor.selection = wrap.sel;
					});
			}
		}
	})
	.catch((message) => {
	});
  }



// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
