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
			handle( 'name')
		)
	  );

}

function handle(type) {



	new Promise((resolve, reject) => {
		let languageId = currentEditor.document.languageId;

		let funcName = languageId === 'php' ? 'dd' : 'console.log';
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
			};
			const semicolon = ';';
			if (type === 'nameValue') {
			if (wrapData.item.includes(',')) {
				const items = wrapData.item.split(',').map((item) => item.split(':')[0].split('?')[0].trim()).filter(i => i)
				wrapData.txt = '';
				for (const item of items) {
					wrapData.txt += funcName + "('".concat(item.replace(/['"]+/g, ''), "', ", item, ')', semicolon) + "\n" + ind;
				}
			} else {
				wrapData.txt = funcName + "('".concat(wrapData.item.replace(/['"]+/g, ''), "', ", wrapData.item, ')', semicolon);
			}
			} else if (type === 'name') {
				wrapData.txt = funcName + "('".concat(wrapData.item.replace(/['"]+/g, ''), "')", semicolon);
			}
			resolve(wrapData);
	  }
	})
	  .then((wrap) => {
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
