import { decodeUnicode, encodeUnicode } from './utilities';

import { StorageLoad, StorageSave, StorageData, SettingsKeys } from './interfaces/storage';

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

export const saveData = async (key: SettingsKeys, data: StorageData) =>
	new Promise<StorageSave>(async (resolve) => {
		localStorage.setItem(`rsl.${key}`, encodeUnicode(JSON.stringify(data)));
		return resolve({ key, data });
	});

export const removeData = (key: SettingsKeys) => localStorage.removeItem(`rsl.${key}`);

// Export all under default
export default {
	loadData,
	saveData,
	removeData,
};
