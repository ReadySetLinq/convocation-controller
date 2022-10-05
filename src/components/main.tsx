import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Box, AppBar, Toolbar, Tab } from '@mui/material';
import { TabContext, TabPanel, TabList } from '@mui/lab';
import SettingsIcon from '@mui/icons-material/Settings';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import Brightness6 from '@mui/icons-material/Brightness6';
import Brightness7 from '@mui/icons-material/Brightness7';

import { themeState, convocationState } from '../stores/atoms';
import {
	loadedSettings,
	setLoadedSettings,
	googleSheetsSettings,
	setGoogleSheetsSettings,
	networkSettings,
	setNetworkSettings,
	xpnSettings,
	setXPNSettings,
} from '../stores/selectors';

import Emitter from '../services/emitter';
import Storage from '../services/storage';
import { useStyles } from '../services/constants/styles';
import { defaultSettingKeys } from '../services/constants/storage';
import { defaultConvocation, getConvocation } from '../services/api';

import Students from './students';
import Settings from './settings/settings';
import { initialMainState } from './constants/main';

import LoadingSpinner from '../views/loading-spinner';

import { ThemeTypesData } from '../stores/interfaces/theme-store';
import { MainState } from './interface/main';

const Main = () => {
	const { classes } = useStyles();
	const [state, setState] = useState<MainState>(initialMainState);
	const isSettingsStoreLoaded = useAtomValue(loadedSettings);
	const convocationStore = useAtomValue(convocationState);
	const googleSheetsStore = useAtomValue(googleSheetsSettings);
	const xpnStore = useAtomValue(xpnSettings);
	const networkStore = useAtomValue(networkSettings);
	const setGoogleSheetsStore = useSetAtom(setGoogleSheetsSettings);
	const setXPNStore = useSetAtom(setXPNSettings);
	const setNetworkStore = useSetAtom(setNetworkSettings);
	const setLoadedStore = useSetAtom(setLoadedSettings);
	const [themeStore, setThemeStore] = useAtom(themeState);
	const [tabIndex, setTabIndex] = useState<string>('controller');
	const themeToggleLabel = themeStore.theme === 'light' ? 'Enable Dark Theme' : 'Enable Light Theme';
	const themeToggleButton =
		themeStore.theme === 'light' ? (
			<Brightness6 className={classes.iconButton} />
		) : (
			<Brightness7 className={classes.iconButton} />
		);
	const {
		isLoading,
		data: convocationQuery,
		isFetching,
	} = useQuery(['getConvocation', convocationStore.id], () => getConvocation(convocationStore.id), {
		enabled: convocationStore.id !== defaultConvocation.id && !isSettingsStoreLoaded,
	});
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

	useEffect(() => {
		if (!isMounted.current || isSettingsStoreLoaded) return;

		if (!isLoading && !isFetching && convocationQuery !== undefined) {
			const { googleSheet, xpression, network } = convocationQuery;
			console.log('convocationQuery', convocationQuery);
			if (googleSheet !== googleSheetsStore) setGoogleSheetsStore({ ...googleSheetsStore, ...googleSheet });
			if (xpression !== xpnStore) setXPNStore({ ...xpnStore, ...xpression });
			if (network !== networkStore) setNetworkStore({ ...networkStore, ...network });
			setLoadedStore(true);
		}
	}, [
		convocationQuery,
		googleSheetsStore,
		isFetching,
		isLoading,
		isSettingsStoreLoaded,
		networkStore,
		setGoogleSheetsStore,
		setLoadedStore,
		setNetworkStore,
		setXPNStore,
		xpnStore,
	]);

	useEffect(() => {
		isMounted.current = true;

		Emitter.on('navTabs_onSelect', (activeKey: string) => {
			if (isMounted.current) setState((prevState: MainState) => ({ ...prevState, navActiveKey: activeKey }));
		});

		if (isMounted.current) {
			Emitter.emit('navTabs_onSelect', state.navActiveKey);
		}

		// componentWillUnmount
		return () => {
			isMounted.current = false; // Mark as unmounted
			Emitter.off('navTabs_onSelect');
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (isLoading || isFetching || convocationQuery === undefined) return <LoadingSpinner label='Loading Settings...' />;

	return (
		<Box color='text.primary' bgcolor='background.paper' className={classes.boxWrapper} flexGrow={1} height='200vh'>
			<TabContext value={tabIndex}>
				<AppBar position='static' color='inherit' className={classes.appBar}>
					<Toolbar>
						<div className={classes.titleLeft}>
							<TabList
								variant='fullWidth'
								indicatorColor='primary'
								textColor='primary'
								aria-label='Menu Bar'
								onChange={handleTabChange}
							>
								<Tab
									value='controller'
									label='Controller'
									aria-label='Controller'
									icon={<SportsEsportsIcon />}
									disableRipple
								/>
								<Tab value='settings' label='Settings' aria-label='Settings' icon={<SettingsIcon />} disableRipple />
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
				<TabPanel value='controller'>
					<div className={classes.fullWidth}>
						<Suspense fallback={<LoadingSpinner color='secondary' />}>
							<Students key={'main.students'} />
						</Suspense>
					</div>
				</TabPanel>
				<TabPanel value='settings'>
					<div className={classes.fullWidth}>
						<Suspense fallback={<LoadingSpinner color='secondary' />}>
							<Settings key={'main.settings'} />
						</Suspense>
					</div>
				</TabPanel>
			</TabContext>
		</Box>
	);
};

export default Main;
