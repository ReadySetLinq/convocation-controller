import React, { memo, useState, useCallback, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Button, FormControl, FormGroup, TextField, InputAdornment } from '@material-ui/core';
import { isEqual, includes, findIndex } from 'lodash';
import { generate } from 'shortid';

import { useStyles } from '../../services/constants/styles';
import { settingsState, studentsState } from '../../stores/atoms';
import { getProgramStudents, getProgramStudentsLength } from '../../stores/selectors';

import { StudentDisplayData } from './interfaces/student-display';

const StudentDisplay: React.FC<StudentDisplayData> = ({ getStudent }) => {
	const styles = useStyles();
	const settingsStore = useRecoilValue(settingsState);
	const [studentsStore, setStudentsStore] = useRecoilState(studentsState);
	const students = useRecoilValue(getProgramStudents(studentsStore.programName));
	const studentsLength = useRecoilValue(getProgramStudentsLength(studentsStore.programName));
	const [searchError, setSearchError] = useState('');
	const lastIndex = studentsStore.selectedIndex - 1;
	const nextIndex = studentsStore.selectedIndex + 1;
	const lastStudent = getStudent(lastIndex);
	const currentStudent = getStudent(studentsStore.selectedIndex);
	const nextStudent = getStudent(nextIndex);

	const onSetSelectedID = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			const value: string = event.currentTarget.value;

			setStudentsStore((oldStore) => ({ ...oldStore, selectedStudentID: value }));
			setSearchError('');
		},
		[setStudentsStore],
	);

	const onDecrease = useCallback(() => {
		const newIndex: number = studentsStore.selectedIndex - 1 >= -1 ? studentsStore.selectedIndex - 1 : -1;

		setStudentsStore((oldStore) => ({ ...oldStore, selectedIndex: newIndex }));
	}, [setStudentsStore, studentsStore.selectedIndex]);

	const onIncrease = useCallback(() => {
		const newIndex: number = studentsStore.selectedIndex + 1;

		setStudentsStore((oldStore) => ({ ...oldStore, selectedIndex: newIndex }));
	}, [setStudentsStore, studentsStore.selectedIndex]);

	const onSetIndex = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			let _newValue = event.currentTarget.value;
			let newIndex = -1;

			if (!isEqual(_newValue, '')) {
				if (includes(_newValue, '-')) {
					newIndex = -1;
				} else {
					newIndex = Number(_newValue);
					if (newIndex < -1) newIndex = -1;
					else if (newIndex >= studentsLength) newIndex = studentsLength - 1;
					else newIndex = newIndex - 1;
				}
			} else {
				newIndex = -1;
			}

			setStudentsStore((oldStore) => ({ ...oldStore, selectedIndex: newIndex }));
		},
		[studentsLength, setStudentsStore],
	);

	const onSearch = useCallback(() => {
		const studentIdColumn = settingsStore.gs.StudentID;
		const idx = findIndex(students, {
			[studentIdColumn]: studentsStore.selectedStudentID,
		});

		if (idx < 0) {
			// Student was not found
			setSearchError('No match found in the selected program!');
			return;
		}

		// Student was found in current program
		setStudentsStore((oldStore) => ({ ...oldStore, selectedIndex: idx, selectedStudentID: '' }));
		setSearchError('');
		return;
	}, [students, setStudentsStore, settingsStore.gs.StudentID, studentsStore.selectedStudentID]);

	useEffect(() => {
		// Reset the search error anytime the program changes
		setSearchError('');
	}, [studentsStore.programName]);

	return (
		<FormControl component='fieldset' className={styles.formControl}>
			<FormGroup row className={styles.formGroup}>
				<TextField
					id={`SelectedIndex-${generate()}`}
					className={styles.formTextField}
					type='number'
					name='SelectedIndex'
					variant='standard'
					label='Selected Student Index'
					placeholder='0'
					helperText={`${nextIndex}/${studentsLength}`}
					value={nextIndex}
					onChange={onSetIndex}
					disabled={studentsStore.switching || studentsLength === 0 ? true : false}
					InputProps={{
						startAdornment: (
							<InputAdornment position='start'>
								<Button
									id={`DecreaseIndex-${generate()}`}
									variant='text'
									color={studentsStore.switching ? 'default' : 'secondary'}
									size='small'
									name='DecreaseIndex'
									aria-label='Decrease Index'
									onClick={onDecrease}
									disabled={studentsStore.switching || studentsStore.selectedIndex < 0 ? true : false}
								>
									-
								</Button>
							</InputAdornment>
						),
						endAdornment: (
							<InputAdornment position='end'>
								<Button
									id={`IncreaseIndex-${generate()}`}
									variant='text'
									color={studentsStore.switching ? 'default' : 'primary'}
									size='small'
									name='IncreaseIndex'
									aria-label='Increase Index'
									onClick={onIncrease}
									disabled={studentsStore.switching || nextIndex >= studentsLength ? true : false}
								>
									+
								</Button>
							</InputAdornment>
						),
					}}
				/>
			</FormGroup>

			<FormGroup row className={styles.formGroup}>
				<TextField
					id={`SelectedIndex-${generate()}`}
					className={styles.formTextField}
					type='text'
					name='SelectedIndex'
					variant='standard'
					label='Search For Student ID'
					placeholder='[None]'
					value={studentsStore.selectedStudentID}
					helperText={searchError}
					error={searchError.length > 0}
					onChange={onSetSelectedID}
					disabled={studentsStore.switching || studentsLength === 0 ? true : false}
					InputProps={{
						endAdornment: (
							<InputAdornment position='end'>
								<Button
									id={`SelectedIndexSearch-${generate()}`}
									variant='outlined'
									color={studentsStore.switching ? 'default' : 'primary'}
									size='small'
									name='SelectedIndexSearch'
									aria-label='Search'
									onClick={onSearch}
									disabled={studentsStore.switching || nextIndex >= studentsLength ? true : false}
								>
									Search
								</Button>
							</InputAdornment>
						),
					}}
				/>
			</FormGroup>

			<FormGroup row className={styles.formGroup}>
				<FormGroup>
					<TextField
						id={`lastStudent-${generate()}`}
						className={styles.formTextField}
						type='text'
						name='lastStudent'
						variant='outlined'
						value={lastStudent}
						title={lastStudent}
						aria-label={`Last Student was ${lastStudent}`}
						placeholder='[None]'
						InputProps={{
							startAdornment: <InputAdornment position='start'>Last Student:</InputAdornment>,
							readOnly: true,
						}}
					/>

					<TextField
						id={`currentStudent-${generate()}`}
						className={styles.formTextField}
						type='text'
						name='currentStudent'
						variant='outlined'
						value={currentStudent}
						title={currentStudent}
						aria-label={`Current Student is ${currentStudent}`}
						placeholder='[None]'
						InputProps={{
							startAdornment: <InputAdornment position='start'>Current Student:</InputAdornment>,
							readOnly: true,
						}}
					/>

					<TextField
						id={`nextStudent-${generate()}`}
						className={styles.formTextField}
						type='text'
						name='nextStudent'
						variant='outlined'
						value={nextStudent}
						title={nextStudent}
						aria-label={`Next Student will be ${nextStudent}`}
						placeholder='[None]'
						InputProps={{
							startAdornment: <InputAdornment position='start'>Next Student:</InputAdornment>,
							readOnly: true,
						}}
					/>
				</FormGroup>
			</FormGroup>
		</FormControl>
	);
};

export default memo(StudentDisplay, isEqual);
