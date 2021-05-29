import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRecoilState } from 'recoil';
import { Box, AppBar, Toolbar, Tab } from '@material-ui/core';
import { TabContext, TabPanel, TabList } from '@material-ui/lab';
import SettingsIcon from '@material-ui/icons/Settings';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import Brightness6 from '@material-ui/icons/Brightness6';
import Brightness7 from '@material-ui/icons/Brightness7';

import Emitter from '../services/emitter';
import Settings from './settings/settings';
import Storage from '../services/storage';
import { connection } from '../services/utilities';
import { themeState, settingsState } from '../stores/atoms';
import { useStyles } from '../services/constants/styles';
import Students from './students';
import LoadingSpinner from '../views/loading-spinner';

import { ThemeTypesData } from '../stores/interfaces/theme-store';
import { SettingsStoreState } from './settings/interfaces/settings';
import { MainState } from './interface/main';
import { StorageLoad } from '../services/interfaces/storage';

import { initialMainState } from './constants/main';
import { defaultSettingKeys } from '../services/constants/storage';

const Main = () => {
	const styles = useStyles();
	const [state, setState] = useState<MainState>(initialMainState);
	const [settingsStore, setSettingsStore] = useRecoilState(settingsState);
	const [themeStore, setThemeStore] = useRecoilState(themeState);
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
		if (!isMounted.current || settingsStore.loaded) return;

		Storage.loadSettings()
			.then((response: SettingsStoreState) => {
				if (!isMounted.current) return;
				setSettingsStore((oldStore) => ({ ...oldStore, ...response }));
				connection.updateSettings(response.network);
			})
			.catch((e: any) => {
				if (isMounted.current) setSettingsStore((oldStore) => ({ ...oldStore, loaded: true }));
			});
	}, [setSettingsStore, settingsStore.loaded]);

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

	if (!themeStore || !settingsStore.loaded) return <LoadingSpinner color='secondary' />;

	return (
		<Box color='text.primary' bgcolor='background.paper' className={styles.boxWrapper} flexGrow={1} height="100%">
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
