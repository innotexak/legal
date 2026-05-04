const CountUp = (() => {
	let elements = [];

	const easeOutQuad = t => t * (2 - t);

	const formatNumber = num => {
		return Math.floor(num).toLocaleString();
	};

	const animate = (el, target, duration) => {
		const start = 0;
		const startTime = performance.now();

		const tick = currentTime => {
			const elapsed = currentTime - startTime;
			let progress = Math.min(elapsed / duration, 1);

			progress = easeOutQuad(progress);

			const value = start + (target - start) * progress;
			el.textContent = formatNumber(value);

			if (progress < 1) {
				requestAnimationFrame(tick);
			} else {
				el.textContent = formatNumber(target);
			}
		};

		requestAnimationFrame(tick);
	};

	const init = (options = {}) => {
		const selector = options.selector || '[data-countup]';
		const duration = options.duration || 1500;

		elements = document.querySelectorAll(selector);

		if (!elements.length) return;

		elements.forEach(el => {
			const target = parseFloat(el.dataset.count) || 0;
			animate(el, target, duration);
		});
	};

	return { init };
})();

export default CountUp;
