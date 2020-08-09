import { isEqual } from 'lodash';
import { generate } from 'shortid';

import { XPN_Events } from './xpn-events';
import { webSockets, objHas } from './utilities';
import Emitter from './emitter';

import { NetworkSettingsData } from '../components/settings/interfaces/network';

import { defaultConnectionMessage } from './constants/connection';
import { defaultNetworkSettingsData } from '../components/settings/constants/network';

export interface ConnectionImplimentations {
	initialized: boolean;
	connected: boolean;
	connecting: boolean;
	autoReconnect: boolean;
	displayMsg: string;
	wsReadyState: number;
	wsConnected: boolean;
	reconnectTime: number;
	reconnectInterval: number;
	settings: NetworkSettingsData;
	xpnEvents: XPN_Events; // Startup the xpnEvents listeners
	updateSettings(settings: NetworkSettingsData): void;
	destroy(): void;
	connect(): void;
	disconnect(): Promise<boolean>;
	reconnect(): void;
	sendMessage(msg: string): void;
}

export class Connection implements ConnectionImplimentations {
	initialized = false;
	connected = false;
	connecting = false;
	autoReconnect = true;
	displayMsg = defaultConnectionMessage;
	wsReadyState = WebSocket.CLOSED;
	wsConnected = false;
	reconnectTime = 1500;
	reconnectInterval = 0;
	settings = defaultNetworkSettingsData;
	xpnEvents = new XPN_Events(); // Startup the xpnEvents listeners

	constructor() {
		Emitter.on('conn.getStatus', () =>
			Emitter.emit('conn.status', {
				connected: this.connected,
				connecting: this.connecting,
				displayMsg: this.displayMsg,
			}),
		);
		Emitter.on('conn.getDisplayMsg', () => Emitter.emit('conn.displayMsg', this.displayMsg));
		Emitter.on('conn.updateSettings', this.updateSettings);
		Emitter.on('conn.connect', this.connect);
		Emitter.on('conn.disconnect', this.disconnect);
		Emitter.on('conn.reconnect', this.reconnect);
		Emitter.on('conn.sendMessage', this.sendMessage);
		Emitter.on('ws.onIsConnected', this.onIsConnected);

		Emitter.on('ws.onOpen', this.onOpen);
		Emitter.on('ws.onMessage', this.onMessage);
		Emitter.on('ws.onClose', this.onClose);
		Emitter.on('ws.onError', this.onError);
		this.xpnEvents.addListeners();
		this.initialized = true;
	}

	destroy = () => {
		this.disconnect();

		if (!this.initialized) return;
		Emitter.off('conn.getStatus');
		Emitter.off('conn.getDisplayMsg');
		Emitter.off('conn.updateSettings');
		Emitter.off('conn.connect');
		Emitter.off('conn.disconnect');
		Emitter.off('conn.reconnect');
		Emitter.off('conn.sendMessage');
		Emitter.off('ws.onIsConnected');

		Emitter.off('ws.onIsConnected');
		Emitter.off('ws.onOpen');
		Emitter.off('ws.onMessage');
		Emitter.off('ws.onClose');
		Emitter.off('ws.onError');
		this.xpnEvents.removeListeners();
		this.initialized = false;
		clearInterval(this.reconnectInterval);
	};

	updateSettings = (settings: NetworkSettingsData) => {
		if (!isEqual(settings, this.settings)) {
			this.settings = { ...defaultNetworkSettingsData, ...settings };
			webSockets.updateData(settings);
		}
	};

	connect = () => {
		webSockets.updateData(this.settings);

		if (this.connected) {
			this.disconnect().then(this.connect);
			return;
		}

		this.connecting = true;
		this.connected = false;
		this.displayMsg = 'Attempting to connect...';
		this.wsReadyState = WebSocket.CLOSED;
		this.wsConnected = false;

		webSockets.connect();

		Emitter.emit('network.connecting', this.displayMsg);
	};

