const helpers = (() => {
	const body = document.querySelector('body');

	let topScroll = 0;
	let isScrollDisabled = false;
	const disabledScrollClass = 'scroll-disabled';

	const disableScroll = () => {
		if (!isScrollDisabled) {
			topScroll = document.documentElement.scrollTop;
			body.style.top = `-${topScroll}px`;
			body.classList.add(disabledScrollClass);
			isScrollDisabled = true;
		}
	};

	const enableScroll = () => {
		body.removeAttribute('style');
		body.classList.remove(disabledScrollClass);
		document.documentElement.scrollTop = topScroll;
		isScrollDisabled = false;
	};

	const setEqualHeights = (arrayItems, count) => {
		const convertedElements = [...arrayItems];

		if (convertedElements !== undefined && convertedElements.length > 0) {
			convertedElements.forEach(element => element.removeAttribute('style'));
			if (window.innerWidth > 767) {
				let maxH = 0;

				if (count) {
					const arrays = [];
					while (convertedElements.length > 0) {
						arrays.push(convertedElements.splice(0, count));
					}

					for (let i = 0; i < arrays.length; i += 1) {
						const data = arrays[i];
						maxH = 0;
						for (let j = 0; j < data.length; j += 1) {
							const currentH = data[j].offsetHeight;
							if (currentH > maxH) {
								maxH = currentH;
							}
						}

						for (let k = 0; k < data.length; k += 1) {
							data[k].style.height = `${maxH}px`;
						}
					}
				} else {
					convertedElements.forEach(element => {
						const currentH2 = element.offsetHeight;
						if (currentH2 > maxH) {
							maxH = currentH2;
						}
					});

					convertedElements.forEach(element => element.style.height = `${maxH}px`);
				}
			}
		}
	};

	const throttle = (func, interval) => {
		let timeout;
		return function() {
			const _this = this;
			const args = arguments;
			const later = function() {
				timeout = false;
			};
			if (!timeout) {
				func.apply(_this, args);
				timeout = true;
				setTimeout(later, interval || 250);
			}
		};
	};

	const debounce = (func, interval) => {
		let timeout;
		return function() {
			const _this = this;
			const args = arguments;
			const later = function() {
				timeout = null;
				func.apply(_this, args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, interval || 100);
		};
	};

	return {
		disableScroll,
		enableScroll,
		setEqualHeights,
		throttle,
		debounce
	};
})();

export default helpers;
