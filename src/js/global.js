import './global/init-helpers';

const scriptSections = document.querySelectorAll('[data-script]');
const scriptFileArray = [];
if (scriptSections.length > 0) {
	scriptSections.forEach(section => {
		const fileName = section.dataset.script;
		if (scriptFileArray.includes(fileName)) return;
		scriptFileArray.push(fileName);
		import(`./modules/${fileName}`).then(mod => {
			mod.default.init();
		});
	});
}
