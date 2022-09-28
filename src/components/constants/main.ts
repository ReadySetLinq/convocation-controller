import { MainState } from '../interface/main';

export const initialMainState: MainState = {
	loggedIn: false,
	loginError: '',
	navActiveKey: 'settings',
};

export const Login = (username: string, password: string) => {
	return username === 'brtf' && password === 'brtfuser';
};
