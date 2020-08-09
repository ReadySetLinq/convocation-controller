import { gsObject } from '../interfaces/google-sheets';

import { defaultDataKeys } from './storage';

export const sessionKey = `rsl.${defaultDataKeys.GS}`;

export const defaultSheetsResponse: gsObject = {
	data: [],
	errors: ['failed to get data'],
	meta: {
		aborted: true,
		cursor: 0,
		delimiter: ',',
		fields: [],
		linebreak: ';',
		truncated: false,
	},
};
