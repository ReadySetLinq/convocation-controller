import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAtomValue, useAtom } from 'jotai';

import { convocationState, themeState } from '../stores/atoms';
import { loadedSettings } from '../stores/selectors';
import { defaultConvocationStoreState } from '../stores/constants/convocationState';
import Storage from '../services/storage';
import { defaultSettingKeys } from '../services/constants/storage';

import { initialDisplayState } from './constants/display';
import LoadingSpinner from '../views/loading-spinner';

import Login from './login';
import Main from './main';
import ConvocationSelector from './convocationSelector';

import { DisplayState } from './interface/display';
import { StorageLoad } from '../services/interfaces/storage';

export const Display = () => {
	const isSettingsLoaded = useAtomValue(loadedSettings);
	const convocation = useAtomValue(convocationState);
	const [themeStore, setThemeStore] = useAtom(themeState);
	const [loggedIn, setLoggedIn] = useState<DisplayState>(initialDisplayState);
	let isMounted = useRef<boolean>(false); // Only update states if we are still mounted after loading

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

		if (isMounted.current) {
			handleLoadTheme();
		}

		// componentWillUnmount
		return () => {
			isMounted.current = false; // Mark as unmounted
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!themeStore || !isSettingsLoaded) return <LoadingSpinner color='secondary' />;
	if (!loggedIn) return <Login state={loggedIn} setState={setLoggedIn} />;
	if (!convocation || convocation.id === defaultConvocationStoreState.id) return <ConvocationSelector />;

	return <Main />;
};

export default Display;
