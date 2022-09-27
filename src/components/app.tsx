import React from 'react';
import { useAtomValue } from 'jotai/utils';
import { ThemeProvider } from '@material-ui/core';
import { themeState } from '../stores/atoms';
import { lightTheme, darkTheme } from '../services/constants/styles';
import ErrorBoundary from '../views/boundaries';
import Main from './main';

const App = () => {
	const themeStore = useAtomValue(themeState);

	return (
		<ThemeProvider theme={themeStore.theme === 'light' ? lightTheme() : darkTheme()}>
			<ErrorBoundary>
				<Main />
			</ErrorBoundary>
		</ThemeProvider>
	);
};

export default App;
