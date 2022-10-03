import { ConnectionStoreState } from '../interfaces/connection-store';

export const defaultConnectionMessage = 'A network connection is required!';

export const defaultConnectionStoreState: ConnectionStoreState = {
	connected: false,
	connecting: false,
	displayMsg: defaultConnectionMessage,
};
