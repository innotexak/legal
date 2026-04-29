import fs from 'fs-extra';
import path from 'path';
import { optimize } from 'svgo';
import logger from '../../helpers/logger.mjs';

/*----------------------------------------------------------------------------------------------
	SVGs / IconFont
----------------------------------------------------------------------------------------------*/
// SVG optimization
const optimizeSvgs = ((fs, path, optimize, logger) => {
	const svgPath = 'src/assets/svg';
	const plugins = [
		'cleanupAttrs',
		'removeDoctype',
		'removeXMLProcInst',
		'removeComments',
		'removeMetadata',
		'removeTitle',
		'removeDesc',
		'removeUselessDefs',
		'removeEditorsNSData',
		'removeEmptyAttrs',
		'removeHiddenElems',
		'removeEmptyText',
		'removeEmptyContainers',
		{
			name: 'removeViewBox',
			active: false,
		},
		'cleanupEnableBackground',
		'convertStyleToAttrs',
		'convertColors',
		{
			name: 'convertPathData',
			params: {
				noSpaceAfterFlags: false
			}
		},
		'convertTransform',
		'removeUnknownsAndDefaults',
		'removeNonInheritableGroupAttrs',
		'removeUselessStrokeAndFill',
		'removeUnusedNS',
		'cleanupIds',
		'cleanupNumericValues',
		'moveElemsAttrsToGroup',
		'moveGroupAttrsToElems',
		'collapseGroups',
		'removeRasterImages',
		'mergePaths',
		'convertShapeToPath',
		'sortAttrs',
		'removeDimensions',
		{
			name: 'removeAttrs',
			params: {
				attrs: ['(stroke|fill)'],
			},
		},
		{
			name: 'addAttributesToSVGElement',
			params: {
				attributes: [{ 'fill': 'currentColor' }]
			}
		},
	];

	const readFiles = async src => {
		try {
			const data = await fs.readFile(src, 'utf8');
			return data;
		} catch (err) {
			console.error('ERROR:', err); // eslint-disable-line no-console
			throw err;
		}
	};

	const cleanupSvgFiles = async(file, filePath, allFiles) => {
		try {
			await readFiles(filePath);
			let newFile;

			if (file.substring(0, 4) !== 'ico-') {
				newFile = `ico-${file.trim().toLowerCase().replace(/ /g, '-')}`;
				if (allFiles.includes(newFile)) {
					// delete file if already exists
					try {
						fs.unlinkSync(filePath);
						logger.infoLog(`deleted '${filePath}' as file with the same name already exists`);
					} catch (err) {
						console.error(err); // eslint-disable-line no-console
					}
				} else {
					// rename file
					fs.renameSync(filePath, path.join(svgPath, newFile));
				}
			} else {
				newFile = file;
			}

			return newFile;
		} catch (error) {
			console.error('Error during renaming:', error); // eslint-disable-line no-console
			throw error;
		}
	};

	const optimizeSvgFiles = async filePath => {
		try {
			const data = await readFiles(filePath);
			const result = optimize(data, { path: filePath, plugins });
			return result;
		} catch (error) {
			console.error('Error during optimization:', error); // eslint-disable-line no-console
			throw error;
		}
	};

	const saveSvgFiles = async(filepath, data) => {
		return new Promise((resolve, reject) => {
			fs.writeFile(filepath, data, err => {
				if (err) {
					reject(err);
				} else {
					resolve(filepath);
				}
			});
		});
	};

	const optimizeFilesInDirectory = async() => {
		logger.startLog('optimize-svg', 'optimize-svgs');

		const allFiles = fs.readdirSync(svgPath);

		const optimizeSVGsArray = [];
		for (const file of allFiles) {
			const filePath = path.join(svgPath, file);

			if (path.extname(file) === '.svg') {
				try {
					// svgo optimization
					const result = await optimizeSvgFiles(filePath);

					// save optimized file
					await saveSvgFiles(filePath, result.data);

					// clean file name and prefix it
					const newFileName = await cleanupSvgFiles(file, filePath, allFiles);

					optimizeSVGsArray.push(newFileName);
				} catch (err) {
					console.error(err); // eslint-disable-line no-console
					throw err;
				}
			} else {
				try {
					// remove non svg files from folder
					fs.unlinkSync(filePath);
					logger.infoLog(`deleted '${filePath}' as it is not an SVG file`);
				} catch (err) {
					console.error(err); // eslint-disable-line no-console
				}
			}
		}

		try {
			// build font icons when all optimization functions are done
			await Promise.all(optimizeSVGsArray);
			logger.finishLog('optimize-svg');
		} catch (error) {
			logger.errorLog('optimize-svg', error);
		}
	};

	return {
		optimizeFilesInDirectory
	};
})(fs, path, optimize, logger);

export default optimizeSvgs;
