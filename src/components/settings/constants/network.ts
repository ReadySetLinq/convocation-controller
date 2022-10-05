import { object, number, string } from 'yup';

import { NetworkSettingsData } from '../interfaces/network';

export const defaultNetworkSettingsData: NetworkSettingsData = {
	id: '',
	ip: '192.168.1.53',
	port: 8080,
	userName: 'brtf',
	password: '',
};

export const networkSettingsSchema = object({
	id: string().default(defaultNetworkSettingsData.id).defined(),
	ip: string().trim().min(1, 'IP to short!').required('IP Required!'),
	port: number()
		.integer('Port must be a number!')
		.min(0, 'Port must be a number 0 or above!')
		.max(65535, 'Port must be a number less than 65535!')
		.required('Port Required!'),
	userName: string().trim().min(1, 'Username to short!').required('Username Required!'),
	password: string().trim().min(1, 'Password to short!').required('Password Required!'),
}).defined();
