import createFiles from '../scripts/createFiles/index.mjs';
import globalVars from '../helpers/globalVars.mjs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
const argv = yargs(hideBin(process.argv)).parse();

((createFiles, globalVars, argv) => {
	switch (true) {
		case argv.t && typeof argv.t === 'string':
			// create template HBS and JSON files
			createFiles.createFile(argv.t.toLowerCase(), 'template');
			break;
		case argv.m && typeof argv.m === 'string':
			// create module HBS and JSON files
			createFiles.createFile(argv.m.toLowerCase(), 'module');
			break;
		case argv.i && typeof argv.i === 'string':
			// create item HBS and JSON files
			createFiles.createFile(argv.i.toLowerCase(), 'item');
			break;
		default:
			globalVars.logMSG(globalVars.warningTemp, 'ERROR: no parameters were passed');
	}
})(createFiles, globalVars, argv);
