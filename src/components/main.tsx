import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Box, AppBar, Toolbar, Tab, Grid, Button } from '@material-ui/core';
import { TabContext, TabPanel, TabList } from '@material-ui/lab';
import SettingsIcon from '@material-ui/icons/Settings';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import Brightness6 from '@material-ui/icons/Brightness6';
import Brightness7 from '@material-ui/icons/Brightness7';

import { themeState } from '../stores/atoms';
import {
	loadedSettings,
	setLoadedSettings,
	setGoogleSheetsSettings,
	setNetworkSettings,
	setXPNSettings,
} from '../stores/selectors';

import Emitter from '../services/emitter';
import Storage from '../services/storage';
import { useStyles } from '../services/constants/styles';
import { StorageLoad } from '../services/interfaces/storage';
import { defaultSettingKeys } from '../services/constants/storage';

import Students from './students';
import Settings from './settings/settings';

import LoadingSpinner from '../views/loading-spinner';

import { ThemeTypesData } from '../stores/interfaces/theme-store';
import { SettingsStoreState } from './settings/interfaces/settings';
import { MainState } from './interface/main';

import { initialMainState, Login } from './constants/main';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { TextFormField } from '../views/form-field';

type LoginState = {
	username: string;
	password: string;
};

const initialLogin: LoginState = {
	username: '',
	password: '',
};

