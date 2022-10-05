import axios from 'axios';

import { defaultConvocation } from './constants/convocation';
import { defaultGoogleSheet } from '../components/settings/constants/google-sheets';
import { defaultNetwork } from '../components/settings/constants/network';
import { defaultXpression } from '../components/settings/constants/xpression';

import { Convocations, Convocation } from './interfaces/convocation';
import { GoogleSheets } from '../components/settings/interfaces/google-sheets';
import { Network } from '../components/settings/interfaces/network';
import { Xpression } from '../components/settings/interfaces/xpression';

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
