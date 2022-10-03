import React, { Fragment } from 'react';
import { useAtomValue } from 'jotai';
import { Grid, Paper } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';

import { useStyles } from '../services/constants/styles';
import { isConnected, isConnecting, connectionMessage } from '../stores/selectors';
import NetworkDisplay from './network-display';

const NetworkConnection = () => {
	const styles = useStyles();
	const isConnectedStore = useAtomValue(isConnected);
	const isConnectingStore = useAtomValue(isConnecting);
	const connectionMessageStore = useAtomValue(connectionMessage);
	const severity = isConnectedStore ? 'success' : isConnectingStore ? 'warning' : 'error';

	// Return an empty element if the network is connected
	if (isConnectedStore) return <Fragment></Fragment>;

	return (
		<Grid container className={styles.grid} justify='center' spacing={1}>
			<Grid item xs={3}></Grid>
			<Grid item xs={6}>
				<Paper className={styles.paper}>
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
