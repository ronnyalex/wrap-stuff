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

		if (ran == undefined) {
			reject('NO_WORD');
		} else {
			let doc = currentEditor.document;
			let lineNumber = ran.start.line;
			let item = doc.getText(ran);

			let idx = doc.lineAt(lineNumber).firstNonWhitespaceCharacterIndex;
			let ind = doc.lineAt(lineNumber).text.substring(0, idx);
			let wrapData = {
			txt: 'console.log',
			item: item,
			doc: doc,
			ran: ran,
			idx: idx,
			ind: ind,
			line: lineNumber,
			sel: sel,
			lastLine: doc.lineCount - 1 == lineNumber,
			type: type
			};
			const semicolon = ';';
			if (type === 'nameValue') {
				wrapData.txt = funcName + "('".concat(wrapData.item.replace(/['"]+/g, ''), "', ", wrapData.item, ')', semicolon);
			} else if (type === 'name') {
				wrapData.txt = funcName + "('".concat(wrapData.item.replace(/['"]+/g, ''), "')", semicolon);
			} else if (type === 'literal') {
				// For literal type, we'll handle it in the then block
				wrapData.txt = '`' + item + '`';
			} else if (type === 'codeblock') {
				// For code block, wrap with triple backticks and add new lines
				wrapData.txt = '```\n' + item + '\n```';
			}
			resolve(wrapData);
	  }
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
	          // Create a range from the start position to start + length of the wrapped text
	          let startPosition = new vscode.Position(startPos.line, startPos.character);
	          console.log('startPosition', startPosition);
	          let endPosition = new vscode.Position(
	            // For multiline text (like codeblocks with newlines), we need to calculate the end line
	            startPos.line + (finalText.match(/\n/g) || []).length,
	            // If we're on the last line, use the remaining text length after the last newline
	            // otherwise for first line, use the full start position + text length
	            finalText.includes('\n')
	              ? finalText.substring(finalText.lastIndexOf('\n') + 1).length
	              : startPos.character + finalText.length
	          );
	          console.log('endPosition', endPosition);

	          // Set the selection to cover the entire wrapped text
	          currentEditor.selection = new vscode.Selection(startPosition, endPosition);
	          console.log('selection set', currentEditor.selection);
	        }, 500);
	      });
	    } else {
	      // For other types, add the log statement on a new line
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
