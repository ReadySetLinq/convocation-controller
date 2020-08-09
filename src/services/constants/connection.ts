import { ConnectionState } from '../interfaces/connection';

export const defaultConnectionMessage = 'A network connection is required!';

export const defaultConnectionState: ConnectionState = {
	connected: false,
	connecting: false,
	displayMsg: defaultConnectionMessage,
};
