import * as yup from 'yup';

import { GoogleSheets } from '../interfaces/google-sheets';

export const defaultGoogleSheet: GoogleSheets = {
	id: '',
	GoogleSheetsID: '',
	StudentID: 'ID',
	Name_Column: 'Name',
	Extra_Column: 'Dipl Program Descr',
	Multiplier_Column: 'Multiplier',
	Division_Column: 'Division',
	OrderBy: '',
};

export const googleSheetsSettingsSchema: yup.ObjectSchema<GoogleSheets> = yup
	.object({
		id: yup.string().default(defaultGoogleSheet.id).defined(),
		GoogleSheetsID: yup.string().trim().min(10, 'GoogleSheetsID to short!').required('GoogleSheetsID Column Required!'),
		StudentID: yup.string().trim().min(1, 'StudentID to short!').required('StudentID Column Required!'),
		Name_Column: yup.string().trim().min(1, 'Name Column to short!').required('Name Column Required!'),
		Extra_Column: yup
			.string()
			.trim()
			.default(defaultGoogleSheet.Extra_Column ?? '')
			.defined(),
		Multiplier_Column: yup
			.string()
			.trim()
			.default(defaultGoogleSheet.Multiplier_Column ?? '')
			.defined(),
		Division_Column: yup
			.string()
			.trim()
			.default(defaultGoogleSheet.Division_Column ?? '')
			.defined(),
		OrderBy: yup
			.string()
			.default(defaultGoogleSheet.OrderBy ?? '')
			.defined(),
	})
	.defined();
