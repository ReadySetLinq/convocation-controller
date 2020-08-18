export interface StudentData {
	id: string | number;
	name: string;
	extra: string;
	multiplier: number;
	displayName: string;
}

export interface StudentsStoreState {
	isLoading: boolean;
	loggedIn: boolean;
	ctrlStarted: boolean;
	isExtraOnline: boolean;
	isOnline: boolean;
	students: any[];
	programName: string;
	programs: string[];
	selectedIndex: number;
	selectedStudentID: string;
	lastProgram: string;
	switching: boolean;
}

export interface StudentsStorage {
	programName: string;
	selectedIndex: number;
	selectedStudentID: string;
	lastProgram: string;
}
