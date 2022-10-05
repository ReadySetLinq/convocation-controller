import { Network } from './network';
import { GoogleSheets } from './google-sheets';
import { Xpression } from './xpression';

export interface SettingsState {
	network: Network;
	gs: GoogleSheets;
	xpn: Xpression;
}

export interface SettingsStoreState {
	loaded: boolean;
	network: Network;
	gs: GoogleSheets;
	xpn: Xpression;
}
