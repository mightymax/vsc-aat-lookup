/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import axios from 'axios';
import getESQuerySearch from './getESQuerySearch';
import getESQueryTerm from './getESQueryTerm';

interface FirstHit {
  0: string;
}

interface QueryResponse {
	hits: {
		total: { value: number},
		hits: {
			_id: string,
			_score: number,
			fields: {
				"http://www w3 org/2008/05/skos-xl#literalForm": FirstHit,
				"http://purl org/dc/terms/language": FirstHit,
			}
		}[]
	}
}
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "aat-lookup" is now active!');

	let queryResponseSearch: QueryResponse;

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('aat-lookup.lookup', () => {
		const searchResults = vscode.window.createQuickPick();

		const settings: undefined | { usePrefixer: boolean, addTermLabel: boolean } = vscode.workspace.getConfiguration().get('conf.settingsEditor.aatLookupSettingsOutput');
		const api: string = vscode.workspace.getConfiguration().get('conf.settingsEditor.aatLookupSettingsApi') ?? 'https://triplydb.com/_api/datasets/getty/aat/services/aat-text-search/elasticsearch';

		searchResults.onDidChangeSelection(selection => {
			searchResults.dispose();
			if (selection[0].label !== undefined) {
				const hit = queryResponseSearch.hits.hits.filter(hit => hit.fields['http://www w3 org/2008/05/skos-xl#literalForm'][0] === selection[0].label)[0];
				if (!hit) {
					vscode.window.showErrorMessage(`Failed to find '${selection[0].label}' in search results.`);
					return;
				}
				axios.post(api, getESQueryTerm(hit._id))
				.then(r => r.data as QueryResponse)
				.then(results => {
					if (results.hits.hits.length === 0) {
						vscode.window.showErrorMessage(`Failed to find '${hit._id}' in search results.`);
						return;
					}
					let snippet = ''
					if (settings?.usePrefixer ?? true) {
						snippet = `prefixer.aat('${results.hits.hits[0]._id.replace(/.+\/(\d+)$/, '$1')}') ;`;
					} else {
						snippet = results.hits.hits[0]._id;
					}
					
					if (settings?.addTermLabel ?? true) {
						snippet += ` // ${selection[0].label}`;
					}

					vscode.window.showInformationMessage(snippet);
				}).catch(e => {
					vscode.window.showErrorMessage((e as Error).message);
				});
			}
		});
		searchResults.onDidHide(() => searchResults.dispose());

		vscode.window.showInputBox({
			prompt: "Type a search term:"
		}).then(term => {
			if (!term) {
				return Promise.resolve([]);
			}
			axios.post(api, getESQuerySearch(term))
				.then(r => r.data as QueryResponse)
				.then(results => {
					queryResponseSearch = results;
					if (results.hits.hits.length === 0) {
						vscode.window.showErrorMessage(`"${term}": not found`);
						return Promise.resolve([]);
					}
					searchResults.items = queryResponseSearch.hits.hits.map(result => {
						return {
							detail: `lang: ${result.fields['http://purl org/dc/terms/language'][0].replace('http://vocab.getty.edu/language/', '')}, score: ${result._score}, id label: ${result._id.replace('http://vocab.getty.edu/aat/term/', '')}`, 
							label: result.fields['http://www w3 org/2008/05/skos-xl#literalForm'][0] 
						};
					});
					searchResults.show();
				});
		});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
