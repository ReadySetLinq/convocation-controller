import * as yup from 'yup';

import { SettingsStoreState } from '../interfaces/settings';

import { defaultNetworkSettingsData, networkSettingsSchema } from './network';
import { defaultGoogleSheetsSettingsData, googleSheetsSettingsSchema } from './google-sheets';
import { defaultXpnSettingsData, xpnSettingsSchema } from './xpression';

export const defaultSettingsStoreState: SettingsStoreState = {
	loaded: false,
	network: { ...defaultNetworkSettingsData },
	gs: { ...defaultGoogleSheetsSettingsData },
	xpn: { ...defaultXpnSettingsData },
};

export const settingsSchema = yup
	.object({
		network: networkSettingsSchema,
		gs: googleSheetsSettingsSchema,
		xpn: xpnSettingsSchema,
	})
	.defined();

export const defaultSettings: SettingsStoreState = {
	loaded: false,
	network: { id: '', ip: '192.168.1.53', port: 8080, userName: 'brtf', password: '' },
	gs: {
		id: '',
		GoogleSheetsID: '2PACX-1vTl1NfHLUoYlsQkHlaqyjNV9LdRT5PAkmrYcwajaRr-cuAcTLikSwakn4PQ3Vzp_A',
		StudentID: 'ID',
		Name_Column: 'Name for Credential',
		Extra_Column: 'Dipl Program Descr',
		Multiplier_Column: 'Multiplier',
		Division_Column: 'Division',
		OrderBy: '',
	},
	xpn: {
		id: '',
		tmrDelay: 250,
		ExtraTakeID: 1,
		TakeID: 2,
		Name: 'txtName',
		Extra: 'txtOther',
		Multiplier: 'txtMultiplier',
		Background: 'bkg',
	},
};
