import { generate } from 'shortid';

import { StudentData, StudentsStoreState } from '../interfaces/student-store';

export const defaultStudentData: StudentData = {
	id: generate(),
	name: '',
	extra: '',
	multiplyer: 0,
	displayName: '',
};

export const defaultProgramName = '[Select A Program]';

export const defaultStudentsStoreState: StudentsStoreState = {
	isLoading: true,
	xpnStarted: false,
	ctrlStarted: false,
	isExtraOnline: false,
	isOnline: false,
	students: [],
	programName: defaultProgramName,
	programs: [defaultProgramName],
	selectedIndex: -1,
	selectedStudentID: '',
	lastProgram: '',
	switching: false,
};
