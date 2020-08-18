import React, { memo, useState, useCallback, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
	Button,
	FormControl,
	FormGroup,
	TextField,
	InputAdornment,
	TableContainer,
	Paper,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	TableFooter,
	TablePagination,
} from '@material-ui/core';
import { isEqual, includes, findIndex, isEmpty } from 'lodash';
import { generate } from 'shortid';

import { useStyles } from '../../services/constants/styles';
import { settingsState, studentsState } from '../../stores/atoms';
import { getProgramStudents, getProgramStudentsLength } from '../../stores/selectors';
import { PaginationTableActions } from '../pagination-table';

import { StudentDisplayData } from './interfaces/student-display';
import { StudentData } from '../../stores/interfaces/student-store';

const StudentDisplay: React.FC<StudentDisplayData> = ({ getStudentData }) => {
	const styles = useStyles();
	const settingsStore = useRecoilValue(settingsState);
	const [studentsStore, setStudentsStore] = useRecoilState(studentsState);
	const students = useRecoilValue(getProgramStudents(studentsStore.programName));
	const studentsLength = useRecoilValue(getProgramStudentsLength(studentsStore.programName));
	const [searchError, setSearchError] = useState('');
	const [page, setPage] = useState(0);
	const rowsPerPage = 10;
	const nextIndex = studentsStore.selectedIndex + 1;
	const selectedStudent = getStudentData(students[studentsStore.selectedIndex]);

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

	const handleChangePage = useCallback((event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
		setPage(newPage);
	}, []);

	useEffect(() => {
		// Reset the search error anytime the program changes
		setSearchError('');
	}, [studentsStore.programName]);

	useEffect(() => {
		// Make sure we are always on the correct page based on the new selected index
		if (studentsStore.selectedIndex === -1) {
			setPage(0);
		} else {
			let newPage = 0;
			if (studentsStore.selectedIndex > 0) newPage = (studentsStore.selectedIndex / rowsPerPage) | 0;
			if (newPage !== page) setPage(newPage);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [studentsStore.selectedIndex]);

	useEffect(() => {
		// Program changed so reset page to 9=0
		setPage(0);
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

			<TableContainer component={Paper}>
				<Table className={styles.table} aria-label='custom pagination table'>
					<TableHead>
						<TableRow>
							<TableCell className={styles.tableHeader} aria-label='ID' align='left'>
								ID
							</TableCell>
							<TableCell className={styles.tableHeader} aria-label='Display Name' align='center'>
								Name
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((student: StudentData) => {
							const studentDisplay = getStudentData(student);
							if (isEmpty(studentDisplay)) return <></>;

							return (
								<TableRow
									key={`${studentDisplay.id}-${studentDisplay.displayName}`}
									selected={studentDisplay.id === selectedStudent.id}
								>
									<TableCell aria-label={studentDisplay.id.toString()} align='left' component='th' scope='row'>
										{studentDisplay.id}
									</TableCell>
									<TableCell aria-label={studentDisplay.displayName} align='center'>
										{studentDisplay.displayName}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TablePagination
								rowsPerPageOptions={[10]}
								colSpan={3}
								count={studentsLength}
								rowsPerPage={rowsPerPage}
								page={page}
								SelectProps={{
									inputProps: { 'aria-label': 'rows per page' },
									native: true,
								}}
								onChangePage={handleChangePage}
								ActionsComponent={PaginationTableActions}
							/>
						</TableRow>
					</TableFooter>
				</Table>
			</TableContainer>
		</FormControl>
	);
};

export default memo(StudentDisplay, isEqual);