const Main = () => {
	const styles = useStyles();
	const [state, setState] = useState<MainState>(initialMainState);
	const isSettingsLoaded = useAtomValue(loadedSettings);
	const setGoogleSheetsStore = useSetAtom(setGoogleSheetsSettings);
	const setXPNStore = useSetAtom(setXPNSettings);
	const setNetworkStore = useSetAtom(setNetworkSettings);
	const setLoadedStore = useSetAtom(setLoadedSettings);
	const [themeStore, setThemeStore] = useAtom(themeState);
	const [tabIndex, setTabIndex] = useState<string>('settings');
	const themeToggleLabel = themeStore.theme === 'light' ? 'Enable Dark Theme' : 'Enable Light Theme';
	const themeToggleButton =
		themeStore.theme === 'light' ? (
			<Brightness6 className={styles.iconButton} />
		) : (
			<Brightness7 className={styles.iconButton} />
		);
	let isMounted = useRef<boolean>(false); // Only update states if we are still mounted after loading

	const handleThemeToggle = useCallback(() => {
		const newSate: ThemeTypesData = { ...themeStore, theme: themeStore.theme === 'light' ? 'dark' : 'light' };
		Storage.saveData(defaultSettingKeys.Theme, newSate).finally(() => {
			if (isMounted.current) setThemeStore(newSate);
		});
	}, [setThemeStore, themeStore]);

	const handleTabChange = useCallback(
		(event: React.ChangeEvent<{}>, newValue: string) => {
			if (newValue !== 'theme') setTabIndex(newValue);
			else handleThemeToggle();
		},
		[handleThemeToggle],
	);

	const handleLoadData = useCallback(() => {
		if (!isMounted.current || isSettingsLoaded) return;

		Storage.loadSettings()
			.then((response: SettingsStoreState) => {
				if (!isMounted.current) return;
				setGoogleSheetsStore(response.gs);
				setXPNStore(response.xpn);
				setNetworkStore(response.network);
			})
			.catch((e: any) => {
				console.error({ ...e });
			})
			.finally(() => {
				if (isMounted.current) setLoadedStore(true);
			});
	}, [setGoogleSheetsStore, setLoadedStore, setNetworkStore, setXPNStore, isSettingsLoaded]);

	const handleLoadTheme = useCallback(() => {
		if (!isMounted.current || themeStore.loaded) return;

		Storage.loadData(defaultSettingKeys.Theme)
			.then((response: StorageLoad) => {
				if (isMounted.current) setThemeStore((oldStore) => ({ ...oldStore, ...response.data }));
			})
			.catch((e) => {
				if (!e.error || e.error !== 'not found') console.error(e);
			});
	}, [setThemeStore, themeStore]);

	const onLogin = useCallback((values: LoginState, actions: FormikHelpers<LoginState>) => {
		if (!isMounted.current) return;

		actions.setSubmitting(true);

		if (Login(values.username, values.password)) {
			setState((oldState) => ({ ...oldState, loggedIn: true, loginError: '' }));
		} else {
			setState((oldState) => ({ ...oldState, loginError: 'Failed to login! Try again...' }));
		}

		if (!isMounted.current) return;
		actions.setStatus();
		actions.setSubmitting(false);
		actions.resetForm({ values });
	}, []);

	useEffect(() => {
		isMounted.current = true;

		Emitter.on('navTabs_onSelect', (activeKey: string) => {
			if (isMounted.current) setState((prevState) => ({ ...prevState, navActiveKey: activeKey }));
		});

		if (isMounted.current) {
			Emitter.emit('navTabs_onSelect', state.navActiveKey);
			handleLoadData();
			handleLoadTheme();
		}

		// componentWillUnmount
		return () => {
			isMounted.current = false; // Mark as unmounted
			Emitter.off('navTabs_onSelect');
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!themeStore || !isSettingsLoaded) return <LoadingSpinner color='secondary' />;

	if (!state.loggedIn)
		return (
			<Box color='text.primary' bgcolor='background.paper' className={styles.boxWrapper} flexGrow={1} height='200vh'>
				<TabContext value='login'>
					<AppBar position='static' color='inherit' className={styles.appBar}>
						<Toolbar>
							<div className={styles.fullWidth}>
								<TabList variant='fullWidth' indicatorColor='primary' textColor='primary' aria-label='Menu Bar'>
									<Tab value='login' label='Login' aria-label='Login' icon={<SettingsIcon />} disableRipple />
								</TabList>
							</div>
						</Toolbar>
					</AppBar>
					<TabPanel value='login'>
						<div className={styles.fullWidth}>
							<div className={styles.errorText}>{state.loginError}</div>
							<Formik initialValues={initialLogin} onSubmit={onLogin}>
								{({ touched, isValid, dirty, isSubmitting }) => {
									return (
										<Form
											onChange={() => {
												if (dirty && state.loginError !== '') setState((oldState) => ({ ...oldState, loginError: '' }));
											}}
										>
											<Field
												name='username'
												id='login.Username'
												label='Username'
												component={TextFormField}
												disabled={isSubmitting || !touched}
											/>
											<Field
												name='password'
												id='login.Password'
												label='Password'
												type='password'
												component={TextFormField}
												disabled={isSubmitting || !touched}
											/>

											<Grid container spacing={1}>
												<Grid item xs={6}></Grid>
												<Grid item xs={6}>
													<Button
														variant='contained'
														color={!isSubmitting && touched && isValid ? 'primary' : 'secondary'}
														size='large'
														type='submit'
														disabled={!isValid || !dirty || isSubmitting || !touched}
													>
														{isValid && dirty && !isSubmitting && touched
															? 'Login'
															: isSubmitting
															? 'Logging In...'
															: !isValid && dirty
															? 'Error! Try Again'
															: 'Login'}
													</Button>
												</Grid>
											</Grid>
										</Form>
									);
								}}
							</Formik>
						</div>
					</TabPanel>
				</TabContext>
			</Box>
		);

	return (
		<Box color='text.primary' bgcolor='background.paper' className={styles.boxWrapper} flexGrow={1} height='200vh'>
			<TabContext value={tabIndex}>
				<AppBar position='static' color='inherit' className={styles.appBar}>
					<Toolbar>
						<div className={styles.titleLeft}>
							<TabList
								variant='fullWidth'
								indicatorColor='primary'
								textColor='primary'
								aria-label='Menu Bar'
								onChange={handleTabChange}
							>
								<Tab value='settings' label='Settings' aria-label='Settings' icon={<SettingsIcon />} disableRipple />
								<Tab
									value='controller'
									label='Controller'
									aria-label='Controller'
									icon={<SportsEsportsIcon />}
									disableRipple
								/>
								<Tab
									value='theme'
									label={themeToggleLabel}
									aria-label={themeToggleLabel}
									icon={themeToggleButton}
									disableRipple
								/>
							</TabList>
						</div>
					</Toolbar>
				</AppBar>
				<TabPanel value='settings'>
					<div className={styles.fullWidth}>
						<Suspense fallback={<LoadingSpinner color='secondary' />}>
							<Settings key={'main.settings'} />
						</Suspense>
					</div>
				</TabPanel>
				<TabPanel value='controller'>
					<div className={styles.fullWidth}>
						<Suspense fallback={<LoadingSpinner color='secondary' />}>
							<Students key={'main.students'} />
						</Suspense>
					</div>
				</TabPanel>
			</TabContext>
		</Box>
	);
};

export default Main;
