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