	disconnect = () =>
		new Promise<boolean>((resolve) => {
			const { settings, connecting, connected, sendMessage } = this;

			// If we are still connecting, cancel the request and return to old state
			if (connecting) {
				if (webSockets.ws !== null) webSockets.disconnect(false);

				this.connecting = false;
				this.connected = false;
				this.autoReconnect = false;
				return resolve(true);
			}

			this.autoReconnect = false;

			if (connected) {
				sendMessage(`{'service': 'logout', 'data': {'userName': '${settings.userName}'}}`);
				setTimeout(() => {
					if (webSockets.ws !== null) webSockets.disconnect(false);
					this.connecting = false;
					this.connected = false;
					this.autoReconnect = false;
					return resolve(true);
				}, 1000);
			} else {
				if (webSockets.ws !== null) webSockets.disconnect(false);
				this.connecting = false;
				this.connected = false;
				this.autoReconnect = false;
				return resolve(true);
			}
		});

	reconnect = () => {
		if (this.connected) this.disconnect().then(() => this.connect());
	};

	sendMessage = (msg: string) => {
		const { connected } = this;

		if (msg && connected) {
			if (webSockets.ws !== null) webSockets.sendMessage(msg);
		}
	};

	onIsConnected = (readyState: number, connected: boolean) => {
		this.wsReadyState = readyState || WebSocket.CLOSED;
		this.wsConnected = connected || false;
	};

	// websocket onopen event listener
	onOpen = () => {
		this.connecting = false;
		this.connected = true;
		this.displayMsg = 'Connected!';
		this.autoReconnect = true;
		clearInterval(this.reconnectInterval);

		// Send login message with our saved login data
		this.sendMessage(
			`{'service': 'login', 'data': {'userName': '${this.settings.userName}', 'password': '${this.settings.password}'}}`,
		);
	};

