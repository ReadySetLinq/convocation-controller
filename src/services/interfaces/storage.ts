import { ThemeTypesData } from '../../stores/interfaces/theme-store';
import { NetworkSettingsData } from '../../components/settings/interfaces/network';
import { XpnSettingsData } from '../../components/settings/interfaces/xpression';
import { GoogleSheetsSettingsData } from '../../components/settings/interfaces/google-sheets';

export type SettingsKeys =
	| 'convocation.Settings.theme'
	| 'convocation.Settings.network'
	| 'convocation.Settings.xpn'
	| 'convocation.Settings.gs';

export type DataKeys = 'convocation.Data.gs';

export type StorageKeys = SettingsKeys | DataKeys;

export type StorageData = NetworkSettingsData | XpnSettingsData | GoogleSheetsSettingsData | ThemeTypesData;

export interface StorageLoad {
	data?: StorageData;
	error?: any;
	key: string;
}

export interface StorageSave {
	key: string;
	data: StorageData;
}
