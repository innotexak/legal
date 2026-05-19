const BottomToTop = (() => {
	let upBtn;

	const handleScroll = () => {
		if (!upBtn) return;

		upBtn.classList.toggle('visible', window.scrollY > 300);
	};

	const init = () => {
		upBtn = document.querySelector('.js-footer__up');
		if (!upBtn) return;

		window.addEventListener('scroll', handleScroll);

		handleScroll();
	};

	return { init };
})();

export default BottomToTop;
