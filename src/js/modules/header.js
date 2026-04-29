const Navigation = (() => {
	const toggleBtn = document.querySelector('.js-hamburger-toggle');
	const hamburgerIcon = document.querySelector('.js-hamburger-icon');
	const logoImg = document.querySelector('.js-header__logo');
	const navMenu = document.querySelector('.js-header__nav-close');
	const headerTop = document.querySelector('.js-header__top');
	const body = document.body;

	const getHamburgerIcon = (isOpen, isScrolled) => {
		if (isOpen) return toggleBtn.dataset.iconOpen;
		return isScrolled ? toggleBtn.dataset.iconDark : toggleBtn.dataset.iconLight;
	};

	const updateIcons = () => {
		const isOpen = navMenu.classList.contains('is-open');
		const isScrolled = window.scrollY > 20;

		if (hamburgerIcon) {
			hamburgerIcon.src = getHamburgerIcon(isOpen, isScrolled);
		}
		if (logoImg) {
			logoImg.src = isScrolled || isOpen
				? logoImg.dataset.logoDark
				: logoImg.dataset.logoLight;
		}
	};

	const toggleMenu = isOpen => {
		navMenu.classList.toggle('is-open', isOpen);
		headerTop.classList.toggle('is-nav-open', isOpen);
		body.style.overflow = isOpen ? 'hidden' : '';
		updateIcons();
	};

	const handleScroll = () => {
		if (!headerTop) return;
		headerTop.classList.toggle('is-scrolled', window.scrollY > 20);
		updateIcons();
	};

	const init = () => {
		if (!toggleBtn || !navMenu) return;

		toggleBtn.addEventListener('click', () => {
			toggleMenu(!navMenu.classList.contains('is-open'));
		});

		navMenu.querySelectorAll('.header__nav-link').forEach(link => {
			link.addEventListener('click', () => toggleMenu(false));
		});

		window.addEventListener('scroll', handleScroll);
		handleScroll();
	};

	return { init };
})();

export default Navigation;
