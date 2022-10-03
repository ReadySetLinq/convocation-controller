import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import { Grid, Button, Paper } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { isEqual, isEmpty, sortBy, filter, findIndex } from 'lodash';
import { generate } from 'shortid';

import { connectionState, studentsState } from '../stores/atoms';
import {
	loadedSettings,
	googleSheetsSettings,
	xpnSettings,
	networkSettings,
	getProgramStudents,
	getProgramStudentsLength,
} from '../stores/selectors';
import Emitter from '../services/emitter';
import NetworkConnection from '../views/network-connection';
import { useStyles } from '../services/constants/styles';
import { getDataValue, connection } from '../services/utilities';
import { gsData, clearGoogleCache } from '../services/google-sheets';
import LoadingSpinner from '../views/loading-spinner';
import { StudentDisplay, ProgramsDisplay, OnlineButtonsDisplay } from '../views/students';

// Import Interfaces
import { StudentData, StudentsStoreState } from '../stores/interfaces/student-store';
import { editTakeItemProps } from './interface/students';
import { XPN_TakeItem_Data } from '../services/interfaces/xpn-events';
import { gsObject } from '../services/interfaces/google-sheets';

import { defaultEditTakeItemProps, loadingStates, Loading } from './constants/students';
import { defaultProgramName, defaultStudentData } from '../stores/constants/student-store';

