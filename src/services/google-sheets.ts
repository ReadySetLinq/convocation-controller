import Papa from 'papaparse';

import { corsAnywhere, decodeUnicode, encodeUnicode } from './utilities';

import { gsObject } from './interfaces/google-sheets';

import { defaultSheetsResponse, sessionKey } from './constants/google-sheets';

export const getUrl = (id: string) =>
	`${corsAnywhere}https://docs.google.com/spreadsheets/u/1/d/e/${id}/pub?output=csv`;

export const clearGoogleCache = () => {
	sessionStorage.removeItem(sessionKey);
};

export const gsData = async (spreadsheetId: string): Promise<gsObject> => {
	return await fetchData(spreadsheetId);
};

const fetchData = async (id: string) =>
	new Promise<any>(async (resolve) => {
		try {
			// Check if a session value item already exists
			const cached = sessionStorage.getItem(sessionKey);
			if (cached) {
				// Return the data from sessionStorage instead of calling the remote data again
				return resolve({ ...defaultSheetsResponse, ...JSON.parse(decodeUnicode(cached)) });
			}

			Papa.parse(getUrl(id), {
				skipEmptyLines: true,
				download: true,
				header: true,
				error: (e) => {
					clearGoogleCache();
					return resolve({ ...defaultSheetsResponse, errors: [e] });
				},
				complete: (results) => {
					const data = { ...results };
					sessionStorage.setItem(sessionKey, encodeUnicode(JSON.stringify(data)));
					return resolve(data);
				},
			});
		} catch (e) {
			clearGoogleCache();
			return resolve({ ...defaultSheetsResponse });
		}
	});
