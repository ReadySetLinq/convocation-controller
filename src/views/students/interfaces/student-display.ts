import { StudentData } from '../../../stores/interfaces/student-store';

export interface StudentDisplayData {
	getStudentData: (student?: any) => StudentData;
}
