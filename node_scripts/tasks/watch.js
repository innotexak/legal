import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs-extra';
import globalVars from '../helpers/globalVars.mjs';
import logger from '../helpers/logger.mjs';
import paths from '../helpers/paths.mjs';
import js from '../scripts/javascript.mjs';
import scss from '../scripts/scss/index.mjs';
import hbs from '../scripts/handlebars/index.mjs';

const state = {
	js: {
		isActive: false,
		nextTask: null,
	},
	hbs: {
		isActive: false,
		nextTask: null,
	},
	scss: {
		isActive: false,
		nextTask: null,
	},
};

let data = [];

const getAllHbsFilesFromDirectory = function(dir, filesList) {
	const files = fs.readdirSync(dir);
	filesList = filesList || [];
	files.forEach(file => {
		if (fs.statSync(dir + '/' + file).isDirectory()) {
			filesList = getAllHbsFilesFromDirectory(
				dir + '/' + file,
				filesList,
			);
		} else {
			const f = path.parse(file);

			if (f.ext === '.hbs') {
				filesList.push(path.join(dir, file));
			}
		}
	});
	return filesList;
};

const watchFunction = async(state, fn, data) => {
	if (!state.isActive) {
		state.isActive = true;
		await fn(data);
		state.isActive = false;
		if (state.nextTask) {
			await state.nextTask(data);
			state.nextTask = null;
		}
	} else {
		state.nextTask = fn;
	}
};

const getFolderObject = fileName => {
	const isModules = path
		.parse(fileName)
		.dir.includes(`${path.sep}html${path.sep}modules${path.sep}`);
	const isItems = path
		.parse(fileName)
		.dir.includes(`${path.sep}html${path.sep}items${path.sep}`);
	const isShared = path
		.parse(fileName)
		.dir.includes(`${path.sep}html${path.sep}shared${path.sep}`);
	const isTemplates = path
		.parse(fileName)
		.dir.includes(`${path.sep}html${path.sep}templates${path.sep}`);

	return { isModules, isShared, isTemplates, isItems };
};

const getHbsName = fileName => {
	const { isModules, isShared, isTemplates, isItems } =
		getFolderObject(fileName);

	let folderName = '';
	if (isModules) folderName = 'modules';
	if (isItems) folderName = 'items';
	if (isTemplates) folderName = 'templates';
	if (isShared) folderName = 'shared';

	const split = fileName.split(path.sep);
	const templateIndex = split.findIndex(x => x === folderName);
	return split[templateIndex + 1];
};

const initialMapping = async() => {
	data = [];
	const allHbsFiles = getAllHbsFilesFromDirectory(paths.html);

	allHbsFiles.forEach(file => {
		const moduleName = getHbsName(file);
		let moduleType = '';
		const regex = /({{> .*?}})/g;
		const lookupRegex = /({{> \(.*\))/g;
		const { isModules, isShared, isTemplates, isItems } =
			getFolderObject(file);

		if (isTemplates) {
			moduleType = 'template';
		}
		if (isModules) {
			moduleType = 'module';
		}
		if (isItems) {
			moduleType = 'item';
		}
		if (isShared) {
			moduleType = 'shared';
		}

		const fileContent = fs.readFileSync(file, { encoding: 'utf-8' });
		const initialData = {
			moduleType,
			moduleName,
			path: file,
			partials: (
				(fileContent.match(regex) || [])
					.map(x => x.split(' ')[1])
					?.filter(x => !x.startsWith('(') && !x.startsWith('@')) ||
				[]
			).filter(Boolean),
			lookup: !!fileContent.match(lookupRegex)?.length,
		};

		if (initialData.lookup) {
			const json = fs.readFileSync(
				initialData.path.replace(
					`${initialData.moduleName}.hbs`,
					'data.json',
				),
				{ encoding: 'utf-8' },
			);
			const data = JSON.parse(json).data;
			if (!data) return;

			const newModules = [
				...new Set(
					Object.values(data)
						?.filter(d => typeof d === 'object' && d.length)
						?.flat()
						?.map(x => x.moduleAlias),
				),
			];
			initialData.partials = [
				...new Set([...initialData.partials, ...newModules]),
			];

			delete initialData.lookup;
		}

		initialData.path =
			path.parse(file).dir.replace(paths.root + path.sep, '') +
			path.sep +
			'data.json';

		data.push(initialData);
	});

	data.filter(d => d.moduleType !== 'template').forEach(d => {
		d.newDeps = [
			...new Set([
				...d.partials,
				...d.partials
					.map(
						p =>
							data.find(x => x.moduleName === p)?.partials ||
							[],
					)
					.flat(),
			]),
		];

		while (d.partials.length !== d.newDeps.length) {
			d.partials = JSON.parse(JSON.stringify(d.newDeps));

			d.newDeps = [
				...new Set([
					...d.partials,
					...d.partials
						.map(
							p =>
								data.find(x => x.moduleName === p)
									?.partials || [],
						)
						.flat(),
				]),
			];
		}

		delete d.newDeps;
	});

	data.filter(d => d.moduleType === 'template').forEach(d => {
		d.newDeps = [
			...new Set([
				...d.partials,
				...d.partials
					.map(
						p =>
							data.find(x => x.moduleName === p)?.partials ||
							[],
					)
					.flat(),
			]),
		];

		d.partials = d.newDeps;

		delete d.newDeps;
	});
};

hbs.registerHbs();
initialMapping();

globalVars.mode = 'development';

logger.startLog('scss_watch', 'started scss watch');
chokidar.watch(path.join(paths.root, 'src/scss')).on('change', async() => {
	await watchFunction(state.scss, scss.runSCSS);
});

logger.startLog('js_watch', 'started js watch');
chokidar.watch(path.join(paths.root, 'src/js')).on('change', async() => {
	await watchFunction(state.js, js.webpack);
});

logger.startLog('html_watch', 'started html watch');
chokidar
	.watch(path.join(paths.root, 'src/html'), {
		awaitWriteFinish: {
			stabilityThreshold: 100,
		},
	})
	.on('change', async file => {
		console.log('hbs changed'); // eslint-disable-line no-console
		await initialMapping();
		const { isModules, isShared, isTemplates, isItems } =
			getFolderObject(file);

		const name = getHbsName(file);

		if (name === 'master') {
			const files = data
				.filter(d => d.moduleType === 'template')
				.map(d => d.path);
			watchFunction(state.hbs, hbs.processHandlebarsFiles, files);
		} else if (isTemplates) {
			const files = [data.find(d => d.moduleName === name).path];
			watchFunction(state.hbs, hbs.processHandlebarsFiles, files);
		} else if (isModules || isShared || isItems) {
			const files = data
				.filter(
					d =>
						d.moduleType === 'template' &&
						d.partials.includes(name),
				)
				?.map(x => x.path);
			watchFunction(state.hbs, hbs.processHandlebarsFiles, files);
		} else {
			console.log('No module or template are calling this module!'); // eslint-disable-line no-console
		}
	});
