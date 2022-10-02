import { ThemeTypesData } from '../../stores/interfaces/theme-store';

export type SettingsKeys = 'convocation.Settings.theme';

export type StorageKeys = SettingsKeys;

export type StorageData = ThemeTypesData;

export interface StorageLoad {
	data?: StorageData;
	error?: any;
	key: string;
}

export interface StorageSave {
	key: string;
	data: StorageData;
}
