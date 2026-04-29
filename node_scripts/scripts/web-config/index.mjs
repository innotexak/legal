import fs from 'fs-extra';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import globalVars from '../../helpers/globalVars.mjs';
import paths from '../../helpers/paths.mjs';
import logger from '../../helpers/logger.mjs';
/*----------------------------------------------------------------------------------------------
	Create/Read/Update Files
 ----------------------------------------------------------------------------------------------*/

const createWebConfig = () => {
	Array.prototype.insert = function(index, item) {
		this.splice(index, 0, item);
	};

	logger.startLog('web-config', 'web-config');
	return new Promise(res => {
		const temp = 'web-config.txt';
		const filename = 'web.config';
		const readDir = path.join(dirname(fileURLToPath(import.meta.url)), `${temp}`);
		const writeDir = `${paths.dist}/${filename}`;
		const files = fs.readdirSync(path.join(paths.html, '/templates/'));
		files.forEach(file => {
			if (file === globalVars.errorPage) {
				fs.readFile(readDir, 'utf8', (err, data) => {
					if (!err) {
						const output = data.replace(new RegExp(`@{page}`, 'g'), globalVars.errorPage); // eslint-disable-line
						fs.writeFileSync(writeDir, output);
					} else {
						console.error('ERROR: ', err); // eslint-disable-line no-console
					}
				});
				res();
				logger.finishLog('web-config');
			}
		});
	});
};

export default createWebConfig;
