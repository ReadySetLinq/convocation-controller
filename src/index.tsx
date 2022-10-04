import React from 'react';
import { createRoot } from 'react-dom/client';
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

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<Index />);
