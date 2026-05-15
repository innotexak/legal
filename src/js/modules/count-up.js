const CountUp = (() => {
	let elements = [];

	const easeOutQuad = t => t * (2 - t);

	const formatNumber = (num, prefix = '', suffix = '') => {
		const formatted = num.toLocaleString(undefined, {
			maximumFractionDigits: 2
		});
		return `${prefix}${formatted}${suffix}`;
	};

	const animate = (el, target, duration) => {
		const start = 0;
		const startTime = performance.now();

		const prefix = el.dataset.prefix || '';
		const suffix = el.dataset.suffix || '';

		const tick = currentTime => {
			const elapsed = currentTime - startTime;
			let progress = Math.min(elapsed / duration, 1);

			progress = easeOutQuad(progress);

			const value = start + (target - start) * progress;
			el.textContent = formatNumber(value, prefix, suffix);

			if (progress < 1) {
				requestAnimationFrame(tick);
			} else {
				el.textContent = formatNumber(target, prefix, suffix);
				el.dataset.animated = 'true';
			}
		};

		requestAnimationFrame(tick);
	};

	const init = () => {
		elements = document.querySelectorAll('[data-countup]');
		if (!elements.length) return;

		elements.forEach(el => {
			if (el.dataset.animated) return;

			const target = parseFloat(el.dataset.count);
			if (isNaN(target)) return;

			el.textContent = formatNumber(
				0,
				el.dataset.prefix || '',
				el.dataset.suffix || ''
			);

			animate(el, target, 5000);
		});
	};

	return { init };
})();

export default CountUp;
