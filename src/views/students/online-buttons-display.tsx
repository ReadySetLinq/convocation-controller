import React, { memo, useCallback } from 'react';
import { useAtomValue } from 'jotai/utils';
import { Grid, Button } from '@mui/material';
import { isEqual } from 'lodash';

import { studentsState } from '../../stores/atoms';
import { getProgramStudentsLength } from '../../stores/selectors';

import { OnlineButtonsDisplayData } from './interfaces/online-buttons-display';

const OnlineButtonsDisplay: React.FC<OnlineButtonsDisplayData> = ({
	extraOffline,
	extraOnline,
	studentOffline,
	studentOnline,
}) => {
	const studentsStore = useAtomValue(studentsState);
	const studentsLength = useAtomValue(getProgramStudentsLength);

	const onExtraClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			if (studentsStore.isExtraOnline) extraOffline();
			else extraOnline();
		},
		[studentsStore.isExtraOnline, extraOffline, extraOnline],
	);

	const onStudentClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			if (studentsStore.isOnline) studentOffline();
			else studentOnline(studentsStore.selectedIndex);
		},
		[studentsStore.isOnline, studentsStore.selectedIndex, studentOffline, studentOnline],
	);

	return (
		<Grid container justify='center' spacing={3}>
			<Grid item>
				<Button
					color={studentsStore.isExtraOnline ? 'secondary' : 'primary'}
					variant='contained'
					onClick={onExtraClick}
					disabled={studentsStore.switching || studentsLength === 0 ? true : false}
				>
					{studentsStore.isExtraOnline ? 'Force Extra Offline' : 'Force Extra Online'}
				</Button>
			</Grid>
			<Grid item>
				<Button
					color={studentsStore.isOnline ? 'secondary' : 'primary'}
					variant='contained'
					onClick={onStudentClick}
					disabled={studentsStore.switching || studentsLength === 0 ? true : false}
				>
					{studentsStore.isOnline ? 'Force Student Offline' : 'Force Student Online'}
				</Button>
			</Grid>
		</Grid>
	);
};

export default memo(OnlineButtonsDisplay, isEqual);
