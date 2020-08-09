import { selectorFamily } from 'recoil';
import { sortBy, isEqual, filter } from 'lodash';

import { settingsState, studentsState } from './atoms';
import { getDataValue } from '../services/utilities';

import { defaultProgramName } from './constants/student-store';

// Students
export const studentsFromProgram = selectorFamily({
	key: 'studentsFromProgram',
	get: (program) => ({ get }) => {
		const programName: string = program ? program.toString() : '';
		const { students } = get(studentsState);
		const { Extra_Column } = get(settingsState).gs;

		if (students.length === 0) return [];
		if (Extra_Column.trim().length === 0) return [];

		return filter(students, (student) => {
			return isEqual(programName?.toString(), getDataValue(student, Extra_Column));
		});
	},
});

export const getProgramStudents = selectorFamily({
	key: 'getProgramStudents',
	get: (program) => ({ get }) => {
		const programName = program?.toString().trim();
		const { OrderBy } = get(settingsState).gs;

		if (programName === undefined || programName.length === 0) return [];
		if (isEqual(programName, defaultProgramName)) return [];

		const filteredStudents = get(studentsFromProgram(programName));

		if (filteredStudents.length === 0) return [];
		if (OrderBy.length === 0) return filteredStudents;

		return sortBy(filteredStudents, OrderBy.split(','));
	},
});

export const getProgramStudentsLength = selectorFamily({
	key: 'getProgramStudentsLength',
	get: (program) => ({ get }) => {
		const programName = program?.toString().trim();

		if (programName === undefined) return 0;

		return get(studentsFromProgram(programName)).length;
	},
});
