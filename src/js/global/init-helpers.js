const initHelpers = (() => {
	const html = document.querySelector('html');
	const body = document.querySelector('body');

	//Detect key press and add class to body
	const detectFocusOnKeyPress = () => {
		const activeFocus = 'active-focus';
		document.addEventListener('keydown', e => {
			if (e.key === 'Tab') {
				body.classList.add(activeFocus);
			}
		});
		document.addEventListener('mousedown', () => {
			if (body.classList.contains(activeFocus)) {
				body.classList.remove(activeFocus);
			}
		});
	};

	// Check if touch device for hover functionality
	if (('ontouchstart' in window || navigator.msMaxTouchPoints > 0 || navigator.maxTouchPoints) && !('onmousemove' in window)) {
		html.classList.add('touch');
	} else {
		html.classList.add('no-touch');
	}

	// Add loaded class to html, to enable transitions
	window.addEventListener('load', () => {
		setTimeout(() => {
			html.classList.add('loaded');
		}, 10);
	});
	detectFocusOnKeyPress();
})();

export default initHelpers;
