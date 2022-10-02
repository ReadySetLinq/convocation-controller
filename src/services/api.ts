export type Convocations = {
	id: string;
	title: string;
};

export type Convocation = {
	id: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	googleSheetId: string | null;
	networkId: string | null;
	xpressionId: string | null;
};

export type Network = {
	id: string;
	ip: string;
	port: number;
	userName: string;
	password: string;
};

export type GoogleSheets = {
	id: string;
	GoogleSheetsID: string;
	StudentID: string;
	Name_Column: string;
	Extra_Column: string | null;
	Multiplier_Column: string | null;
	Division_Column: string | null;
	OrderBy: string | null;
};

export type Xpression = {
	id: string;
	tmrDelay: number;
	ExtraTakeID: number;
	TakeID: number;
	Name: string;
	Extra: string;
	Multiplier: string;
	Background: string;
};

export const defaultConvocation: Convocation = {
	id: '',
	title: 'Fall 2022',
	googleSheetId: null,
	networkId: null,
	xpressionId: null,
	createdAt: new Date(),
	updatedAt: new Date(),
};

export const defaultNetwork: Network = {
	id: '',
	ip: 'localhost',
	port: 8080,
	userName: '',
	password: '',
};

export const defaultGoogleSheet: GoogleSheets = {
	id: '',
	GoogleSheetsID: '',
	StudentID: 'ID',
	Name_Column: 'Name',
	Extra_Column: 'Dipl Program Descr',
	Multiplier_Column: 'Multiplier',
	Division_Column: 'Division',
	OrderBy: '',
};

export const defaultXpression: Xpression = {
	id: '',
	tmrDelay: 250,
	ExtraTakeID: 1,
	TakeID: 2,
	Name: 'txtName',
	Extra: 'txtOther',
	Multiplier: 'txtMultiplier',
	Background: 'bkg',
};

const GET = async (url: string) =>
	await fetch(`${process.env.REACT_APP_API_URL}/${url}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		mode: 'no-cors',
	});

const POST = async (url: string, data: Object) => {
	console.log('POST', url, data, JSON.stringify(data));
	return await fetch(`${process.env.REACT_APP_API_URL}/${url}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		mode: 'no-cors',
		body: JSON.stringify(data),
	});
};

export const getLogin = async (username: string, password: string) => {
	console.log('getLogin password', password);

	const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		mode: 'no-cors',
		body: JSON.stringify({ username, password }),
	});
	const data = await response.json();
	console.log('getLogin data', data);
	/*
	const response = await POST(`login`, { username, password });
	const { results } = await response.json();
	console.log('getLogin results', results);
	*/
	return false;
};

export const getConvocations = async () => {
	const response = await GET(`convocation`);
	const { results } = await response.json();
	console.log('getConvocations results', results);

	return [{ id: 'cl8qijlqi00009b7wld5zfp47', title: 'Fall 2022' }];
};

export const getConvocation = async (id: string) => {
	console.log('getConvocation', id);
	const result = await GET(`convocation/${id}`);
	console.log('getConvocation', await result.json());
	return { ...defaultConvocation, ...(await result.json()) } as Convocation;
};

export const getNetwork = async (id: string) => {
	console.log('getNetwork', id);
	const result = await GET(`network/${id}`);
	console.log('getNetwork', await result.json());
	return { ...defaultNetwork, ...(await result.json()) } as Network;
};

export const updateNetwork = async (data: Network) => {
	const result = await POST(`network/${data.id}`, data);
	console.log('updateNetwork', await result.json());
	return { ...defaultNetwork, ...(await result.json()) } as Network;
};

export const getGoogleSheet = async (id: string) => {
	console.log('getGoogleSheet', id);
	const result = await GET(`googleSheet/${id}`);
	console.log('getGoogleSheet', await result.json());
	return { ...defaultGoogleSheet, ...(await result.json()) } as GoogleSheets;
};

export const updateGoogleSheet = async (data: GoogleSheets) => {
	const result = await POST(`googleSheet/${data.id}`, data);
	console.log('updateGoogleSheet', await result.json());
	return { ...defaultGoogleSheet, ...(await result.json()) } as GoogleSheets;
};

export const getXpression = async (id: string) => {
	console.log('getXpression', id);
	const result = await GET(`xpression/${id}`);
	console.log('getXpression', await result.json());
	return { ...defaultXpression, ...(await result.json()) } as Xpression;
};

export const updateXpression = async (data: Xpression) => {
	const result = await POST(`xpression/${data.id}`, data);
	console.log('updateXpression', await result.json());
	return { ...defaultXpression, ...(await result.json()) } as Xpression;
};
