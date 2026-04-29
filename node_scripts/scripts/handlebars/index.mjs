import fs from 'fs-extra';
import globalVars from '../../helpers/globalVars.mjs';
import hbsHelpers from './hbsHelpers.mjs';
import js_beautify from 'js-beautify'; // eslint-disable-line
import handlebars from 'handlebars';
import path from 'path';
import logger from '../../helpers/logger.mjs';
import paths from '../../helpers/paths.mjs';
import colors from '../../helpers/colors.mjs';

const hbs = ((fs, globalVars, hbsHelpers, js_beautify, handlebars, path, logger, paths) => { // eslint-disable-line
	const invalidJSONSet = new Set();
	let stop = false;
	const message = {
		badJSON: () => {
			console.log(`${colors.red('This .json file is not valid:')}`); // eslint-disable-line no-console
			console.log(`${colors.red([...invalidJSONSet][0])}`); // eslint-disable-line no-console
		},
		badHBS: item => {
			console.log(`${colors.red('This .hbs file is not valid:')}`); // eslint-disable-line no-console
			console.log(`${colors.red(item)}`); // eslint-disable-line no-console
		},
		missingJSON: item => {
			console.log(`${colors.red('This .json file is missing:')}`); // eslint-disable-line no-console
			console.log(`${colors.red(item)}`); // eslint-disable-line no-console
		},
		missingHTML: item => {
			console.log(`${colors.red('This .html file is missing:')}`); // eslint-disable-line no-console
			console.log(`${colors.red(item)}`); // eslint-disable-line no-console
		}
	};

	const hbsConfig = {
		'indent_size': 4,
		'preserve_newlines': false,
		'indent_char': '	'
	};

	const deleteFiles = (startPath, filter, resolve) => {
		if (!fs.existsSync(startPath)) {
			console.log('No dir ', startPath); // eslint-disable-line no-console
			return;
		}

		const files = fs.readdirSync(startPath);
		for (let i = 0; i < files.length; i++) {
			const filename = path.join(startPath, files[i]);
			const stat = fs.lstatSync(filename);
			if (stat.isDirectory()) {
				deleteFiles(filename, filter); //recurse
			} else if (filename.indexOf(filter) >= 0) {
				fs.unlinkSync(filename);
				resolve();
			}
		}
	};

	const cleanHTML = () => {
		return new Promise(res => {
			const startPath = paths.dist;
			const filter = '.html';

			deleteFiles(startPath, filter, res);
		});
	};

	const registerHelpers = () => {
		return new Promise(res => {
			const keys = Object.keys(hbsHelpers);
			keys.forEach(helper => handlebars.registerHelper(helper, hbsHelpers[helper]));

			res();
		});
	};

	const registerPartial = path => {
		if (!fs.existsSync(path)) return;

		fs.readdirSync(path).forEach(file => {
			const pathToHbs = `${path + file}/${file}.hbs`;
			if (!fs.existsSync(pathToHbs)) return;

			const html = fs.readFileSync(pathToHbs, 'utf8');
			handlebars.registerPartial(file, html);
		});
	};

	// register all the partials from modules and shared folders
	const registerPartials = () => {
		const modules = './src/html/modules/';
		const shared = './src/html/shared/';
		const items = './src/html/items/';

		return new Promise(res => {
			registerPartial(modules);
			registerPartial(shared);
			registerPartial(items);
			res();
		});
	};

	const isJSONValid = json => {
		try {
			JSON.parse(json);
		} catch (e) { // eslint-disable-line
			return false;
		}
		return true;
	};

	const checkJSON = (json, item, stop) => {
		if (!isJSONValid(json)) {
			invalidJSONSet.add(item);
			message.badJSON();

			stop = true;
			return;
		}

		if ([...invalidJSONSet].length) {
			message.badJSON();

			stop = true;
			return;
		}

		if (stop) return;
	};

	const headFilesSetup = (data, lang) => {
		data.data.language = lang;

		if (globalVars.mode === 'production') {
			data.cssVersion = `?v=${new Date().getTime()}`;
			data.globalScriptVersion = `?v=${new Date().getTime()}`;
		}
		if (globalVars.mode !== 'production') {
			data.data.seo.hideFromSearchEngines = true;
		}
	};

	const singleLanguageHBS = (inputFiles = []) => {
		stop = false;
		const templates = './src/html/templates';
		const filePaths = inputFiles;
		const { defaultLanguage } = globalVars;

		return new Promise(res => {
			if (!inputFiles.length) {
				findFilesInDirectory(templates, 'data.json', filename => {
					const filePath = path.parse(filename);
					if (filePath.base === 'data.json') {
						filePaths.push(filename);
					}
				});
			}

			// check if all the paths exist
			filePaths.forEach(item => {
				if (stop) return;

				const json = fs.readFileSync(item, 'utf8');
				const data = extendObject(JSON.parse(json));

				const jsonPathObject = path.parse(item);
				const filePath = jsonPathObject.dir;
				const htmlPath = `${filePath}/${filePath.split(path.sep).at(-1)}.hbs`;

				if (!fs.existsSync(htmlPath)) {
					console.log(`${htmlPath} does not have a .hbs file`); // eslint-disable-line no-console
					stop = true;
					return;
				}

				const html = fs.readFileSync(htmlPath, 'utf8');

				checkJSON(json, item, stop);

				const h = handlebars.compile(html);

				headFilesSetup(data, defaultLanguage);

				// set filename
				const fileName = `${data.template}.html`;

				try {
					const rawHTML = h(data);
					const parsedHTML = js_beautify.html(rawHTML, hbsConfig);  // eslint-disable-line

					writeFile(path.join(paths.dist, fileName), parsedHTML);
				} catch (e) {
					const { dir, base } = path.parse(htmlPath);
					message.badHBS(`File: ${dir}${path.sep}${base} \n Message:${e.message}`);
					stop = true;
					return;
				}
			});

			res();

		});
	};

	const multiLanguageHBS = () => {
		stop = false;
		const templates = path.join(paths.html, 'templates');
		const pathsArray = [];
		const { languages } = globalVars;

		return new Promise(res => {
			languages.forEach(language => {
				findFilesInDirectory(templates, '.hbs', filename => {
					const hbsPath = path.parse(path.resolve(filename));
					const dir = hbsPath.dir;
					const pathToJson = `${dir}/${language}.data.json`;

					if (fs.existsSync(pathToJson)) {
						pathsArray.push({
							path: pathToJson,
							language: language
						});
					} else {
						message.missingJSON(pathToJson);
					}
				});
			});

			pathsArray.forEach(p => {
				if (stop) return;

				const json = fs.readFileSync(p.path, 'utf8');
				const data = extendObject(JSON.parse(json));

				const jsonPathObject = path.parse(p.path);
				const filePath = jsonPathObject.dir;
				const htmlPath = `${filePath}/${data.template}.hbs`;

				if (!fs.existsSync(htmlPath)) {
					console.log(`${htmlPath} does not have a .hbs file`); // eslint-disable-line no-console
					stop = true;
					return;
				}

				const html = fs.readFileSync(htmlPath, 'utf8');

				checkJSON(json, p, stop);

				const h = handlebars.compile(html);

				headFilesSetup(data, p.language);

				// set filename
				const hbsPath = path.parse(path.resolve(p.path));
				const dir = hbsPath.dir;

				let folders = dir.split('templates')[1].split(path.sep);
				folders.pop();
				folders = folders.join(path.sep) + path.sep;

				const language = p.language === globalVars.defaultLanguage ? '' : p.language;

				// fix for multilanguage file path
				globalVars.path = language && !globalVars.isCMSVersion ? '../' : globalVars.path;

				const fileName = `${language}${folders}${data.template}.html`;

				try {
					const rawHTML = h(data);
					const parsedHTML = js_beautify.html(rawHTML, hbsConfig); // eslint-disable-line

					writeFile(path.join(paths.dist, fileName), parsedHTML);
				} catch (e) {
					const { dir, base } = path.parse(htmlPath);
					message.badHBS(`File: ${dir}${path.sep}${base} \n Message:${e.message}`);
					stop = true;
					return;
				}
			});

			res();
		});
	};

	const extendObject = object => {
		const htmlRoot = './src/html/';

		Object.keys(object).forEach(prop => {
			if (stop) return object;

			if (typeof object[prop] === 'object') {
				// extend marker
				const extendKey = '>>';

				if (Object.keys(object[prop]).includes(extendKey)) {
					const url = htmlRoot + object[prop][extendKey];

					// catch if the file is not present
					if (!fs.existsSync(url)) {
						message.missingJSON(object[prop][extendKey]);
						stop = true;
						return;
					} else {
						const extendedObjectData = fs.readFileSync(url, 'utf-8');

						// check if read json is valid
						const jsonIsInvalid = !isJSONValid(extendedObjectData);
						if (jsonIsInvalid) {
							invalidJSONSet.add(url);
							stop = true;
							return true;
						}

						const parsedExtendedObject = JSON.parse(extendedObjectData);

						delete object[prop][extendKey];

						object[prop] = {
							...parsedExtendedObject,
							...object[prop],
						};
					}
				}

				if (!stop) {
					extendObject(object[prop]);
				}
			}

			if (typeof object[prop] === 'string') {
				// check if inner prop is a string that contains ${url}
				// for multilanguage links
				if (object[prop].indexOf('${url}') > -1) {
					object[prop] = object[prop].replace('${url}', globalVars.path);
				} else if (object[prop].endsWith('.content.html')) {
					const htmlPath = htmlRoot + object[prop];
					if (fs.existsSync(htmlPath)) {
						const html = fs.readFileSync(htmlPath, 'utf8');
						object[prop] = html;
					} else {
						message.missingHTML(htmlPath);
						object[prop] = '';
					}
				}
			}

		});

		return object;
	};

	const findFilesInDirectory = (startPath, filter, callback) => {
		if (!fs.existsSync(startPath)) {
			console.log('No dir ', startPath); // eslint-disable-line no-console
			return;
		}

		const files = fs.readdirSync(startPath);
		for (let i = 0; i < files.length; i++) {
			const filename = path.join(startPath, files[i]);
			const stat = fs.lstatSync(filename);
			if (stat.isDirectory()) {
				findFilesInDirectory(filename, filter, callback); //recurse
			} else if (filename.indexOf(filter) >= 0) callback(filename);
		}
	};

	const writeFile = (path1, contents, cb = () => {}) => {
		fs.mkdir(path.dirname(path1), { recursive: true }, err => {
			if (err) return cb(err);

			fs.writeFile(path1, contents, cb);
		});
	};

	const registerHbs = () => {
		logger.startLog('hbs-r', 'register handlebars partials', 1);

		return new Promise(res => {
			registerHelpers();
			registerPartials();

			logger.finishLog('hbs-r', 1);
			res();
		});
	};

	const compileHbs = inputFiles => {
		if (globalVars.mode !== 'development' && globalVars.isCMSVersion) return;
		logger.startLog('hbs-c', 'compile handlebars templates', 1);
		return new Promise(res => {

			invalidJSONSet.clear();
			singleLanguageHBS(inputFiles);
			if (globalVars.isMultilanguage) {
				multiLanguageHBS();
			}

			logger.finishLog('hbs-c', 1);
			res();
		});
	};

	const processHandlebarsFiles = inputFiles => {
		logger.startLog('hbs', 'hbs');
		return new Promise(res => {
			registerHbs();
			compileHbs(inputFiles);

			logger.finishLog('hbs');
			res();
		});
	};

	const addLanguage = () => {
		if (!globalVars.isMultilanguage) {
			console.log('Multilanguage is off'); // eslint-disable-line no-console
			return;
		}

		findFilesInDirectory('./src/html/', 'data.json', file => {
			globalVars.languages.forEach(lng => {
				const filePath = path.parse(file);
				if (!fs.existsSync(`${filePath.dir}/${lng}.data.json`)) {
					fs.copyFile(`${filePath.dir}/data.json`, `${filePath.dir}/${lng}.data.json`, err => {
						if (err) throw err;
					});
				}
			});
		});
	};

	return {
		addLanguage,
		cleanHTML,
		processHandlebarsFiles,
		registerHbs
	};
})(fs, globalVars, hbsHelpers, js_beautify, handlebars, path, logger, paths);

export default hbs;
