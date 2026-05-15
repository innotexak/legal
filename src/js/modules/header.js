const Navigation = (() => {
	const toggleBtn = document.querySelector('.js-hamburger-toggle');
	const hamburgerIcon = document.querySelector('.js-hamburger-icon');
	const logoImg = document.querySelector('.js-header__logo');
	const navMenu = document.querySelector('.js-header__nav-close');
	const headerTop = document.querySelector('.js-header__top');
	const body = document.body;

	const focusableElementsString = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

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

	const handleTrapFocus = e => {
		if (e.key !== 'Tab') return;

		const menuFocusables = Array.from(navMenu.querySelectorAll(focusableElementsString));

		const allFocusables = [toggleBtn, ...menuFocusables];

		const firstFocusable = allFocusables[0];
		const lastFocusable = allFocusables[allFocusables.length - 1];

		if (e.shiftKey) {
			if (document.activeElement === firstFocusable) {
				lastFocusable.focus();
				e.preventDefault();
			}
		} else { // Tab
			if (document.activeElement === lastFocusable) {
				firstFocusable.focus();
				e.preventDefault();
			}
		}
	};

	const toggleMenu = isOpen => {
		navMenu.classList.toggle('is-open', isOpen);
		headerTop.classList.toggle('is-nav-open', isOpen);
		body.style.overflow = isOpen ? 'hidden' : '';

		toggleBtn.setAttribute('aria-expanded', isOpen);
		toggleBtn.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');

		if (isOpen) {
			window.addEventListener('keydown', handleTrapFocus);

			setTimeout(() => toggleBtn.focus(), 100);
		} else {
			window.removeEventListener('keydown', handleTrapFocus);
			toggleBtn.focus();
		}

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

		window.addEventListener('keydown', e => {
			if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
				toggleMenu(false);
			}
		});

		window.addEventListener('scroll', handleScroll);
		handleScroll();
	};

	return { init };
})();

export default Navigation;
