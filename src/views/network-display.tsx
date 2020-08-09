import React, { useCallback } from 'react';
import { Button } from '@material-ui/core';

import Emitter from '../services/emitter';

import { NetworkDisplayProps } from './interfaces/network-display';

const NetworkDisplay: React.FC<NetworkDisplayProps> = ({ size, state }) => {
	const handleConnect = useCallback(() => {
		if (!state.connected) {
			Emitter.emit('conn.connect', {});
		}
	}, [state.connected]);

	const handleDisconnect = useCallback(() => {
		if (state.connected || state.connecting) Emitter.emit('conn.disconnect', {});
	}, [state.connected, state.connecting]);

	if (state.connecting) {
		return (
			<Button
				variant='outlined'
				color='inherit'
				title='Click to cancel'
				aria-label='Connecting...'
				hidden={!state.connecting}
				onClick={handleDisconnect}
				type='submit'
				size={size}
			>
				Connecting...
			</Button>
		);
	} else if (state.connected) {
		return (
			<Button
				variant='contained'
				color='default'
				aria-label='Disconnect'
				onClick={handleDisconnect}
				type='submit'
				size={size}
				hidden={!state.connected}
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
			hidden={state.connecting || state.connected}
		>
			Connect
		</Button>
	);
};

export default NetworkDisplay;
