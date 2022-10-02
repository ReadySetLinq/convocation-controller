import React, { Fragment } from 'react';
import { Grid, Paper } from '@mui/material';
import { Alert, AlertTitle } from '@mui/lab';

import { useStyles } from '../services/constants/styles';
import NetworkDisplay from './network-display';

import { NetworkConnectionProps } from './interfaces/network-connection';

const NetworkConnection: React.FC<NetworkConnectionProps> = ({ state }) => {
	const { classes } = useStyles();
	const severity = state.connected ? 'success' : state.connecting ? 'warning' : 'error';

	// Return an empty element if the network is connected
	if (state.connected) return <Fragment></Fragment>;

	return (
		<Grid container className={classes.grid} justify='center' spacing={1}>
			<Grid item xs={3}></Grid>
			<Grid item xs={6}>
				<Paper className={classes.paper}>
					<Alert
						key='networkConnection.Alert'
						severity={severity}
						variant='outlined'
						action={<NetworkDisplay key={'networkConnection.NetworkDisplay'} size='large' state={state} />}
					>
						<AlertTitle>{state.displayMsg}</AlertTitle>
					</Alert>
				</Paper>
			</Grid>
			<Grid item xs={3}></Grid>
		</Grid>
	);
};

export default NetworkConnection;
