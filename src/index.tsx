import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'jotai';

import App from './components/app';

const Index = () => {
	return (
		<Provider>
			<App />
		</Provider>
	);
};

ReactDOM.render(<Index />, document.getElementById('root'));
