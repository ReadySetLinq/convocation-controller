import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Grid, Button } from '@material-ui/core';
import { isEqual, isEmpty, sortBy, filter, findIndex } from 'lodash';
import { generate } from 'shortid';

import { settingsState, studentsState } from '../stores/atoms';
import { getProgramStudents, getProgramStudentsLength } from '../stores/selectors';
import Emitter from '../services/emitter';
import NetworkConnection from '../views/network-connection';
import { useStyles } from '../services/constants/styles';
import { getDataValue } from '../services/utilities';
import { gsData, clearGoogleCache } from '../services/google-sheets';
import LoadingSpinner from '../views/loading-spinner';
import { StudentDisplay, ProgramsDisplay, OnlineButtonsDisplay } from '../views/students';

// Import Interfaces
import { StudentData } from '../stores/interfaces/student-store';
import { editTakeItemProps } from './interface/students';
import { ConnectionState } from '../services/interfaces/connection';
import { XPN_TakeItem_Data } from '../services/interfaces/xpn-events';
import { gsObject } from '../services/interfaces/google-sheets';

import { defaultEditTakeItemProps, loadingStates } from './constants/students';
import { defaultConnectionState } from '../services/constants/connection';
import { defaultProgramName, defaultStudentData } from '../stores/constants/student-store';

