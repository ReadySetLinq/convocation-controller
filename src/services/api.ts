import axios from 'axios';

export type Convocations = {
	id: string;
	title: string;
};

export type Convocation = {
	id: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	googleSheet: GoogleSheets;
	googleSheetId: string | null;
	network: Network;
	networkId: string | null;
	xpression: Xpression;
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

export const defaultConvocation: Convocation = {
	id: '',
	title: 'Fall 2022',
	googleSheet: defaultGoogleSheet,
	googleSheetId: null,
	network: defaultNetwork,
	networkId: null,
	xpression: defaultXpression,
	xpressionId: null,
	createdAt: new Date(),
	updatedAt: new Date(),
};

export const axiosInstance = axios.create({
	baseURL: `${process.env.REACT_APP_API_URL}`,
	timeout: 1000,
	headers: { 'Content-Type': 'application/json; charset=utf-8' },
	withCredentials: false,
});

export const getLogin = async (username: string, password: string) => {
	const {
		data: { results },
	} = await axiosInstance.post('/login', { username, password });

	return results?.success ?? false;
};

export const getConvocations = async () => {
	const {
		data: { results },
	} = await axiosInstance.get('/convocations');

	return [...results] as Convocations[];
};

export const getConvocation = async (id: string) => {
	const {
		data: { results },
	} = await axiosInstance.get(`/convocation/${id}`);

	return { ...defaultConvocation, ...results } as Convocation;
};

export const getNetwork = async (id: string) => {
	const {
		data: { results },
	} = await axiosInstance.get(`/network/${id}`);

	return { ...defaultNetwork, ...results } as Network;
};

export const updateNetwork = async (data: Network) => {
	const {
		data: { results },
	} = await axiosInstance.post(`/network/${data.id}`, { ...data });

	return { ...defaultNetwork, ...results } as Network;
};

export const getGoogleSheet = async (id: string) => {
	const {
		data: { results },
	} = await axiosInstance.get(`/googleSheet/${id}`);

	return { ...defaultGoogleSheet, ...results } as GoogleSheets;
};

export const updateGoogleSheet = async (data: GoogleSheets) => {
	const {
		data: { results },
	} = await axiosInstance.post(`/googleSheet/${data.id}`, { ...data });

	return { ...defaultGoogleSheet, ...results } as GoogleSheets;
};

export const getXpression = async (id: string) => {
	const {
		data: { results },
	} = await axiosInstance.get(`/xpression/${id}`);

	return { ...defaultXpression, ...results } as Xpression;
};

export const updateXpression = async (data: Xpression) => {
	const {
		data: { results },
	} = await axiosInstance.post(`/xpression/${data.id}`, { ...data });

	return { ...defaultXpression, ...results } as Xpression;
};
