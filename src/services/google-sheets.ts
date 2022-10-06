import Papa from 'papaparse';

import { decodeUnicode, encodeUnicode } from './utilities';
import { defaultSheetsResponse, sessionKey } from './constants/google-sheets';

import { gsObject } from './interfaces/google-sheets';

export const getUrl = (id: string) =>
	`https://docs.google.com/spreadsheets/u/1/d/e/${id}/pub?output=csv&key=${process.env.REACT_APP_GOOGLE_API_KEY || ''}`;

export const clearGoogleCache = async () => {
	sessionStorage.removeItem(sessionKey);
	return true;
};

type CachedJSON = {
	sheet: gsObject;
	ttl: number;
};

export const gsData = async (spreadsheetId: string): Promise<gsObject> => {
	return new Promise<gsObject>(async (resolve) => {
		try {
			const ONE_HOUR = 60 * 60 * 1000;
			// Check if a session value item already exists
			const cached = sessionStorage.getItem(sessionKey);
			if (cached) {
				const cachedJSON: CachedJSON = JSON.parse(decodeUnicode(cached));
				// Only use cached values less then the ttl old
				if (new Date().getTime() < cachedJSON.ttl) {
					// Return the data from sessionStorage instead of calling the remote data again
					return resolve({
						...defaultSheetsResponse,
						...cachedJSON.sheet,
					});
				}
			}

			const data = await fetchData(spreadsheetId);

			if (data) {
				sessionStorage.setItem(
					sessionKey,
					encodeUnicode(JSON.stringify({ sheet: data, ttl: new Date().getTime() + ONE_HOUR })),
				);
				return resolve({ ...defaultSheetsResponse, ...data });
			}
			throw new Error('No data found');
		} catch (e) {
			clearGoogleCache();
			return resolve({ ...defaultSheetsResponse });
		}
	});
	//return await fetchData(spreadsheetId);
};

const fetchData = async (id: string) =>
	new Promise<gsObject>(async (resolve, reject) => {
		Papa.parse(getUrl(id), {
			skipEmptyLines: true,
			download: true,
			header: true,
			error: (e) => {
				return reject(e);
			},
			complete: (results: unknown) => {
				return resolve({ ...defaultSheetsResponse, ...(results as gsObject) });
			},
		});
	});
