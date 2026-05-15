const statement = (() => {
	const BG_IMAGES = {
		chairman: {
			mobile: 'assets/images/chairman-mobile-bg.jpg',
			tablet: 'assets/images/chairman-tablet-bg.jpg',
			desktop: 'assets/images/chairman-desktop-bg.jpg',
		},
		ceo: {
			mobile: 'assets/images/ceo-mobile-bg.jpg',
			tablet: 'assets/images/ceo-tablet-bg.jpg',
			desktop: 'assets/images/ceo-desktop-bg.jpg',
		},
		cfo: {
			mobile: 'assets/images/cfo-mobile-bg.jpg',
			tablet: 'assets/images/cfo-tablet-bg.jpg',
			desktop: 'assets/images/cfo-desktop-bg.jpg',
		},
	};

	const BP = { mobile: 480, tablet: 768 };

	function getDeviceType() {
		const w = window.innerWidth;
		if (w <= BP.mobile) return 'mobile';
		if (w <= BP.tablet) return 'tablet';
		return 'desktop';
	}

	function activateTab(section, tabId) {
		const buttons = section.querySelectorAll('.js-statement__button');
		const panels = section.querySelectorAll('.js-statement__panel');
		const emptyDiv = section.querySelector('.js-statement__empty');

		const device = getDeviceType();
		const src = BG_IMAGES[tabId] ? BG_IMAGES[tabId][device] : null;

		buttons.forEach(btn => {
			const active = btn.dataset.tab === tabId;
			btn.classList.toggle('is-active', active);
			btn.setAttribute('aria-selected', String(active));

			// CRITICAL: Only the active button can be "tabbed" to.
			// Inactive ones are reached via Arrow Keys.
			btn.setAttribute('tabindex', active ? '0' : '-1');
		});

		panels.forEach(panel => {
			const active = panel.dataset.content === tabId;
			panel.classList.toggle('is-active', active);

			// Allows user to Tab into the content area to read it
			panel.setAttribute('tabindex', active ? '0' : '-1');

			if (active) {
				panel.style.animation = 'none';
				void panel.offsetHeight;
				panel.style.animation = '';
			}
		});

		if (device === 'desktop') {
			section.style.backgroundImage = src ? `url('${src}')` : 'none';
			if (emptyDiv) emptyDiv.style.backgroundImage = 'none';
		} else {
			section.style.backgroundImage = 'none';
			if (emptyDiv) {
				emptyDiv.style.backgroundImage = src ? `url('${src}')` : 'none';
			}
		}
	}

	// --- NEW: Handle Arrow Key movement between titles ---
	function handleKeyboardNav(e, section, buttons, currentIndex) {
		let nextIndex;

		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
			nextIndex = (currentIndex + 1) % buttons.length;
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
		} else {
			return; // Ignore other keys
		}

		e.preventDefault(); // Stop page from scrolling
		const nextBtn = buttons[nextIndex];

		activateTab(section, nextBtn.dataset.tab);
		nextBtn.focus(); // Move focus to the next title
	}

	function init() {
		const sections = document.querySelectorAll('[data-script="statement-tab"]');

		sections.forEach(section => {
			const buttons = section.querySelectorAll('.js-statement__button');
			if (!buttons.length) return;

			buttons.forEach((btn, index) => {
				// Click interaction
				btn.addEventListener('click', () => activateTab(section, btn.dataset.tab));

				// Keyboard interaction (Arrow Keys to move titles)
				btn.addEventListener('keydown', e => handleKeyboardNav(e, section, buttons, index));
			});

			activateTab(section, buttons[0].dataset.tab);

			window.addEventListener('resize', () => {
				const activeBtn = section.querySelector('.js-statement__button.is-active');
				if (activeBtn) activateTab(section, activeBtn.dataset.tab);
			});
		});
	}

	return { init };
})();

export default statement;
