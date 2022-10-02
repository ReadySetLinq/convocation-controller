export type Convocations = {
	id: string;
	title: string;
};

export const getConvocations = async () => {
	const result = await fetch(`${process.env.REACT_APP_API_URL}/convocations`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	console.log('getConvocations', result);
	return result.json();
};

export const getConvocation = async (id: string) => {
	const result = await fetch(`${process.env.REACT_APP_API_URL}/convocation/${id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	console.log('getConvocation', result);
	return result.json();
};