const Students = () => {
	const styles = useStyles();
	const settingsStore = useRecoilValue(settingsState);
	const [connectionState, setConnectionState] = useState<ConnectionState>(defaultConnectionState);
	const [studentsStore, setStudentsStore] = useRecoilState(studentsState);
	const students = useRecoilValue(getProgramStudents(studentsStore.programName));
	const studentsLength = useRecoilValue(getProgramStudentsLength(studentsStore.programName));
	const lastIndex = studentsStore !== undefined ? studentsStore.selectedIndex - 1 : -1;
	const nextIndex = studentsStore !== undefined ? studentsStore.selectedIndex + 1 : 1;
	let prevStudentsStore = useRef(studentsStore);
	let isMounted = useRef<boolean>(false); // Only update states if we are still mounted after loading
	let loadStatus = useRef<number>(0);

	const editTakeItemProperty = (props: editTakeItemProps) => {
		Emitter.emit('xpn.EditTakeItemProperty', {
			...defaultEditTakeItemProps,
			...props,
		});
	};

	const getStudentData = useCallback(
		(student: any = {}) => {
			const {
				xpn: { Name, Extra, Multiplier },
				gs: { StudentID, Name_Column, Extra_Column, Multiplier_Column },
			} = settingsStore;

			const _id = isEmpty(StudentID) ? generate() : String(getDataValue(student, StudentID));

			const _name =
				isEmpty(Name) || isEmpty(Name_Column)
					? defaultStudentData.name
					: String(getDataValue(student, Name_Column)).replace('*', '').trim();

			const _extra =
				isEmpty(Extra) || isEmpty(Extra_Column)
					? defaultStudentData.extra
					: String(getDataValue(student, Extra_Column)).replace('*', '').trim();

			const _multiplyer = Number.parseInt(
				isEmpty(Multiplier) || isEmpty(Multiplier_Column)
					? defaultStudentData.multiplyer
					: getDataValue(student, Multiplier_Column),
			);

			const _displayName = !isEmpty(_extra)
				? _multiplyer > 0
					? `(x${_multiplyer}) ${_name}`
					: _name
				: _multiplyer > 0
				? `(x${_multiplyer}) ${_name}`
				: _name;

			const studentData: StudentData = {
				...defaultStudentData,
				id: _id,
				name: _name,
				extra: _extra,
				multiplyer: !isNaN(_multiplyer) ? _multiplyer : defaultStudentData.multiplyer,
				displayName: String(_displayName).trim(),
			};

			return studentData;
		},
		[settingsStore],
	);

	const updateStudent = useCallback(
		(student: any = {}, callback: Function = () => {}) => {
			if (!isMounted.current) return;
			const { ExtraTakeID, TakeID, Name, Extra, Multiplier } = settingsStore.xpn;
			const _student = getStudentData(student);

			if (!isEmpty(Name)) {
				// Edit their name
				editTakeItemProperty({
					takeID: TakeID,
					objName: Name,
					value: _student.name,
				});
			}

			if (!isEmpty(Extra)) {
				// Edit their "extra" info
				editTakeItemProperty({
					takeID: ExtraTakeID === -1 ? TakeID : ExtraTakeID,
					objName: Extra,
					value: _student.extra.replace(' (', '\n ('),
				});
			}

			if (!isEmpty(Multiplier)) {
				// Edit their "Multiplier" info
				editTakeItemProperty({
					takeID: TakeID,
					objName: Multiplier,
					value: String(_student.multiplyer),
				});
			}

			callback(_student);
		},
		[getStudentData, settingsStore.xpn],
	);

	const takeExtraOnline = (studentExtra: string = '', callback: Function = () => {}) => {
		if (!isMounted.current) return;
		const { selectedIndex } = studentsStore;
		const { ExtraTakeID, Extra } = settingsStore.xpn;

		// Only take online if ID is greater than or equal to 0, otherwise callback and return
		if (ExtraTakeID === -1) {
			callback({ data: {} });
			return;
		}

		if (!isEmpty(Extra)) {
			if (studentExtra.length === 0) {
				studentExtra = getStudentData(students[selectedIndex !== -1 ? selectedIndex : 0]).extra;
			}
			// Edit their "extra" info
			editTakeItemProperty({
				takeID: ExtraTakeID,
				objName: Extra,
				value: studentExtra.replace(' (', '\n ('),
			});
		}

		const _tmpUUID = `setTakeItemOnline-${generate()}`;

		Emitter.once(_tmpUUID, (data: XPN_TakeItem_Data) => {
			if (!isMounted.current) return;
			if (data.response) setStudentsStore((oldStore) => ({ ...oldStore, isExtraOnline: true }));
			callback({ data });
		});

		// Take the text back online
		Emitter.emit('xpn.SetTakeItemOnline', {
			uuid: _tmpUUID,
			takeID: ExtraTakeID,
		});
	};

	const takeOnline = (callback: Function = () => {}) => {
		if (!isMounted.current) return;
		const { TakeID } = settingsStore.xpn;
		const _tmpUUID = `setTakeItemOnline-${generate()}`;

		Emitter.once(_tmpUUID, (data: XPN_TakeItem_Data) => {
			if (!isMounted.current) return;
			if (data.response) setStudentsStore((oldStore) => ({ ...oldStore, isOnline: true }));
			callback({ data });
		});

		// Take the text back online
		Emitter.emit('xpn.SetTakeItemOnline', {
			uuid: _tmpUUID,
			takeID: TakeID,
		});
	};

	const takeExtraOffline = useCallback(
		(callback: Function = () => {}) => {
			if (!isMounted.current) return;
			const { ExtraTakeID } = settingsStore.xpn;

			// Only take offline if ID is greater than or equal to 0, otherwise callback and return
			if (ExtraTakeID <= 0) {
				callback({});
				return;
			}

			const _tmpUUID = `setTakeItemOffline-${generate()}`;

			Emitter.once(_tmpUUID, (data: XPN_TakeItem_Data) => {
				if (!isMounted.current) return;
				if (data.response) setStudentsStore((oldStore) => ({ ...oldStore, isExtraOnline: false }));
				callback(data);
			});

			// Take the text offline
			Emitter.emit('xpn.SetTakeItemOffline', {
				uuid: _tmpUUID,
				takeID: ExtraTakeID,
			});
		},
		[setStudentsStore, settingsStore.xpn],
	);

	const takeOffline = useCallback(
		(callback: Function = () => {}) => {
			if (!isMounted.current) return;
			const { TakeID } = settingsStore.xpn;
			const _tmpUUID = `setTakeItemOffline-${generate()}`;

			Emitter.once(_tmpUUID, (data: XPN_TakeItem_Data) => {
				if (!isMounted.current) return;
				if (data.response) setStudentsStore((oldStore) => ({ ...oldStore, isOnline: false }));
				callback(data);
			});

			// Take the text offline
			Emitter.emit('xpn.SetTakeItemOffline', {
				uuid: _tmpUUID,
				takeID: TakeID,
			});
		},
		[setStudentsStore, settingsStore.xpn],
	);

	const resetXPNData = useCallback(
		(forceOffline: boolean, callback: Function = () => {}) => {
			if (!isMounted.current) return;
			const { ExtraTakeID, TakeID, Name, Extra, Multiplier } = settingsStore.xpn;

			if (forceOffline) {
				takeOffline();
				takeExtraOffline();
			}

			if (!isEmpty(Name)) {
				// Edit their name
				editTakeItemProperty({
					takeID: TakeID,
					objName: Name,
					value: '',
				});
			}

			if (!isEmpty(Extra)) {
				// Edit their "extra" info
				if (ExtraTakeID !== -1)
					editTakeItemProperty({
						takeID: ExtraTakeID,
						objName: Extra,
						value: '',
					});
				editTakeItemProperty({
					takeID: TakeID,
					objName: Extra,
					value: '',
				});
			}

			if (!isEmpty(Multiplier)) {
				// Edit their "Multiplier" info
				editTakeItemProperty({
					takeID: TakeID,
					objName: Multiplier,
					value: '0',
				});
			}

			callback({ forceOffline });
		},
		[settingsStore.xpn, takeOffline, takeExtraOffline],
	);

	const resetData = useCallback(
		(forceOffline: boolean = true) => {
			if (!isMounted.current) return;

			loadStatus.current = 3;

			setStudentsStore((oldStore) => ({
				...oldStore,
				switching: false,
				selectedIndex: -1,
				selectedStudentID: '',
				autoToNext: false,
				lastProgram: '',
			}));

			resetXPNData(forceOffline, () => {
				loadStatus.current = 4;
			});
		},
		[resetXPNData, setStudentsStore],
	);

	const getStudents = useCallback(
		(forceOffline: boolean = false) => {
			const {
				xpn: { Multiplier },
				gs: { GoogleSheetsID, StudentID, Name_Column, Extra_Column, Multiplier_Column, OrderBy },
			} = settingsStore;

			if (!isMounted.current) return;

			loadStatus.current = 1;

			setStudentsStore((oldStore) => ({
				...oldStore,
				isLoading: true,
				students: [],
				programName: defaultProgramName,
				programs: [defaultProgramName],
				selectedIndex: -1,
				selectedStudentID: '',
				lastProgram: '',
			}));

			gsData(GoogleSheetsID)
				.then((response: gsObject) => {
					if (!isMounted.current) return;
					let _students: any[] = [];
					let _programs: string[] = [defaultProgramName];

					loadStatus.current = 2;

					if (response.errors.length > 0 || response.meta.aborted) {
						setStudentsStore((oldStore) => ({
							...oldStore,
							students: [..._students],
							programs: [..._programs],
							programName: _programs[0],
							isLoading: false,
						}));
						resetData(forceOffline);
						return;
					}

					response.data.forEach((student: any) => {
						if (!isMounted.current) return;
						const _studentsProgram = getDataValue(student, Extra_Column);

						if (!isEmpty(_studentsProgram)) {
							if (!_programs.includes(_studentsProgram)) _programs.push(_studentsProgram);
						}

						if (!isEmpty(student[Extra_Column])) student[Extra_Column] = _studentsProgram;

						if (!isEmpty(Multiplier) && !isEmpty(Multiplier_Column)) {
							// Check for people with the same name and get count
							const _curName = getDataValue(student, Name_Column);
							const _studentID = getDataValue(student, StudentID);
							let _multiple = filter(_students, (s) => {
								return (
									!isEqual(_studentID, getDataValue(s, StudentID)) &&
									isEqual(_curName, getDataValue(s, Name_Column)) &&
									isEqual(_studentsProgram, getDataValue(s, Extra_Column))
								);
							}).length;

							if (_multiple === 1) {
								// If this is the first duplicate, add multipler 1 to the origional name
								const _idx = findIndex(_students, (s) => {
									return (
										!isEqual(_studentID, getDataValue(s, StudentID)) &&
										isEqual(_curName, getDataValue(s, Name_Column)) &&
										isEqual(_studentsProgram, getDataValue(s, Extra_Column))
									);
								});
								// Update existing student with multiple now found
								if (_idx !== -1 && _students[_idx]) _students[_idx][Multiplier_Column] = 1;
							}

							student[Multiplier_Column] = _multiple === 0 ? 0 : _multiple + 1;
						}
						// Add new student
						_students.push(student);
					});

					// OrderBy on our end to make sure its correct as a failsafe
					if (!isEmpty(OrderBy)) _students = sortBy(_students, [...OrderBy.split(',')]);

					if (!isMounted.current) return;

					setStudentsStore((oldStore) => ({
						...oldStore,
						students: [..._students],
						programs: [...sortBy(_programs, ['id'])],
						programName: _programs[0],
						isLoading: false,
					}));
					resetData(forceOffline);
					return;
				})
				.catch((e) => {
					if (!isMounted.current) return;
					console.error(e);
					loadStatus.current = 4;

					setStudentsStore((oldStore) => ({ ...oldStore, isLoading: false }));
				});
		},
		[resetData, setStudentsStore, settingsStore],
	);

	const goToNext = () => {
		if (!isMounted.current) return;

		setStudentsStore((oldStore) => ({ ...oldStore, switching: true }));

		takeOffline(() => {
			if (!isMounted.current) return;
			const nextIndex = studentsStore.selectedIndex + 1;
			const maxIndex = studentsLength;

			if (nextIndex < maxIndex) takeStudentOnline(nextIndex);
			else {
				const _student = students[nextIndex];
				const _studentData = getStudentData(_student);
				const _extra = _studentData.extra;

				if (!studentsStore.isExtraOnline || studentsStore.lastProgram !== _extra) takeExtraOnline(_extra);

				if (!isMounted.current) return;
				setStudentsStore((oldStore) => ({
					...oldStore,
					switching: false,
					lastProgram: _extra,
					selectedIndex: nextIndex,
				}));
			}
		});
	};

	const goToLast = () => {
		if (!isMounted.current) return;

		const { tmrDelay } = settingsStore.xpn;
		const _delay = tmrDelay > 4 ? tmrDelay : 4;

		setStudentsStore((oldStore) => ({ ...oldStore, switching: true }));

		takeOffline(() => {
			if (!isMounted.current) return;
			const lastIndex = studentsStore.selectedIndex - 1;
			const index = lastIndex >= -1 ? lastIndex : -1;

			setStudentsStore((oldStore) => ({ ...oldStore, selectedIndex: index }));
			setTimeout(() => {
				setStudentsStore((oldStore) => ({ ...oldStore, switching: false }));
			}, _delay);
		});
	};

	const takeStudentOnline = (index: number) => {
		if (!isMounted.current) return;
		const { lastProgram } = studentsStore;
		const { tmrDelay } = settingsStore.xpn;
		const _delay = tmrDelay > 4 ? tmrDelay : 4;

		if (index > studentsLength) return;

		const _student = students[index];

		if (_student === undefined || _student === null) return;

		// Wait before taking it back online
		setTimeout(() => {
			if (!isMounted.current) return;
			const _studentData = getStudentData(_student);
			const _extra = _studentData.extra;
			let updateDelay = 4;

			if (lastProgram !== _extra) {
				updateDelay = _delay + 500;
				takeExtraOnline(_extra);
			}

			setTimeout(() => {
				if (!isMounted.current) return;
				updateStudent(_student, () => {
					if (!isMounted.current) return;
					// Wait 250 milliseconds before taking it back online
					setTimeout(() => {
						if (!isMounted.current) return;
						takeOnline(() => {
							if (!isMounted.current) return;
							setStudentsStore((oldStore) => ({
								...oldStore,
								lastProgram: _extra,
								selectedIndex: index,
								switching: false,
							}));
						});
					}, 250);
				});
			}, updateDelay);
		}, _delay);
	};

	const onResetDataClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (!isMounted.current) return;

		resetData();
	};

	const reloadData = () => {
		if (!isMounted.current) return;
		if (connectionState !== undefined && connectionState.connected) {
			clearGoogleCache(); // Clear the google sheets data cache before loading the students again
			getStudents();
		}
	};

	const joinController = useCallback(() => {
		if (!isMounted.current) return;
		if (!studentsStore.ctrlStarted) Emitter.emit('xpn.joinService', 'controller');
	}, [studentsStore.ctrlStarted]);

	const getDisplayStudent = (index = -1) => {
		if (!isMounted.current) return '';
		let _programStudent = undefined;

		if (studentsLength <= 0) return '';
		if (index < 0) return '';

		_programStudent = students[index];

		if (Object.is(_programStudent, undefined)) return '';

		return getStudentData(_programStudent).displayName;
	};

	const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (!isMounted.current) return;

		if (connectionState.connected && studentsStore.xpnStarted && studentsStore.ctrlStarted) {
			if (!event.altKey && !event.shiftKey) {
				switch (event.key) {
					case 'ArrowLeft':
					case '-':
						event.preventDefault();
						if (!isMounted.current) break;

						if (!studentsStore.switching && studentsStore.selectedIndex - 1 >= -1) goToLast();
						break;
					case 'ArrowRight':
					case '=':
						event.preventDefault();
						if (!isMounted.current) break;

						if (!studentsStore.switching && studentsLength !== 0 && studentsStore.selectedIndex + 1 <= studentsLength)
							goToNext();
						break;
					default:
						break;
				}
			}
		}
	};

	useEffect(() => {
		isMounted.current = true;

		Emitter.on('network.connecting', (message: string) =>
			setConnectionState({ connected: false, connecting: true, displayMsg: message }),
		);
		Emitter.on('network.connected', (message: string) =>
			setConnectionState({ connected: true, connecting: false, displayMsg: message }),
		);
		Emitter.on('network.disconnected', (message: string) =>
			setConnectionState({ connected: false, connecting: false, displayMsg: message }),
		);

		Emitter.on('conn.status', ({ connected = false, connecting = false, displayMsg = '' }) =>
			setConnectionState({ connected, connecting, displayMsg }),
		);

		Emitter.on('xpression-started', () => {
			if (!isMounted.current) return;
			setStudentsStore((oldStore) => ({ ...oldStore, xpnStarted: true }));
			prevStudentsStore.current = { ...prevStudentsStore.current, xpnStarted: true };
			joinController();
		});

		Emitter.on('xpression.controllerStarted', () => {
			if (!isMounted.current) return;
			const { ExtraTakeID, TakeID } = settingsStore.xpn;
			setStudentsStore((oldStore) => ({ ...oldStore, ctrlStarted: true }));

			if (prevStudentsStore.current.ctrlStarted) {
				getStudents();
				return;
			} else prevStudentsStore.current = { ...prevStudentsStore.current, ctrlStarted: true };

			// Get initial status
			if (ExtraTakeID !== -1) {
				const _tmpExtraUUID = `getTakeItemStatus-${generate()}`;
				Emitter.once(_tmpExtraUUID, ({ response = false }) => {
					if (isMounted.current) setStudentsStore((oldStore) => ({ ...oldStore, isExtraOnline: response }));
				});

				Emitter.emit('xpn.GetTakeItemStatus', {
					uuid: _tmpExtraUUID,
					takeID: ExtraTakeID,
				});
			}

			const _tmpUUID = `getTakeItemStatus-${generate()}`;
			Emitter.once(_tmpUUID, ({ response = false }) => {
				if (isMounted.current) setStudentsStore((oldStore) => ({ ...oldStore, isOnline: response }));
			});

			Emitter.emit('xpn.GetTakeItemStatus', {
				uuid: _tmpUUID,
				takeID: TakeID,
			});

			getStudents();
		});

		Emitter.emit('conn.getStatus', {});

		// componentWillUnmount
		return () => {
			isMounted.current = false; // Mark as unmounted
			Emitter.off('xpression-started');
			Emitter.off('xpression.controllerStarted');
			Emitter.off('network.connecting');
			Emitter.off('network.connected');
			Emitter.off('network.disconnected');
			Emitter.off('conn.status');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!isMounted.current) return;

		if (!settingsStore.loaded) loadStatus.current = 0;
	}, [settingsStore.loaded]);

	useEffect(() => {
		if (!isMounted.current) return;
		if (studentsStore.programName === prevStudentsStore.current.programName) return;
		else prevStudentsStore.current = { ...prevStudentsStore.current, programName: studentsStore.programName };

		setTimeout(() => {
			resetData(true);
		}, settingsStore.xpn.tmrDelay * 2);
	}, [students, resetData, settingsStore.xpn.tmrDelay, studentsStore.programName]);

	useEffect(() => {
		if (!isMounted.current) return;

		Emitter.emit('conn.updateSettings', settingsStore.network);
	}, [settingsStore.network]);

	if (!settingsStore.loaded)
		return (
			<LoadingSpinner key={`settings.LoadingSpinner-${loadStatus.current}`} label={loadingStates[loadStatus.current]} />
		);

	if (!connectionState.connected)
		return <NetworkConnection key={'students.NetworkConnection'} state={connectionState} />;

	if (studentsStore.isLoading || !studentsStore.xpnStarted || !studentsStore.ctrlStarted)
		return (
			<Grid container className={styles.grid} justify='center' spacing={1}>
				<LoadingSpinner
					key={`settings.LoadingSpinner2-${loadStatus.current}`}
					label={loadingStates[loadStatus.current]}
				/>
			</Grid>
		);

	return (
		<div className={styles.fullWindow} tabIndex={0} onKeyDown={onKeyDown}>
			<Grid container className={styles.grid} justify='center' spacing={1}>
				<Grid item>
					<div className={styles.fullWidth}>
						<Grid container justify='center' spacing={1}>
							<Grid item>
								<Button
									variant='contained'
									color='primary'
									onClick={reloadData}
									disabled={studentsStore.switching ? true : false}
								>
									Reload
								</Button>
							</Grid>
							<Grid item>
								<Button
									variant='contained'
									color='secondary'
									onClick={onResetDataClick}
									disabled={studentsStore.switching || studentsLength === 0 ? true : false}
								>
									Reset
								</Button>
							</Grid>
						</Grid>
						<br />

						<Grid container justify='center' spacing={1}>
							<Grid item>
								<ProgramsDisplay key={'students.ProgramsDisplay'} />
							</Grid>
						</Grid>
						<br />

						<Grid container justify='center' spacing={1}>
							<Grid item>
								<StudentDisplay
									key={`students.StudentDisplay-${studentsStore.selectedIndex}`}
									getStudent={getDisplayStudent}
								/>
							</Grid>
						</Grid>
						<br />

						<Grid container justify='center' spacing={1}>
							<Grid item>
								<OnlineButtonsDisplay
									key={'students.OnlineButtonsDisplay'}
									extraOffline={takeExtraOffline}
									extraOnline={takeExtraOnline}
									studentOffline={takeOffline}
									studentOnline={takeStudentOnline}
								/>
							</Grid>
						</Grid>
						<br />

						<Grid container justify='center' spacing={1}>
							<Grid item>
								<Button
									variant='contained'
									color='secondary'
									onClick={goToLast}
									disabled={studentsStore.switching || studentsLength === 0 ? true : lastIndex >= -1 ? false : true}
								>
									Back
								</Button>
							</Grid>
							<Grid item>
								<Button
									variant='contained'
									color='primary'
									onClick={goToNext}
									disabled={
										studentsStore.switching || studentsLength === 0 ? true : nextIndex <= studentsLength ? false : true
									}
								>
									Forward
								</Button>
							</Grid>
						</Grid>
					</div>
				</Grid>
			</Grid>
		</div>
	);
};

export default Students;