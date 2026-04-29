const fetchHelpers = (() => {

	const getData = (url, params, callbacks) => {
		const urlSearchParams = params ? `${url}?${new URLSearchParams(params).toString()}` : url;
		fetch(urlSearchParams, {
			method: 'GET'
		}).then(response => {
			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`);
			}
			return response.json();
		}).then(result => {
			callbacks(result);
		}).catch(error => {
			// eslint-disable-next-line no-console
			console.error(`Error: ${error}`);
		});
	};

	return {
		getData
	};
})();

export default fetchHelpers;
