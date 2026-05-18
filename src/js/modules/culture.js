const cultureTabs = (() => {

	const SELECTORS = {
		section: 'section.culture[data-script="culture"]',
		tabLink: '.js-culture__tab-link',
		tabList: '.js-culture__tab-list',
		panel: '.js-culture__panel',
	};

	function moveIndicator(section, activeLink) {
		const tabList = section.querySelector(SELECTORS.tabList);
		const navRect = tabList.getBoundingClientRect();
		const linkRect = activeLink.getBoundingClientRect();

		tabList.style.setProperty('--tab-indicator-width', `${linkRect.width}px`);
		tabList.style.setProperty('--tab-indicator-left', `${linkRect.left - navRect.left}px`);
	}

	function activateTab(section, tabId) {
		const links = section.querySelectorAll(SELECTORS.tabLink);

		links.forEach(link => {
			const active = link.getAttribute('href') === `#${tabId}`;
			link.classList.toggle('is-active', active);
			link.setAttribute('aria-selected', String(active));
			link.setAttribute('tabindex', active ? '0' : '-1');

			if (active) moveIndicator(section, link);
		});

		const allPanels = section.querySelectorAll(SELECTORS.panel);
		allPanels.forEach(panel => {
			const active = panel.dataset.content === tabId;
			panel.classList.toggle('is-active', active);

			// FIXED: Explicitly tell screen readers to ignore inactive panels
			panel.setAttribute('aria-hidden', String(!active));

			if (active) {
				panel.style.animation = 'none';
				void panel.offsetHeight;
				panel.style.animation = '';
			}
		});

		// ... (rest of your background image swapping logic stays exactly the same)
		if (tabId === 'culture') {
			section.style.backgroundImage = 'url(' + section.dataset.bgImage + ')';
			section.style.backgroundSize = 'cover';
			section.style.backgroundPosition = 'center';
			section.style.backgroundRepeat = 'no-repeat';
		} else {
			section.style.backgroundImage = 'none';
		}
		history.replaceState(null, '', `#${tabId}`);
	}

	function init() {
		const sections = document.querySelectorAll(SELECTORS.section);

		sections.forEach(section => {
			const links = section.querySelectorAll(SELECTORS.tabLink);
			const tabList = section.querySelector(SELECTORS.tabList);

			if (!links.length) return;

			// ARIA setup
			if (tabList) tabList.setAttribute('role', 'tablist');
			links.forEach(link => link.setAttribute('role', 'tab'));

			section.querySelectorAll(SELECTORS.panel).forEach(panel => {
				panel.setAttribute('role', 'tabpanel');
			});

			// Click
			links.forEach(link => {
				link.addEventListener('click', e => {
					e.preventDefault();
					const tabId = link.getAttribute('href').replace('#', '');
					activateTab(section, tabId);
				});
			});

			// Keyboard navigation
			tabList?.addEventListener('keydown', e => {
				const all = Array.from(links);
				const current = all.findIndex(l => l === document.activeElement);
				if (current === -1) return;

				const map = {
					ArrowRight: (current + 1) % all.length,
					ArrowDown: (current + 1) % all.length,
					ArrowLeft: (current - 1 + all.length) % all.length,
					ArrowUp: (current - 1 + all.length) % all.length,
					Home: 0,
					End: all.length - 1,
				};

				if (e.key in map) {
					e.preventDefault();
					const next = all[map[e.key]];
					next.focus();
					activateTab(section, next.getAttribute('href').replace('#', ''));
				}
			});

			// Resize: reposition indicator only
			let resizeTimer;
			window.addEventListener('resize', () => {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(() => {
					const activeLink = section.querySelector(`${SELECTORS.tabLink}.is-active`);
					if (activeLink) moveIndicator(section, activeLink);
				}, 100);
			});

			// Initial state: honour URL hash or default to first tab
			const hashId = window.location.hash.replace('#', '');
			const matchedLink = Array.from(links).find(l => l.getAttribute('href') === `#${hashId}`);
			const firstTabId = links[0].getAttribute('href').replace('#', '');

			activateTab(section, matchedLink ? hashId : firstTabId);
		});
	}

	return { init };
})();

export default cultureTabs;
