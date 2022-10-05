import React, { Fragment } from 'react';
import { useAtomValue } from 'jotai';
import { Grid, Paper } from '@mui/material';
import { Alert, AlertTitle } from '@mui/lab';

import { useStyles } from '../services/constants/styles';
import { isConnected, isConnecting, connectionMessage } from '../stores/selectors';
import NetworkDisplay from './network-display';

const NetworkConnection = () => {
	const { classes } = useStyles();
	const isConnectedStore = useAtomValue(isConnected);
	const isConnectingStore = useAtomValue(isConnecting);
	const connectionMessageStore = useAtomValue(connectionMessage);
	const severity = isConnectedStore ? 'success' : isConnectingStore ? 'warning' : 'error';

	// Return an empty element if the network is connected
	if (isConnectedStore) return <Fragment></Fragment>;

	return (
		<Grid container className={classes.grid} justifyContent='center' alignItems='center' spacing={1}>
			<Grid item xs={3}></Grid>
			<Grid item xs={6}>
				<Paper className={classes.paper}>
					<Alert
						key='networkConnection.Alert'
						severity={severity}
						variant='outlined'
						action={<NetworkDisplay key={'networkConnection.NetworkDisplay'} size='large' />}
					>
						<AlertTitle>{connectionMessageStore}</AlertTitle>
					</Alert>
				</Paper>
			</Grid>
			<Grid item xs={3}></Grid>
		</Grid>
	);
};

export default NetworkConnection;