const Students = () => {
	const styles = useStyles();
	const [studentsStore, setStudentsStore] = useAtom(studentsState);
	const [connectionStore, setConnectionStore] = useAtom(connectionState);
	const isSettingsLoaded = useAtomValue(loadedSettings);
	const googleSheetsStore = useAtomValue(googleSheetsSettings);
	const xpnStore = useAtomValue(xpnSettings);
	const networkStore = useAtomValue(networkSettings);
	const students = useAtomValue(getProgramStudents);
	const studentsLength = useAtomValue(getProgramStudentsLength);
	const lastIndex = useMemo(
		() => (studentsStore !== undefined ? studentsStore.selectedIndex - 1 : -1),
		[studentsStore],
	);
	const nextIndex = useMemo(() => (studentsStore !== undefined ? studentsStore.selectedIndex + 1 : 1), [studentsStore]);
	const googleSheetsData = useMemo(() => {
		if (connectionStore.connected) return gsData(googleSheetsStore.GoogleSheetsID);
		return Promise.resolve({} as gsObject);
	}, [connectionStore.connected, googleSheetsStore.GoogleSheetsID]);
	let prevStudentsStore = useRef<StudentsStoreState>(studentsStore);
	let isMounted = useRef<boolean>(false); // Only update states if we are still mounted after loading
	let loadStatus = useRef<Loading>(Loading.CHECKING);

	const editTakeItemProperty = (props: editTakeItemProps) => {
		Emitter.emit('xpn.EditTakeItemProperty', {
			...defaultEditTakeItemProps,
			...props,
		});
	};

	const getStudentData = useCallback(
		(student: any = {}) => {
			const { Name, Extra, Multiplier } = xpnStore;
			const { StudentID, Name_Column, Extra_Column, Multiplier_Column } = googleSheetsStore;

			let _id = isEmpty(StudentID) ? '' : String(getDataValue(student, StudentID));
			if (_id.length === 0) {
				_id = generate();
			}

			const _name =
				isEmpty(Name) || isEmpty(Name_Column)
					? defaultStudentData.name
					: String(getDataValue(student, Name_Column)).replace('*', '').trim();

			const _extra =
				isEmpty(Extra) || isEmpty(Extra_Column) || Extra_Column == null
					? defaultStudentData.extra
					: String(getDataValue(student, Extra_Column)).replace('*', '').trim();

			const _multiplier = Number.parseInt(
				isEmpty(Multiplier) || isEmpty(Multiplier_Column) || Multiplier_Column == null
					? defaultStudentData.multiplier
					: getDataValue(student, Multiplier_Column),
			);

			const _displayName = !isEmpty(_extra)
				? _multiplier > 0
					? `(x${_multiplier}) ${_name}`
					: _name
				: _multiplier > 0
				? `(x${_multiplier}) ${_name}`
				: _name;

			const studentData: StudentData = {
				...defaultStudentData,
				id: _id,
				name: _name,
				extra: _extra,
				multiplier: !isNaN(_multiplier) ? _multiplier : defaultStudentData.multiplier,
				displayName: String(_displayName).trim(),
			};

			return studentData;
		},
		[googleSheetsStore, xpnStore],
	);

	const updateSpectator = useCallback(() => {
		const lastStudent = students[lastIndex];
		const curStudent = students[studentsStore.selectedIndex];
		const nextStudent = students[nextIndex];

		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'spectator',
				data: {
					action: 'update',
					uuid: `spectatorUpdate-${generate()}`,
					program: studentsStore.programName,
					last: getStudentData(lastStudent).displayName,
					current: getStudentData(curStudent).displayName,
					next: getStudentData(nextStudent).displayName,
				},
			}),
		);
	}, [getStudentData, lastIndex, nextIndex, students, studentsStore.programName, studentsStore.selectedIndex]);

	const updateStudent = useCallback(
		(student: any = {}, callback: Function = () => {}) => {
			if (!isMounted.current) return;
			const { ExtraTakeID, TakeID, Name, Extra, Multiplier } = xpnStore;
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
					value: String(_student.multiplier),
				});
			}

			callback(_student);
		},
		[getStudentData, xpnStore],
	);

	const takeExtraOnline = useCallback(
		(studentExtra: string = '', callback: Function = () => {}) => {
			if (!isMounted.current) return;
			const { selectedIndex } = studentsStore;
			const { ExtraTakeID, Extra } = xpnStore;

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
				if (data.response) setStudentsStore((oldStore: StudentsStoreState) => ({ ...oldStore, isExtraOnline: true }));
				callback({ data });
			});

			// Take the text back online
			Emitter.emit('xpn.SetTakeItemOnline', {
				uuid: _tmpUUID,
				takeID: ExtraTakeID,
			});

			// Update the spectator data
			updateSpectator();
		},
		[getStudentData, setStudentsStore, xpnStore, students, studentsStore, updateSpectator],
	);

	const takeOnline = useCallback(
		(callback: Function = () => {}) => {
			if (!isMounted.current) return;
			const { TakeID } = xpnStore;
			const _tmpUUID = `setTakeItemOnline-${generate()}`;

			Emitter.once(_tmpUUID, (data: XPN_TakeItem_Data) => {
				if (!isMounted.current) return;
				if (data.response) setStudentsStore((oldStore: StudentsStoreState) => ({ ...oldStore, isOnline: true }));
				callback({ data });
			});

			// Take the text back online
			Emitter.emit('xpn.SetTakeItemOnline', {
				uuid: _tmpUUID,
				takeID: TakeID,
			});

			// Update the spectator data
			updateSpectator();
		},
		[setStudentsStore, xpnStore, updateSpectator],
	);

	const takeExtraOffline = useCallback(
		(callback: Function = () => {}) => {
			if (!isMounted.current) return;
			const { ExtraTakeID } = xpnStore;

			// Only take offline if ID is greater than or equal to 0, otherwise callback and return
			if (ExtraTakeID <= 0) {
				callback({});
				return;
			}

			const _tmpUUID = `setTakeItemOffline-${generate()}`;

			Emitter.once(_tmpUUID, (data: XPN_TakeItem_Data) => {
				if (!isMounted.current) return;
				if (data.response) setStudentsStore((oldStore: StudentsStoreState) => ({ ...oldStore, isExtraOnline: false }));
				callback(data);
			});

			// Take the text offline
			Emitter.emit('xpn.SetTakeItemOffline', {
				uuid: _tmpUUID,
				takeID: ExtraTakeID,
			});

			// Update the spectator data
			updateSpectator();
		},
		[setStudentsStore, xpnStore, updateSpectator],
	);

	const takeOffline = useCallback(
		(callback: Function = () => {}) => {
			if (!isMounted.current) return;
			const { TakeID } = xpnStore;
			const _tmpUUID = `setTakeItemOffline-${generate()}`;

			Emitter.once(_tmpUUID, (data: XPN_TakeItem_Data) => {
				if (!isMounted.current) return;
				if (data.response) setStudentsStore((oldStore: StudentsStoreState) => ({ ...oldStore, isOnline: false }));
				callback(data);
			});

			// Take the text offline
			Emitter.emit('xpn.SetTakeItemOffline', {
				uuid: _tmpUUID,
				takeID: TakeID,
			});

			// Update the spectator data
			updateSpectator();
		},
		[setStudentsStore, xpnStore, updateSpectator],
	);

	const resetXPNData = useCallback(
		(forceOffline: boolean, callback: Function = () => {}) => {
			if (!isMounted.current) return;
			const { ExtraTakeID, TakeID, Name, Extra, Background, Multiplier } = xpnStore;
			const { Division_Column } = googleSheetsStore;

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

			if (!isEmpty(Background)) {
				editTakeItemProperty({
					takeID: ExtraTakeID !== -1 ? ExtraTakeID : TakeID,
					objName: Background,
					propName: 'Material',
					value: 0,
					materialName: `default_background_Image`,
				});

				if (
					!isEmpty(students[nextIndex]) &&
					!isEmpty(Background) &&
					!isEmpty(Division_Column) &&
					Division_Column !== null &&
					!isEmpty(students[nextIndex][Division_Column])
				) {
					// Edit the background
					editTakeItemProperty({
						takeID: ExtraTakeID !== -1 ? ExtraTakeID : TakeID,
						objName: Background,
						propName: 'Material',
						value: 0,
						materialName: `${students[nextIndex][Division_Column].replace(/[^a-z0-9]+/gi, '-')
							.replace(/^-+/, '')
							.replace(/-+$/, '')
							.toLowerCase()}_Image`,
					});
				}
			}

			callback({ forceOffline });
		},
		[xpnStore, googleSheetsStore, takeOffline, takeExtraOffline, students, nextIndex],
	);

	const resetData = useCallback(
		(forceOffline: boolean = true) => {
			if (!isMounted.current) return;

			loadStatus.current = Loading.RESETTING_STUDENTS;

			setStudentsStore((oldStore: StudentsStoreState) => ({
				...oldStore,
				switching: false,
				selectedIndex: -1,
				selectedStudentID: '',
				autoToNext: false,
				lastProgram: '',
			}));

			resetXPNData(forceOffline, () => {
				loadStatus.current = Loading.EMPTY;
			});
		},
		[resetXPNData, setStudentsStore],
	);

	const getStudents = useCallback(
		(forceOffline: boolean = false) => {
			const { Multiplier } = xpnStore;
			const { StudentID, Name_Column, Extra_Column, Multiplier_Column, Division_Column, OrderBy } = googleSheetsStore;

			if (!isMounted.current) return;

			loadStatus.current = Loading.LOADING_STUDENTS;

			setStudentsStore((oldStore: StudentsStoreState) => ({
				...oldStore,
				isLoading: true,
				students: [],
				programName: defaultProgramName,
				programs: [defaultProgramName],
				selectedIndex: -1,
				selectedStudentID: '',
				lastProgram: '',
			}));

			googleSheetsData
				.then((response: gsObject) => {
					if (!isMounted.current) return;
					let _students: any[] = [];
					let _programs: string[] = [defaultProgramName];

					loadStatus.current = Loading.PROCESSING_STUDENTS;

					if (response.errors.length > 0 || response.meta.aborted) {
						setStudentsStore((oldStore: StudentsStoreState) => ({
							...oldStore,
							students: [..._students],
							programs: [..._programs],
							programName: _programs[0],
							isLoading: false,
						}));
						resetData(forceOffline);
						return;
					}

					let gs_id = 0;
					response.data.forEach((student: any) => {
						if (!isMounted.current) return;
						const _studentsProgram = getDataValue(student, Extra_Column ?? '');
						const _studentsDivision = getDataValue(student, Division_Column ?? '');

						// used to keep the id order of the default GoogleSheets import
						student['gs_id'] = gs_id;
						gs_id++;

						if (!isEmpty(_studentsProgram)) {
							if (!_programs.includes(_studentsProgram)) {
								_programs.push(_studentsProgram);
							}
						}

						if (Extra_Column !== null) {
							if (isEmpty(student[Extra_Column])) student[Extra_Column] = _studentsProgram;
						}

						if (!isEmpty(_studentsDivision) && Division_Column !== null) {
							if (isEmpty(student[Division_Column])) student[Division_Column] = _studentsDivision;
						}

						if (!isEmpty(Multiplier) && !isEmpty(Multiplier_Column) && Extra_Column !== null) {
							// Check for people with the same name and get count
							const _curName = getDataValue(student, Name_Column);
							const _studentID = getDataValue(student, StudentID);
							let _multiple = filter(_students, (s: any) => {
								return (
									!isEqual(_studentID, getDataValue(s, StudentID)) &&
									isEqual(_curName, getDataValue(s, Name_Column)) &&
									isEqual(_studentsProgram, getDataValue(s, Extra_Column))
								);
							}).length;

							if (_multiple === 1 && Multiplier_Column !== null) {
								// If this is the first duplicate, add multiplier 1 to the original name
								const _idx = findIndex(_students, (s: any) => {
									return (
										!isEqual(_studentID, getDataValue(s, StudentID)) &&
										isEqual(_curName, getDataValue(s, Name_Column)) &&
										isEqual(_studentsProgram, getDataValue(s, Extra_Column))
									);
								});
								// Update existing student with multiple now found
								if (_idx !== -1 && _students[_idx]) _students[_idx][Multiplier_Column] = 1;
							}

							if (Multiplier_Column !== null) student[Multiplier_Column] = _multiple === 0 ? 0 : _multiple + 1;
						}

						// Add new student
						_students.push(student);
					});

					// OrderBy on our end to make sure its correct as a failsafe
					if (!isEmpty(OrderBy) && OrderBy !== null) _students = sortBy(_students, [...OrderBy.split(',')]);
					else _students = sortBy(_students, 'gs_id');

					if (!isMounted.current) return;

					setStudentsStore((oldStore: StudentsStoreState) => ({
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
					loadStatus.current = Loading.EMPTY;

					setStudentsStore((oldStore: StudentsStoreState) => ({ ...oldStore, isLoading: false }));
				});
		},
		[xpnStore, googleSheetsStore, setStudentsStore, googleSheetsData, resetData],
	);

	const takeStudentOnline = useCallback(
		(index: number) => {
			if (!isMounted.current) return;
			const { lastProgram } = studentsStore;
			const { tmrDelay } = xpnStore;
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
								setStudentsStore((oldStore: StudentsStoreState) => ({
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
		},
		[
			getStudentData,
			setStudentsStore,
			xpnStore,
			students,
			studentsLength,
			studentsStore,
			takeExtraOnline,
			takeOnline,
			updateStudent,
		],
	);

	const goToNext = useCallback(() => {
		if (!isMounted.current) return;

		setStudentsStore((oldStore: StudentsStoreState) => ({ ...oldStore, switching: true }));

		takeOffline(() => {
			if (!isMounted.current) return;
			const nextIndex = studentsStore.selectedIndex + 1;
			const maxIndex = studentsLength;

			// Update the spectator data
			updateSpectator();

			if (nextIndex < maxIndex) takeStudentOnline(nextIndex);
			else {
				const _student = students[nextIndex];
				const _studentData = getStudentData(_student);
				const _extra = _studentData.extra;

				if (!studentsStore.isExtraOnline || studentsStore.lastProgram !== _extra) takeExtraOnline(_extra);

				if (!isMounted.current) return;
				setStudentsStore((oldStore: StudentsStoreState) => ({
					...oldStore,
					switching: false,
					lastProgram: _extra,
					selectedIndex: nextIndex,
				}));
			}
		});
	}, [
		getStudentData,
		setStudentsStore,
		students,
		studentsLength,
		studentsStore.isExtraOnline,
		studentsStore.lastProgram,
		studentsStore.selectedIndex,
		takeExtraOnline,
		takeOffline,
		takeStudentOnline,
		updateSpectator,
	]);

	const goToLast = useCallback(() => {
		if (!isMounted.current) return;

		const { tmrDelay } = xpnStore;
		const _delay = tmrDelay > 4 ? tmrDelay : 4;

		setStudentsStore((oldStore: StudentsStoreState) => ({ ...oldStore, switching: true }));

		takeOffline(() => {
			if (!isMounted.current) return;
			const lastIndex = studentsStore.selectedIndex - 1;
			const index = lastIndex >= -1 ? lastIndex : -1;

			setStudentsStore((oldStore: StudentsStoreState) => ({ ...oldStore, selectedIndex: index }));
			setTimeout(() => {
				if (!isMounted.current) return;
				setStudentsStore((oldStore: StudentsStoreState) => ({ ...oldStore, switching: false }));
			}, _delay);
		});
	}, [setStudentsStore, xpnStore, studentsStore.selectedIndex, takeOffline]);

	const onResetDataClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			if (!isMounted.current) return;

			resetData();
		},
		[resetData],
	);

	const reloadData = useCallback(() => {
		if (!isMounted.current) return;
		clearGoogleCache(); // Clear the google sheets data cache before loading the students again
		if (connectionStore !== undefined && connectionStore.connected) {
			getStudents();
		}
	}, [connectionStore, getStudents]);

	const onKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			if (!isMounted.current) return;

			if (connectionStore.connected && studentsStore.loggedIn && studentsStore.ctrlStarted) {
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
		},
		[
			connectionStore.connected,
			goToLast,
			goToNext,
			studentsLength,
			studentsStore.ctrlStarted,
			studentsStore.loggedIn,
			studentsStore.selectedIndex,
			studentsStore.switching,
		],
	);

	useEffect(() => {
		isMounted.current = true;

		Emitter.on('network.connecting', (message: string) =>
			setConnectionStore({ connected: false, connecting: true, displayMsg: message }),
		);
		Emitter.on('network.connected', (message: string) =>
			setConnectionStore({ connected: true, connecting: false, displayMsg: message }),
		);
		Emitter.on('network.disconnected', (message: string) =>
			setConnectionStore({ connected: false, connecting: false, displayMsg: message }),
		);

		Emitter.on('conn.status', ({ connected = false, connecting = false, displayMsg = '' }) =>
			setConnectionStore({ connected, connecting, displayMsg }),
		);

		Emitter.on('xpression.loggedIn', () => {
			if (!isMounted.current) return;
			setStudentsStore((oldStore: StudentsStoreState) => ({ ...oldStore, loggedIn: true }));
			prevStudentsStore.current = { ...prevStudentsStore.current, loggedIn: true };

			Emitter.emit('xpn.start', { uuid: generate() });
		});

		Emitter.on('xpression.error', (value: { data: { message: string } }) => {
			if (!isMounted.current) return;
			Emitter.emit('conn.disconnect', {});
			setTimeout(() => {
				if (!isMounted.current) return;
				setConnectionStore({ connected: false, connecting: false, displayMsg: value.data.message });
			}, 1500);
		});

		Emitter.on('xpression.controllerStarted', (value: { uuid: ''; response: false }) => {
			if (!isMounted.current) return;
			const { ExtraTakeID, TakeID } = xpnStore;

			if (!value.response) {
				loadStatus.current = Loading.XPN_FAILED;
				setStudentsStore((oldStore: StudentsStoreState) => ({ ...oldStore, ctrlStarted: false, isLoading: true }));
				setTimeout(() => {
					if (!isMounted.current) return;
					connection.disconnect();
				}, 3000);
				return;
			}

			setStudentsStore((oldStore: StudentsStoreState) => ({ ...oldStore, ctrlStarted: true }));

			if (prevStudentsStore.current.ctrlStarted) {
				if (connectionStore.connected) getStudents();
				return;
			} else prevStudentsStore.current = { ...prevStudentsStore.current, ctrlStarted: true };

			// Get initial status
			if (ExtraTakeID !== -1) {
				const _tmpExtraUUID = `getTakeItemStatus-${generate()}`;
				Emitter.once(_tmpExtraUUID, ({ response = false }) => {
					if (isMounted.current)
						setStudentsStore((oldStore: StudentsStoreState) => ({ ...oldStore, isExtraOnline: response }));
				});

				Emitter.emit('xpn.GetTakeItemStatus', {
					uuid: _tmpExtraUUID,
					takeID: ExtraTakeID,
				});
			}

			const _tmpUUID = `getTakeItemStatus-${generate()}`;
			Emitter.once(_tmpUUID, ({ response = false }) => {
				if (isMounted.current)
					setStudentsStore((oldStore: StudentsStoreState) => ({ ...oldStore, isOnline: response }));
			});

			Emitter.emit('xpn.GetTakeItemStatus', {
				uuid: _tmpUUID,
				takeID: TakeID,
			});

			if (connectionStore.connected) getStudents();
		});

		Emitter.emit('conn.getStatus', {});

		// componentWillUnmount
		return () => {
			isMounted.current = false; // Mark as unmounted
			Emitter.off('xpression-started');
			Emitter.off('xpression.loggedIn');
			Emitter.off('xpression.error');
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
		if (studentsStore.programName === prevStudentsStore.current.programName) return;
		else prevStudentsStore.current = { ...prevStudentsStore.current, programName: studentsStore.programName };

		setTimeout(() => {
			resetData(true);
		}, xpnStore.tmrDelay * 2);
	}, [
		students,
		nextIndex,
		resetData,
		xpnStore,
		googleSheetsStore,
		studentsStore.programName,
		studentsStore.students,
		updateSpectator,
	]);

	useEffect(() => {
		if (!isMounted.current) return;

		Emitter.emit('conn.updateSettings', networkStore);
	}, [networkStore]);

	useEffect(() => {
		if (!isMounted.current) return;

		// If the students list, program name or selectedIndex change, update our spectator
		updateSpectator();
	}, [students, studentsStore.programName, studentsStore.selectedIndex, updateSpectator]);

	if (!isSettingsLoaded)
		return (
			<Grid container className={styles.grid} justify='center' spacing={1}>
				<LoadingSpinner
					key={`settings.LoadingSpinner-${loadStatus.current}`}
					label={loadingStates[loadStatus.current]}
				/>
			</Grid>
		);

	if (!connectionStore.connected) return <NetworkConnection key={'students.NetworkConnection'} />;

	if (loadStatus.current === Loading.XPN_FAILED)
		return (
			<Grid container className={styles.grid} justify='center' spacing={1}>
				<Grid item xs={3}></Grid>
				<Grid item xs={6}>
					<Paper className={styles.paper}>
						<Alert key='networkConnection.Alert' severity='error' variant='outlined'>
							<AlertTitle>{loadingStates[loadStatus.current]}</AlertTitle>
						</Alert>
					</Paper>
				</Grid>
				<Grid item xs={3}></Grid>
			</Grid>
		);

	if (studentsStore.isLoading || !studentsStore.loggedIn || !studentsStore.ctrlStarted)
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
									getStudentData={getStudentData}
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
