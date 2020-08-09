import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';

import App from './components/app';

const Index = () => {
	return (
		<RecoilRoot>
			<App />
		</RecoilRoot>
	);
};

ReactDOM.render(<Index />, document.getElementById('root'));
