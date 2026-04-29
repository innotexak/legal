import Splide from '@splidejs/splide';

const slider = (Splide => {
	const slides = document.querySelectorAll('.js-slider');

	const init = () => {
		splide();
	};

	const splide = () => {

		slides.forEach(slide => {
			// eslint-disable-next-line no-unused-vars
			const splide = new Splide(slide, {
				type: 'slide',
				gap: 40,
				perPage: 3,
				perMove: 1,
				focus: 0,
				omitEnd: true,
				classes: {
					arrows: 'splide__arrows',
					arrow: 'splide__arrow',
					prev: 'splide__arrow--prev',
					next: 'splide__arrow--next',
					pagination: 'splide__pagination'
				},
				breakpoints: {
					// when window width is =< 1199
					1199: {
						gap: 30,
						perPage: 2
					},
					// when window width is =< 767
					767: {
						gap: 20,
						perPage: 1
					}
				}
			}).mount();
		});
	};

	return {
		init
	};
})(Splide);

export default slider;
