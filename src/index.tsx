import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'jotai';

import App from './components/app';

const queryClient = new QueryClient();

const Index = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<Provider>
				<App />
			</Provider>
		</QueryClientProvider>
	);
};

ReactDOM.render(<Index />, document.getElementById('root'));
