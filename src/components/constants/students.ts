import { generate } from 'shortid';

import { editTakeItemProps } from '../interface/students';

export const defaultEditTakeItemProps: editTakeItemProps = {
	uuid: generate(),
	propName: '',
	takeID: -1,
	objName: '',
	value: '',
};

export const loadingStates = [
	'Checking settings...',
	'Loading Student Data...',
	'Processing Student Data...',
	'Resetting Student Data...',
	'',
];
