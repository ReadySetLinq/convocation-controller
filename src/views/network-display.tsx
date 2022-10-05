import React, { useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { Button } from '@mui/material';

import Emitter from '../services/emitter';
import { isConnected, isConnecting } from '../stores/selectors';

import { NetworkDisplayProps } from './interfaces/network-display';

const NetworkDisplay: React.FC<NetworkDisplayProps> = ({ size }) => {
	const isConnectedStore = useAtomValue(isConnected);
	const isConnectingStore = useAtomValue(isConnecting);

	const handleConnect = useCallback(() => {
		if (!isConnectedStore) {
			Emitter.emit('conn.connect', {});
		}
	}, [isConnectedStore]);

	const handleDisconnect = useCallback(() => {
		if (isConnectedStore || isConnectingStore) Emitter.emit('conn.disconnect', {});
	}, [isConnectedStore, isConnectingStore]);

	if (isConnectingStore) {
		return (
			<Button
				variant='outlined'
				color='inherit'
				title='Click to cancel'
				aria-label='Connecting...'
				hidden={!isConnectingStore}
				onClick={handleDisconnect}
				type='submit'
				size={size}
			>
				Connecting...
			</Button>
		);
	} else if (isConnectedStore) {
		return (
			<Button
				variant='contained'
				color='primary'
				aria-label='Disconnect'
				onClick={handleDisconnect}
				type='submit'
				size={size}
				hidden={!isConnectedStore}
			>
				Disconnect
			</Button>
		);
	}

	return (
		<Button
			variant='contained'
			color='primary'
			aria-label='Connect'
			onClick={handleConnect}
			type='submit'
			size={size}
			hidden={isConnectingStore || isConnectedStore}
		>
			Connect
		</Button>
	);
};

export default NetworkDisplay;
