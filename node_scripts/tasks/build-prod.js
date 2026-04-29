import initSetup from '../helpers/initSetup.mjs';
import globalVars from '../helpers/globalVars.mjs';
import scss from '../scripts/scss/index.mjs';
import js from '../scripts/javascript.mjs';
import iconfont from '../scripts/iconfont/index.mjs';
import copyFiles from '../helpers/copyFiles.mjs';
import logger from '../helpers/logger.mjs';
import createWebConfig from '../scripts/web-config/index.mjs';
import hbs from '../scripts/handlebars/index.mjs';

// build all files for PRODUCTION
(async(initSetup, globalVars, scss, js, iconfont, copyFiles, logger, createWebConfig, hbs) => {
	try {
		if (!globalVars.isCorrectNodeVersion) {
			await initSetup.handleNodeVersion();
			return;
		}

		logger.startLog('build-prod', 'prod');

		await initSetup.resetEnv('production');
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

		if (globalVars.errorPage) {
			await createWebConfig();
		}
	} catch (error) {
		console.error('An error occurred:', error); // eslint-disable-line no-console
	} finally {
		if (globalVars.buildHasError) {
			logger.errorLog('build-prod', '?');
		} else {
			logger.finishLog('build-prod');
		}
	}
})(initSetup, globalVars, scss, js, iconfont, copyFiles, logger, createWebConfig, hbs);
