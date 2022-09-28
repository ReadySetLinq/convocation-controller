import { Dispatch, SetStateAction } from 'react';

import { MainState } from '../interface/main';

export type LoginState = {
	username: string;
	password: string;
};

export const initialLogin: LoginState = {
	username: '',
	password: '',
};

export type LoginProps = {
	state: MainState;
	setState: Dispatch<SetStateAction<MainState>>;
};
