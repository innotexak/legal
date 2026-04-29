
import fs from 'fs-extra';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import webfontsGenerator from '@vusion/webfonts-generator';
import paths from '../../helpers/paths.mjs';
import logger from '../../helpers/logger.mjs';
import optimizeSvgs from './optimizeSvgs.mjs';

const iconfont = ((fs, path, dirname, fileURLToPath, webfontsGenerator, paths, logger, optimizeSvgs) => {

	const svgPath = './src/assets/svg';
	let startUnicode = 0xf101;

	const getIconUnicode = () => {
		const unicode = String.fromCharCode(startUnicode++);
		return unicode;
	};

	const fontCharItem = (name, code) => {
		return `\t@if $filename == ${name} {\n\t\t$char: '\\${code}';\n\t}\n`;
	};

	const fontIconItem = (prefix, name) => {
		return `.${prefix}-${name} {\n\t@include font(${name});\n}\n`;
	};

	const cssCharItems = [];
	const cssIconItems = [];
	const svgFiles = [];

	const prepareSvgFiles = async() => {
		await optimizeSvgs.optimizeFilesInDirectory();
		const svgImages = fs.readdirSync(svgPath);
		const sortedSvgFiles = svgImages.sort();
		sortedSvgFiles.forEach(file => {
			svgFiles.push('./src/assets/svg/' + file);
		});
		prepareCssStrings(svgFiles);
	};

	const prepareCssStrings = svgFiles => {
		svgFiles.forEach(filePath => {
			const name = path.basename(filePath, path.extname(filePath));
			const code = getIconUnicode().charCodeAt(0).toString(16).toUpperCase();
			cssCharItems.push(fontCharItem(name, code));
			cssIconItems.push(fontIconItem('font', name));
		});
	};

	const generateWebFont = async() => {
		if (!fs.existsSync(svgPath)) return;
		logger.startLog('iconfont', 'iconfont');
		await prepareSvgFiles();
		return new Promise((resolve, reject) => {
			webfontsGenerator({
				files: svgFiles,
				dest: path.join(paths.assets, 'fonts/'),
				cssTemplate: path.join(dirname(fileURLToPath(import.meta.url)), 'template/iconfont.hbs'),
				cssDest: './src/scss/base/_icon-font.scss',
				types: ['woff', 'woff2'],
				templateOptions: {
					output: '../assets/fonts',
					fontname: 'iconfont',
					cssString: cssCharItems.join(''),
					cssString2: cssIconItems.join(''),
					timestamp: Date.now()
				},
			}, async error => {
				if (error) {
					console.error(error); // eslint-disable-line no-console
					reject(error);
				} else {
					logger.finishLog('iconfont');
					resolve();
				}
			});
		});
	};
	return {
		generateWebFont
	};
})(fs, path, dirname, fileURLToPath, webfontsGenerator, paths, logger, optimizeSvgs);

export default iconfont;
