import axe from 'axe-core';

// https://www.deque.com/axe/core-documentation/api-documentation/
const options = {
	runOnly: {
		type: 'tag',
		values: [
			'wcag2a',
			'wcag21a',
			'best-practice',
			'ACT',
			'section508',
			'TTv5',
			'EN-301-549',
		],
	},
};

axe.run(document, options, (err, results) => {
	if (err) {
		console.error('Axe-core error:', err); // eslint-disable-line no-console
	} else {
		console.log('Accessibility violation:', results.violations); // eslint-disable-line no-console
		results.violations.forEach(violation => {
			console.log( // eslint-disable-line no-console
				document.querySelector(`${violation.nodes[0].target[0]}`)
			);
			document
				.querySelector(`${violation.nodes[0].target[0]}`)
				.setAttribute(
					'style',
					'outline: 2px solid red; outline-offset: 5px;'
				);
		});
	}
});
