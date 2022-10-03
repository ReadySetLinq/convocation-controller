import { Dispatch, SetStateAction } from 'react';

import { DisplayState } from '../interface/display';

export type LoginState = {
	username: string;
	password: string;
};

export const initialLogin: LoginState = {
	username: '',
	password: '',
};

export type LoginProps = {
	state: DisplayState;
	setState: Dispatch<SetStateAction<DisplayState>>;
};
