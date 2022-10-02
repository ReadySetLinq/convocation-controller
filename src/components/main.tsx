import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Box, AppBar, Toolbar, Tab } from '@material-ui/core';
import { TabContext, TabPanel, TabList } from '@material-ui/lab';
import SettingsIcon from '@material-ui/icons/Settings';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import Brightness6 from '@material-ui/icons/Brightness6';
import Brightness7 from '@material-ui/icons/Brightness7';

import { themeState, convocationState } from '../stores/atoms';
import {
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
import {
	defaultConvocation,
	getConvocation,
	getNetwork,
	defaultNetwork,
	getGoogleSheet,
	defaultGoogleSheet,
	getXpression,
	defaultXpression,
} from '../services/api';

import Students from './students';
import Settings from './settings/settings';
import { initialMainState } from './constants/main';

import LoadingSpinner from '../views/loading-spinner';

import { ThemeTypesData } from '../stores/interfaces/theme-store';
import { MainState } from './interface/main';

const Main = () => {
	const styles = useStyles();
	const [state, setState] = useState<MainState>(initialMainState);
	const convocationStore = useAtomValue(convocationState);
	const googleSheetsStore = useAtomValue(googleSheetsSettings);
	const xpnStore = useAtomValue(xpnSettings);
	const networkStore = useAtomValue(networkSettings);
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
	const convocationQuery = useQuery(
		['getConvocation', convocationStore.id],
		() => getConvocation(convocationStore.id),
		{ enabled: convocationStore.id !== defaultConvocation.id },
	);
	const { data: googleSheetQueryData } = useQuery(
		['getGoogleSheet', convocationQuery.data?.googleSheetId],
		() => getGoogleSheet(convocationQuery.data?.googleSheetId ?? ''),
		{
			enabled: googleSheetsStore.id !== defaultGoogleSheet.id,
		},
	);
	const { data: xpressionSheetQueryData } = useQuery(
		['getXpression', convocationQuery.data?.xpressionId],
		() => getXpression(convocationQuery.data?.xpressionId ?? ''),
		{
			enabled: xpnStore.id !== defaultXpression.id,
		},
	);
	const { data: networkQueryData } = useQuery(
		['getNetwork', convocationQuery.data?.networkId],
		() => getNetwork(convocationQuery.data?.networkId ?? ''),
		{
			enabled: networkStore.id !== defaultNetwork.id,
		},
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

	useEffect(() => {
		if (!isMounted.current) return;

		if (googleSheetQueryData) {
			setGoogleSheetsStore(googleSheetQueryData);
		}
	}, [googleSheetQueryData, setGoogleSheetsStore]);

	useEffect(() => {
		if (!isMounted.current) return;

		if (xpressionSheetQueryData) {
			setXPNStore(xpressionSheetQueryData);
		}
	}, [xpressionSheetQueryData, setXPNStore]);

	useEffect(() => {
		if (!isMounted.current) return;

		if (networkQueryData) {
			setNetworkStore(networkQueryData);
		}
	}, [networkQueryData, setNetworkStore]);

	useEffect(() => {
		if (!isMounted.current) return;

		const { isLoading, data, isFetching } = convocationQuery;

		if (!isLoading && !isFetching) {
			console.log('convocationQuery', data);
			setGoogleSheetsStore({ ...googleSheetsStore, id: data?.googleSheetId ?? '' });
			setXPNStore({ ...xpnStore, id: data?.xpressionId ?? '' });
			setNetworkStore({ ...networkStore, id: data?.networkId ?? '' });
		}

		if (
			!isLoading &&
			!isFetching &&
			networkQueryData !== undefined &&
			googleSheetQueryData !== undefined &&
			xpressionSheetQueryData !== undefined
		) {
			console.log('convocationQuery', data);
			setLoadedStore(true);
		}
	}, [
		convocationQuery,
		googleSheetQueryData,
		googleSheetsStore,
		networkQueryData,
		networkStore,
		setGoogleSheetsStore,
		setLoadedStore,
		setNetworkStore,
		setXPNStore,
		xpnStore,
		xpressionSheetQueryData,
	]);

	useEffect(() => {
		isMounted.current = true;

		Emitter.on('navTabs_onSelect', (activeKey: string) => {
			if (isMounted.current) setState((prevState) => ({ ...prevState, navActiveKey: activeKey }));
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

	if (networkQueryData === undefined || googleSheetQueryData === undefined || xpressionSheetQueryData === undefined)
		return <LoadingSpinner label='Loading Settings...' />;

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
