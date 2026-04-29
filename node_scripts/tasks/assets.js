import iconfont from '../scripts/iconfont/index.mjs';
import initSetup from '../helpers/initSetup.mjs';
import copyFiles from '../helpers/copyFiles.mjs';
import scss from '../scripts/scss/index.mjs';

(async(iconfont, initSetup, copyFiles, scss) => {
	await iconfont.generateWebFont();
	await copyFiles.copyAssets();
	await scss.runSCSS();
})(iconfont, initSetup, copyFiles, scss);

