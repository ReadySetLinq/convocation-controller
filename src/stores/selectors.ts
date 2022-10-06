import { atom } from 'jotai';

import { sortBy, isEqual, isEmpty, filter } from 'lodash';

import { settingsState, studentsState, connectionState } from './atoms';
import { getDataValue } from '../services/utilities';
import { clearGoogleCache } from '../services/google-sheets';

import { defaultProgramName } from './constants/student-store';

import { SettingsStoreState } from '../components/settings/interfaces/settings';
import { GoogleSheetsSettingsData } from '../components/settings/interfaces/google-sheets';
import { NetworkSettingsData } from '../components/settings/interfaces/network';
import { XpnSettingsData } from '../components/settings/interfaces/xpression';
import { StudentsStoreState } from './interfaces/student-store';

// Connection
export const isConnected = atom((get) => get(connectionState).connected);

export const isConnecting = atom((get) => get(connectionState).connecting);

export const connectionMessage = atom((get) => get(connectionState).displayMsg);

export const setConnected = atom(null, (get, set, item: boolean) => {
	const data = item ? { connected: true, connecting: false } : { connected: false };
	return set(connectionState, { ...get(connectionState), ...data });
});

export const setIsConnecting = atom(null, (get, set, item: boolean) => {
	const data = item ? { connecting: true, connected: false } : { connecting: false };
	return set(connectionState, { ...get(connectionState), ...data });
});

export const setConnectionMessage = atom(null, (get, set, item: string) =>
	set(connectionState, { ...get(connectionState), ...{ displayMsg: item } }),
);

// Settings
export const loadedSettings = atom((get) => get(settingsState).loaded);

export const googleSheetsSettings = atom((get) => get(settingsState).gs);

export const xpnSettings = atom((get) => get(settingsState).xpn);

export const networkSettings = atom((get) => get(settingsState).network);

export const setLoadedSettings = atom(null, (get, set, item: boolean) =>
	set(settingsState, { ...get(settingsState), loaded: item }),
);

export const setGoogleSheetsSettings = atom(null, async (get, set, item: GoogleSheetsSettingsData) => {
	const oldSettings = get(settingsState) as SettingsStoreState;
	if (item.GoogleSheetsID !== oldSettings.gs.GoogleSheetsID) {
		await clearGoogleCache();
	}
	return set(settingsState, { ...oldSettings, gs: item });
});

export const setNetworkSettings = atom(null, (get, set, item: NetworkSettingsData) =>
	set(settingsState, { ...(get(settingsState) as SettingsStoreState), network: item }),
);

export const setXPNSettings = atom(null, (get, set, item: XpnSettingsData) =>
	set(settingsState, { ...(get(settingsState) as SettingsStoreState), xpn: item }),
);

// Students
export const programName = atom((get) => get(studentsState).programName);

export const studentsFromProgram = atom((get) => {
	const program: string = get(programName) ?? '';
	const { students } = get(studentsState);
	const { Extra_Column } = get(settingsState).gs;

	if (students.length === 0) return [];
	if (Extra_Column === null || Extra_Column.trim().length === 0) return [];

	return filter(students, (student) => {
		return isEqual(program.toString(), getDataValue(student, Extra_Column));
	});
});

export const getProgramStudents = atom((get) => {
	const program: string = get(programName) ?? '';
	const { OrderBy } = get(settingsState).gs;

	if (program === undefined || program.length === 0) return [];
	if (isEqual(program, defaultProgramName)) return [];

	const filteredStudents = get(studentsFromProgram);

	if (isEmpty(filteredStudents)) return [];
	if (isEmpty(OrderBy) || OrderBy === null) return sortBy(filteredStudents, 'gs_id');

	return sortBy(filteredStudents, OrderBy.split(','));
});

export const getProgramStudentsLength = atom((get) => get(studentsFromProgram).length);

export const setStudentsState = atom(null, (get, set, item: StudentsStoreState) =>
	set(studentsState, { ...get(studentsState), ...item }),
);
