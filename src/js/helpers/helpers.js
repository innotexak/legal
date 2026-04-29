const helpers = (() => {
	const body = document.querySelector('body');

	let topScroll = 0;
	let isScrollDisabled = false;
	const disabledScrollClass = 'scroll-disabled';

	// Disable window scroll when popups, navigation and similar are opened
	const disableScroll = () => {
		if (!isScrollDisabled) {
			topScroll = document.documentElement.scrollTop;
			body.style.top = `-${topScroll}px`;
			body.classList.add(disabledScrollClass);
			isScrollDisabled = true;
		}
	};

	// Enable back window scroll when closing the opened overlays
	const enableScroll = () => {
		body.removeAttribute('style');
		body.classList.remove(disabledScrollClass);
		document.documentElement.scrollTop = topScroll;
		isScrollDisabled = false;
	};

	// Equal heights function should be best used on window load, and with debounce function on window resize
	/**     window.addEventListener('load', () => {
	 *          this.setEqualHeights(document.querySelectorAll('.js-equal-item'), 2);
	 *      });
	 *
	 *      # This will wait for a tenth of a second, when the window has finished resizing, and then the function will be called
	 *      window.addEventListener('resize', this.debounce(() => {
	 *          this.setEqualHeights(document.querySelectorAll('.js-equal-item'), 2);
	 *      }, 100));
	 *
	 *      # This function will be executed 4 times in a second during the event (without throttle, the function is called more than 100 times)
	 *      window.addEventListener('resize', this.throttle(() => {
	 *          this.setEqualHeights(document.querySelectorAll('.js-equal-item'), 2);
	 *      }, 250));
	 *
	 *      # Recommended events to be throttled or debounced are window scroll, resize, mousemove
	 */

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
