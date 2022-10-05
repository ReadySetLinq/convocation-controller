import { object, number, string } from 'yup';

import { XpnSettingsData } from '../interfaces/xpression';

export const defaultXpnSettingsData: XpnSettingsData = {
	id: '',
	tmrDelay: 250,
	ExtraTakeID: 1,
	TakeID: 2,
	Name: 'txtName',
	Extra: 'txtOther',
	Multiplier: 'txtMultiplier',
	Background: 'bkg',
};

export const xpnSettingsSchema = object({
	id: string().default(defaultXpnSettingsData.id).defined(),
	tmrDelay: number()
		.integer('Timer Delay must be a number!')
		.min(0, 'Timer Delay must be a 0 or above!')
		.max(2147483647, 'Timer Delay must be a number less than 2147483648ms!')
		.required('Timer Delay Required (Set to 0 for no delay)'),
	ExtraTakeID: number()
		.integer('ExtraTakeID must be a number!')
		.min(-1, 'ExtraTakeID must be a -1 or above!')
		.max(9999, 'ExtraTakeID must be a number less than 10000!')
		.required('ExtraTakeID Required (Set to -1 for no ExtraTake scene)!'),
	TakeID: number()
		.integer('TakeID must be a number!')
		.min(-9999, 'TakeID must be a -9999 or above!')
		.max(9999, 'TakeID must be a number less than 10000!')
		.required('TakeID Required!'),
	Name: string().trim().min(1, 'Name to short!').required('Name Required!'),
	Extra: string().trim().default(defaultXpnSettingsData.Extra).defined(),
	Multiplier: string().trim().default(defaultXpnSettingsData.Multiplier).defined(),
	Background: string().trim().default(defaultXpnSettingsData.Background).defined(),
}).defined();
