import * as yup from 'yup';

import { Network } from '../interfaces/network';

export const defaultNetwork: Network = {
	id: '',
	ip: 'localhost',
	port: 8080,
	userName: '',
	password: '',
};

export const networkSettingsSchema: yup.ObjectSchema<Network> = yup
	.object({
		id: yup.string().default(defaultNetwork.id).defined(),
		ip: yup.string().trim().min(1, 'IP to short!').required('IP Required!'),
		port: yup
			.number()
			.integer('Port must be a number!')
			.min(0, 'Port must be a number 0 or above!')
			.max(65535, 'Port must be a number less than 65535!')
			.required('Port Required!'),
		userName: yup.string().trim().min(1, 'Username to short!').required('Username Required!'),
		password: yup.string().trim().min(1, 'Password to short!').required('Password Required!'),
	})
	.defined();
