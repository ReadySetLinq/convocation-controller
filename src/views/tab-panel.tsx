import React from 'react';
import { Paper } from '@material-ui/core';
import { useStyles } from '../services/constants/styles';

import { TabPanelProps } from './interfaces/tab-panel';

export const a11yProps = (index: number) => {
	return {
		id: `full-width-tab-${index}`,
		'aria-controls': `full-width-tabpanel-${index}`,
	};
};

export const TabPanel = (props: TabPanelProps) => {
	const { children, value, index, ...other } = props;
	const styles = useStyles();

	return (
		<div
			role='tabpanel'
			hidden={value !== index}
			id={`full-width-tabpanel-${index}`}
			aria-labelledby={`full-width-tab-${index}`}
			{...other}
		>
			{value === index && <Paper className={styles.paper}>{children}</Paper>}
		</div>
	);
};

export default TabPanel;
