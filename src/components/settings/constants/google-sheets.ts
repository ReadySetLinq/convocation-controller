import { object, number, string } from 'yup';

import { GoogleSheetsSettingsData } from '../interfaces/google-sheets';

export const defaultGoogleSheetsSettingsData: GoogleSheetsSettingsData = {
	id: '',
	GoogleSheetsID: '2PACX-1vTl1NfHLUoYlsQkHlaqyjNV9LdRT5PAkmrYcwajaRr-cuAcTLikSwakn4PQ3Vzp_A',
	StudentID: 'ID',
	Name_Column: 'Name for Credential',
	Extra_Column: 'Dipl Program Descr',
	Multiplier_Column: 'Multiplier',
	Division_Column: 'Division',
	OrderBy: '',
};

export const googleSheetsSettingsSchema = object({
	id: string().default(defaultGoogleSheetsSettingsData.id).defined(),
	GoogleSheetsID: string().trim().min(10, 'GoogleSheetsID to short!').required('GoogleSheetsID Column Required!'),
	StudentID: string().trim().min(1, 'StudentID to short!').required('StudentID Column Required!'),
	Name_Column: string().trim().min(1, 'Name Column to short!').required('Name Column Required!'),
	Extra_Column: string()
		.trim()
		.default(defaultGoogleSheetsSettingsData.Extra_Column ?? '')
		.defined(),
	Multiplier_Column: string()
		.trim()
		.default(defaultGoogleSheetsSettingsData.Multiplier_Column ?? '')
		.defined(),
	Division_Column: string()
		.trim()
		.default(defaultGoogleSheetsSettingsData.Division_Column ?? '')
		.defined(),
	OrderBy: string()
		.default(defaultGoogleSheetsSettingsData.OrderBy ?? '')
		.defined(),
}).defined();
