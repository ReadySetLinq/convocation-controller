import { decodeUnicode, encodeUnicode } from './utilities';

import { StorageLoad, StorageSave, StorageData, SettingsKeys } from './interfaces/storage';
import { SettingsStoreState } from '../components/settings/interfaces/settings';
import { NetworkSettingsData } from '../components/settings/interfaces/network';
import { GoogleSheetsSettingsData } from '../components/settings/interfaces/google-sheets';
import { XpnSettingsData } from '../components/settings/interfaces/xpression';

import { defaultSettingKeys } from './constants/storage';
import { defaultNetworkSettingsData } from '../components/settings/constants/network';
import { defaultGoogleSheetsSettingsData } from '../components/settings/constants/google-sheets';
import { defaultXpnSettingsData } from '../components/settings/constants/xpression';
import { clearGoogleCache } from './google-sheets';

// Storage Saving/Loading
export const loadData = async (key: SettingsKeys) =>
	new Promise<StorageLoad>(async (resolve, reject) => {
		try {
			const _localData = localStorage.getItem(`rsl.${key}`);
			if (_localData) {
				return resolve({ key, data: JSON.parse(decodeUnicode(_localData)) });
			} else {
				return reject({ key, error: 'not found' });
			}
		} catch (err) {
			return reject({ key, error: err });
		}
	});

export const loadSettings = async () =>
	new Promise<SettingsStoreState>(async (resolve) => {
		const loaded: boolean = true;
		let network: NetworkSettingsData = defaultNetworkSettingsData;
		let gs: GoogleSheetsSettingsData = defaultGoogleSheetsSettingsData;
		let xpn: XpnSettingsData = defaultXpnSettingsData;

		const loadNetwork = loadData(defaultSettingKeys.Network)
			.then((x: StorageLoad) => {
				if (x.data !== undefined) return x.data;
				throw new Error('data undefined');
			})
			.catch(() => defaultNetworkSettingsData);

		const loadGS = loadData(defaultSettingKeys.GS)
			.then((x: StorageLoad) => {
				if (x.data !== undefined) return x.data;
				throw new Error('data undefined');
			})
			.catch(() => defaultGoogleSheetsSettingsData);

		const loadXPN = loadData(defaultSettingKeys.XPN)
			.then((x: StorageLoad) => {
				if (x.data !== undefined) return x.data;
				throw new Error('data undefined');
			})
			.catch(() => defaultXpnSettingsData);

		await Promise.all([loadNetwork, loadGS, loadXPN]).then((values) => {
			const [newNetwork, newGS, newXPN] = values;
			network = { ...network, ...newNetwork } as NetworkSettingsData;
			gs = { ...gs, ...newGS } as GoogleSheetsSettingsData;
			xpn = { ...xpn, ...newXPN } as XpnSettingsData;

			return resolve({
				loaded,
				network,
				gs,
				xpn,
			});
		});
	});

export const saveData = async (key: SettingsKeys, data: StorageData) =>
	new Promise<StorageSave>(async (resolve) => {
		localStorage.setItem(`rsl.${key}`, encodeUnicode(JSON.stringify(data)));
		return resolve({ key, data });
	});

export const saveSettings = async (data: SettingsStoreState) =>
	new Promise<SettingsStoreState>(async (resolve) => {
		const loaded: boolean = true;
		let network: NetworkSettingsData = defaultNetworkSettingsData;
		let gs: GoogleSheetsSettingsData = defaultGoogleSheetsSettingsData;
		let xpn: XpnSettingsData = defaultXpnSettingsData;

		const saveNetwork = saveData(defaultSettingKeys.Network, data.network as NetworkSettingsData)
			.then((x: StorageSave) => {
				if (x.data !== undefined) return x.data;
				throw new Error('data undefined');
			})
			.catch(() => data.network);

		const saveGS = saveData(defaultSettingKeys.GS, data.gs as GoogleSheetsSettingsData)
			.then((x: StorageSave) => {
				if (x.data !== undefined) {
					clearGoogleCache(); // Something in GS settings changed so clear the cache
					return x.data;
				}
				throw new Error('data undefined');
			})
			.catch(() => data.gs);

		const saveXPN = saveData(defaultSettingKeys.XPN, data.xpn as XpnSettingsData)
			.then((x: StorageSave) => {
				if (x.data !== undefined) return x.data;
				throw new Error('data undefined');
			})
			.catch(() => data.xpn);

		await Promise.allSettled([saveNetwork, saveGS, saveXPN]).then((values) => {
			const [newNetwork, newGS, newXPN] = values;
			network = { ...network, ...newNetwork } as NetworkSettingsData;
			gs = { ...gs, ...newGS } as GoogleSheetsSettingsData;
			xpn = { ...xpn, ...newXPN } as XpnSettingsData;

			return resolve({
				loaded,
				network,
				gs,
				xpn,
			});
		});
	});

export const removeData = (key: SettingsKeys) => localStorage.removeItem(`rsl.${key}`);

export const removeSettings = async () =>
	new Promise<SettingsStoreState>(async (resolve) => {
		removeData(defaultSettingKeys.Network);
		removeData(defaultSettingKeys.XPN);
		removeData(defaultSettingKeys.GS);
		clearGoogleCache(); // Clear the google sheets cache

		return resolve({
			loaded: true,
			network: defaultNetworkSettingsData,
			xpn: defaultXpnSettingsData,
			gs: defaultGoogleSheetsSettingsData,
		});
	});

// Export all under default
export default {
	loadData,
	loadSettings,
	saveData,
	saveSettings,
	removeData,
	removeSettings,
};
