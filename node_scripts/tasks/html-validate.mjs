import path from 'path';
import fs from 'fs-extra';
import { w3cHtmlValidator } from 'w3c-html-validator';
import paths from '../helpers/paths.mjs';

const htmlValidate = async(path, fs, w3cHtmlValidator, paths) => {
	try {
		const dist = path.join(paths.dist);
		const distContent = await fs.promises.readdir(dist);

		for (const file of distContent) {
			const filePath = path.join(dist, file);
			const isHtmlFile = path.extname(filePath).toLowerCase() === '.html';
			if (!isHtmlFile) continue;
			const reporterOptions = {
				continueOnFail: true
			};
			const validateOptions = {
				filename: filePath,
			};

			w3cHtmlValidator.validate(validateOptions)
				.then(results => w3cHtmlValidator.reporter(results, reporterOptions));
		}
	} catch (error) {
		console.error('Error validating HTML files', error); // eslint-disable-line no-console
	}
};

export default htmlValidate(path, fs, w3cHtmlValidator, paths);