	// websocket onmessage event listener
	onMessage = ({ data = '{}' }) => {
		const { sendMessage } = this;

		const _msg = JSON.parse(data);
		if (_msg && objHas.call(_msg, 'service')) {
			switch (_msg.service) {
				case 'status':
					if (objHas.call(_msg, 'data') && objHas.call(_msg.data, 'type')) {
						switch (_msg.data.type) {
							case 'joined': {
								const _joinMsg = _msg.data.message.split(':')[1].trim();
								if (isEqual(_joinMsg, 'xpression'))
									sendMessage(
										`{'service': 'xpression', 'data': {'category': 'main', 'action': 'start', 'properties': { 'uuid': '${generate()}'}}}`,
									);
								else if (isEqual(_joinMsg, 'controller'))
									Emitter.emit('xpression.controllerStarted', {
										data: _msg.data,
									});
								break;
							}
							default:
								break;
						}
					}
					break;
				case 'xpression':
					if (objHas.call(_msg, 'data') && objHas.call(_msg.data, 'category') && objHas.call(_msg.data, 'action')) {
						switch (_msg.data.category) {
							case 'main':
								if (isEqual(_msg.data.action, 'start')) {
									if (_msg.data.value && _msg.data.value.response) Emitter.emit('xpression-started', _msg.data.value);
								}
								break;
							case 'takeitem':
								if (isEqual(_msg.data.action, 'SetTakeItemOnline')) {
									Emitter.emit(`takeItem-${_msg.data.value.takeID}`, {
										uuid: _msg.data.value.uuid,
										takeID: _msg.data.value.takeID,
										action: _msg.data.action,
										response: _msg.data.value.response,
									});
								} else if (isEqual(_msg.data.action, 'SetTakeItemOffline')) {
									Emitter.emit(`takeItem-${_msg.data.value.takeID}`, {
										uuid: _msg.data.value.uuid,
										takeID: _msg.data.value.takeID,
										action: _msg.data.action,
										response: _msg.data.value.response,
									});
								} else if (isEqual(_msg.data.action, 'GetTakeItemStatus')) {
									Emitter.emit(`takeItem-${_msg.data.value.takeID}`, {
										uuid: _msg.data.value.uuid,
										takeID: _msg.data.value.takeID,
										action: _msg.data.action,
										response: _msg.data.value.response,
									});
								} else if (isEqual(_msg.data.action, 'GetTakeItemLayer')) {
									Emitter.emit(`takeItem-${_msg.data.value.takeID}`, {
										uuid: _msg.data.value.uuid,
										takeID: _msg.data.value.takeID,
										action: _msg.data.action,
										response: _msg.data.value.response,
									});
								}
								Emitter.emit(`${_msg.data.value.uuid}`, {
									uuid: _msg.data.value.uuid,
									takeID: _msg.data.value.takeID,
									action: _msg.data.action,
									response: _msg.data.value.response,
								});

								break;
							case 'widget':
								if (
									isEqual(_msg.data.action, 'GetCounterWidgetValue') ||
									isEqual(_msg.data.action, 'EditCounterWidget') ||
									isEqual(_msg.data.action, 'IncreaseCounterWidget') ||
									isEqual(_msg.data.action, 'DecreaseCounterWidget')
								) {
									Emitter.emit(`counter-widget-${_msg.data.value.name}`, {
										uuid: _msg.data.value.uuid,
										name: _msg.data.value.name,
										action: _msg.data.action,
										response: _msg.data.value.response,
									});
								} else if (
									isEqual(_msg.data.action, 'GetTextListWidgetItemIndex') ||
									isEqual(_msg.data.action, 'GetTextListWidgetValues') ||
									isEqual(_msg.data.action, 'SetTextListWidgetItemIndex') ||
									isEqual(_msg.data.action, 'SetTextListWidgetValues')
								) {
									Emitter.emit(`textlist-widget-${_msg.data.value.name}`, {
										uuid: _msg.data.value.uuid,
										name: _msg.data.value.name,
										action: _msg.data.action,
										response: _msg.data.value.response,
									});
								}
								break;
							default:
								break;
						}
					}
					break;
				case 'server':
					if (objHas.call(_msg, 'data') && objHas.call(_msg.data, 'message')) {
						if (isEqual(_msg.data.message, 'connected')) {
							Emitter.emit('xpn.joinService', 'xpression');
							Emitter.emit('network.connected', {});
						}
					}

					break;
				default:
					Emitter.emit(_msg.service, {
						..._msg.data,
					});
					break;
			}
		}
	};

	// websocket onclose event listener
	onClose = ({ event = { reason: '' }, timeout = 0 }) => {
		this.connecting = false;
		this.connected = false;
		this.displayMsg = ReconnectMsg(timeout, this.autoReconnect, event.reason);
		this.reconnectTime = timeout;
		this.reconnectInterval = window.setInterval(() => {
			this.reconnectTime -= 1000;
			this.displayMsg = ReconnectMsg(this.reconnectTime, this.autoReconnect, event.reason);
			Emitter.emit('network.connectionMsg', this.displayMsg);
		}, 1000);

		Emitter.emit('network.disconnected', this.displayMsg);
	};

	// websocket onerror event listener
	onError = () => {
		clearInterval(this.reconnectInterval);
		this.connecting = false;
		this.connected = false;
		this.displayMsg = 'Connection encountered error!';
		Emitter.emit('network.connectionMsg', this.displayMsg);
	};
}

const ReconnectMsg = (timeout: number = 0, autoReconnect: boolean = true, reason: string = '') => {
	const attempTime = Math.min(10000 / 1000, (timeout + timeout) / 1000);
	let message = 'Connection closed.';
	if (webSockets.ws !== null && autoReconnect && attempTime > 0)
		message = `${message} Reconnect will be attempted in ${attempTime} second${attempTime > 1 ? 's' : ''}. ${reason}`;

	return message.trim();
};

export default Connection;
