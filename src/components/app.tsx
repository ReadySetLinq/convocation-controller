import React from 'react';
import { useAtomValue } from 'jotai/utils';
import { ThemeProvider } from '@mui/material/styles';
import { themeState } from '../stores/atoms';
import { lightTheme, darkTheme } from '../services/constants/styles';
import ErrorBoundary from '../views/boundaries';
import Display from './display';

const App = () => {
	const themeStore = useAtomValue(themeState);

	return (
		<ThemeProvider theme={themeStore.theme === 'light' ? lightTheme : darkTheme}>
			<ErrorBoundary>
				<Display />
			</ErrorBoundary>
		</ThemeProvider>
	);
};

export default App;
