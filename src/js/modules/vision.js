import Splide from '@splidejs/splide';

const Vision = (() => {
	const init = () => {
		const el = document.querySelector('.js-vision-splide');
		if (!el) return;
		const splide = new Splide(el, {
			type: 'fade',
			rewind: true,
			arrows: false,
			pagination: false,
			speed: 800,
			pauseOnHover: false,
		});

		// Custom arrows
		const prevBtn = document.querySelector('.js-vision-prev');
		const nextBtn = document.querySelector('.js-vision-next');

		if (prevBtn) prevBtn.addEventListener('click', () => splide.go('<'));
		if (nextBtn) nextBtn.addEventListener('click', () => splide.go('>'));

		// Build custom dots after mount so slide count is available
		splide.on('mounted', () => {
			const pagination = document.querySelector('.js-vision-pagination');
			if (!pagination) return;

			const count = splide.length;

			for (let i = 0; i < count; i++) {
				const dot = document.createElement('button');
				dot.classList.add('vision__dot');
				dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
				if (i === 0) dot.classList.add('is-active');

				dot.addEventListener('click', () => splide.go(i));
				pagination.appendChild(dot);
			}
		});

		const currentText = document.querySelector('.js-vision__text-mobile');

		const updateText = index => {
			const slides = splide.Components.Elements.slides;
			const activeSlide = slides[index];

			if (!activeSlide) return;

			const textEl = activeSlide.querySelector('.js-vision__text');

			if (currentText && textEl) {
				currentText.innerHTML = textEl.innerHTML;
			}
		};

		// Initial load
		splide.on('mounted', () => {
			updateText(splide.index);
		});

		// On slide change
		splide.on('move', newIndex => {
			updateText(newIndex);
		});

		// Sync active dot on slide change
		splide.on('move', newIndex => {
			const dots = document.querySelectorAll('.vision__dot');
			dots.forEach((dot, i) => {
				dot.classList.toggle('is-active', i === newIndex);
			});
		});

		splide.mount();
	};

	return { init };
})();

export default Vision;
