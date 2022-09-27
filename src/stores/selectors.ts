import { atom } from 'jotai';

import { sortBy, isEqual, isEmpty, filter } from 'lodash';

import { settingsState, studentsState } from './atoms';
import { getDataValue } from '../services/utilities';

import { defaultProgramName } from './constants/student-store';
import { GoogleSheetsSettingsData } from '../components/settings/interfaces/google-sheets';
import { NetworkSettingsData } from '../components/settings/interfaces/network';
import { XpnSettingsData } from '../components/settings/interfaces/xpression';
import { StudentsStoreState } from './interfaces/student-store';

// Settings
export const loadedSettings = atom((get) => get(settingsState).loaded);

export const googleSheetsSettings = atom((get) => get(settingsState).gs);

export const xpnSettings = atom((get) => get(settingsState).xpn);

export const networkSettings = atom((get) => get(settingsState).network);

export const setLoadedSettings = atom(null, (get, set, item: boolean) =>
	set(settingsState, { ...get(settingsState), loaded: item }),
);

export const setGoogleSheetsSettings = atom(null, (get, set, item: GoogleSheetsSettingsData) =>
	set(settingsState, { ...get(settingsState), gs: item }),
);

export const setNetworkSettings = atom(null, (get, set, item: NetworkSettingsData) =>
	set(settingsState, { ...get(settingsState), network: item }),
);

export const setXPNSettings = atom(null, (get, set, item: XpnSettingsData) =>
	set(settingsState, { ...get(settingsState), xpn: item }),
);

// Students
export const programName = atom((get) => get(studentsState).programName);

export const studentsFromProgram = atom((get) => {
	const program: string = get(programName) ?? '';
	const { students } = get(studentsState);
	const { Extra_Column } = get(settingsState).gs;

	if (students.length === 0) return [];
	if (Extra_Column === undefined || Extra_Column.trim().length === 0) return [];

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
	//if (isEmpty(OrderBy)) return filteredStudents;
	if (isEmpty(OrderBy) || OrderBy === undefined) return sortBy(filteredStudents, 'gs_id');

	return sortBy(filteredStudents, OrderBy.split(','));
});

export const getProgramStudentsLength = atom((get) => get(studentsFromProgram).length);

export const setStudentsState = atom(null, (get, set, item: StudentsStoreState) =>
	set(studentsState, { ...get(studentsState), ...item }),
);
