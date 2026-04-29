import fs from 'fs-extra';
import colors from './colors.mjs';

const globalVars = ((fs, colors) => {
	const nodeVersion = process.env.npm_package_engines_node;
	const currentVersion = process.version.replace('v', '');
	const isCorrectNodeVersion = nodeVersion >= currentVersion;
	const buildHasError = false;
	const userConfig = JSON.parse(fs.readFileSync('./config.json'));
	const reegExp = new RegExp('@{str}', 'g');

	const logMSG = (template, arg) => {
		fs.readFile(template, 'utf8', (err, data) => {
			if (err) {
				console.error(`${colors.red('ERROR: ')}`, err); // eslint-disable-line no-console
			} else {
				data = data.replace(reegExp, arg);
				console.log(data); // eslint-disable-line no-console
			}
		});
	};

	return {
		...userConfig,
		isCorrectNodeVersion,
		buildHasError,
		logMSG
	};

})(fs, colors);

export default globalVars;
