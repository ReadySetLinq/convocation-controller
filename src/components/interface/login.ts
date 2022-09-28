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

export const hashed = '$2a$10$5pqVQ.vyVwVrC6/5M09tSOmOnGMHhcjCePuqPVOx1OzJB.QuBhIl.';
