import { MainState } from '../interface/main';

export const initialMainState: MainState = {
	loggedIn: false,
	loginError: '',
	navActiveKey: 'settings',
};

export const credentials = {
	username: 'brtf',
	password: 'brtfuser',
};
