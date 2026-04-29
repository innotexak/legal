import initSetup from '../helpers/initSetup.mjs';
import globalVars from '../helpers/globalVars.mjs';
import scss from '../scripts/scss/index.mjs';
import js from '../scripts/javascript.mjs';
import iconfont from '../scripts/iconfont/index.mjs';
import copyFiles from '../helpers/copyFiles.mjs';
import hbs from '../scripts/handlebars/index.mjs';
import logger from '../helpers/logger.mjs';

// build all files for DEVELOPMENT
(async(initSetup, globalVars, scss, js, iconfont, copyFiles, hbs, logger) => {
	try {
		if (!globalVars.isCorrectNodeVersion) {
			await initSetup.handleNodeVersion();
			return;
		}

		logger.startLog('develop', 'build-dev');

		await initSetup.resetEnv('development');
		await iconfont.generateWebFont();

		await Promise.all([
			copyFiles.copyAssets(),
			copyFiles.copyFavicon(),
		]);

		await Promise.all([
			scss.runSCSS(),
			js.webpack(),
			hbs.processHandlebarsFiles()
		]);
	} catch (error) {
		console.error('An error occurred:', error); // eslint-disable-line no-console
	} finally {
		if (globalVars.buildHasError) {
			logger.errorLog('develop', '?');
		} else {
			logger.finishLog('develop');
		}
	}
})(initSetup, globalVars, scss, js, iconfont, copyFiles, hbs, logger);
