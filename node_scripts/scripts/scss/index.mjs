import * as sass from 'sass';
import path from 'path';
import fs from 'fs-extra';
import autoprefixer from 'autoprefixer';
import flexBugsFix from 'postcss-flexbugs-fixes';
import mergeMedia from 'postcss-sort-media-queries';
import postcss from 'postcss';
import stylelint from 'stylelint';
import colors from '../../helpers/colors.mjs';
import logger from '../../helpers/logger.mjs';
import paths from '../../helpers/paths.mjs';
import globalVars from '../../helpers/globalVars.mjs';
import initSetup from '../../helpers/initSetup.mjs';

const scss = ((sass, path, fs, autoprefixer, flexBugsFix, mergeMedia, postcss, stylelint, colors, logger, paths, globalVars, initSetup) => {

	const compileFile = async(file, outputFolder) => {
		const isSourceMap = !file.includes('rte') && globalVars.mode !== 'production';
		let outputFile = file.replace('scss', 'min.css');

		let resultOptions = {
			sourceMap: isSourceMap,
			style: globalVars.mode !== 'development' ? 'compressed' : 'expanded',
		};

		if (file.includes('rte')) {
			resultOptions = {
				style: 'expanded',
			};
			outputFile = file.replace('scss', 'css');
		}

		const output = path.join(outputFolder, outputFile);
		let sourceMapComment = '';
		const result = sass.compile(path.join(paths.scss, file), resultOptions);

		if (isSourceMap) {
			const sourceMapString = JSON.stringify(result.sourceMap);
			const sourceMapBase64 = Buffer.from(sourceMapString, 'utf8').toString('base64');
			sourceMapComment = `/*# sourceMappingURL=data:application/json;charset=utf-8;base64,${sourceMapBase64} */`;
		}

		const css = result.css.toString() + '\n'.repeat(2) + sourceMapComment;

		const postcssPlugins = [autoprefixer({ flexbox: false }), flexBugsFix, mergeMedia];
		const postcssOptions = { from: undefined };

		const { css: postCssResult } = await postcss(postcssPlugins).process(css, postcssOptions);

		fs.writeFile(output, postCssResult, err => {
			if (err) {
				console.log(err); // eslint-disable-line no-console
			}
			logger.finishLog('css-c');
		});

	};

	const compileSCSS = async() => {
		logger.startLog('css-c', 'css-compile');
		const filePath = path.join(paths.scss, '/base/_icon-font.scss');
		const allScssFiles = fs.readdirSync('./src/scss/', { withFileTypes: true })
			.filter(item => !item.isDirectory()).map(item => item.name);
		const outputFolder = path.join(paths.dist, 'css');

		initSetup.makeFolderIfMissing(outputFolder);
		fs.closeSync(fs.openSync(filePath, 'a'));

		try {
			allScssFiles.forEach(async file => {
				compileFile(file, outputFolder);
			});
		} catch (err) {
			logger.errorLog('css-c', 'scss compile failed');
			const filePath = path.resolve(paths.root, '');
			const trimmedPath = filePath.replace(path.resolve(paths.scss), 'scss');

			console.error(`\nmessage: ${colors.red(err.message)} \nfile: ${trimmedPath} \nline: ${err.line} \ncolumn: ${err.column}\n`); // eslint-disable-line no-console
		}
	};

	const lintSCSS = async() => {
		logger.startLog('css-l', 'css-lint');

		const lintOptions = {
			configFile: '.stylelintrc.json',
			files: 'src/scss/**/*.scss',
			fix: true,
			formatter: 'string',
		};

		stylelint.lint(lintOptions).then(data => {
			const output = data.report;
			if (output) console.log(output); // eslint-disable-line no-console
			logger.finishLog('css-l');
		}).catch(err => {
			console.error(err.stack); // eslint-disable-line no-console
			logger.finishLog('css-l');
			return err.stack;
		});
	};

	const runSCSS = async() => {
		logger.startLog('css', 'css');
		const hasLintErrorsOrWarnings = await lintSCSS();

		if (hasLintErrorsOrWarnings) {
			logger.errorLog('css', 'css not compiled, fix lint warnings/errors');
		} else {
			await compileSCSS();
			logger.finishLog('css');
		}
	};

	return {
		runSCSS
	};
})(sass, path, fs, autoprefixer, flexBugsFix, mergeMedia, postcss, stylelint, colors, logger, paths, globalVars, initSetup);

export default scss;
