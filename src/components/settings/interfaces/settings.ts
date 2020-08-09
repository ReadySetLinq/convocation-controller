import { NetworkSettingsData } from './network';
import { GoogleSheetsSettingsData } from './google-sheets';
import { XpnSettingsData } from './xpression';

export interface SettingsState {
	network: NetworkSettingsData;
	gs: GoogleSheetsSettingsData;
	xpn: XpnSettingsData;
}

export interface SettingsStoreState {
	loaded: boolean;
	network: NetworkSettingsData;
	gs: GoogleSheetsSettingsData;
	xpn: XpnSettingsData;
}
