import React from 'react';
import { useRecoilValue } from 'recoil';
import { ThemeProvider } from '@material-ui/core';
import { themeState } from '../stores/atoms';
import { lightTheme, darkTheme } from '../services/constants/styles';
import ErrorBoundary from '../views/error-boundries';
import Main from './main';

const App = () => {
	const themeStore = useRecoilValue(themeState);

	return (
		<ThemeProvider theme={themeStore.theme === 'light' ? lightTheme() : darkTheme()}>
			<ErrorBoundary>
				<Main />
			</ErrorBoundary>
		</ThemeProvider>
	);
};

export default App;
