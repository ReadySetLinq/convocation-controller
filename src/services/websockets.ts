import Emitter from './emitter';
import { NetworkSettingsData } from '../components/settings/interfaces/network';

import { defaultNetworkSettingsData } from '../components/settings/constants/network';

interface StatusType {
	autoReconnect: boolean;
	connecting: boolean;
	connected: boolean;
}

export class Websockets {
	timeout: number = 1500;
	ws: any = null;
	connectInterval: number = 0;
	connectTimeout: number = 0;
	status: StatusType = { autoReconnect: true, connecting: false, connected: false };
	data: NetworkSettingsData = {
		id: defaultNetworkSettingsData.id,
		ip: defaultNetworkSettingsData.ip,
		port: defaultNetworkSettingsData.port,
		userName: defaultNetworkSettingsData.userName,
		password: defaultNetworkSettingsData.password,
	};

	constructor() {
		Emitter.on('ws.isConnected', this.isConnected);
	}

	destroy = () => {
		const { ws } = this;

		this.status.autoReconnect = false;
		clearTimeout(this.connectInterval); // clear Interval on on open of websocket connection
		clearTimeout(this.connectTimeout); // clear timeout as its connected now

		if (ws) ws.close();
		Emitter.off('ws.isConnected');
	};

	updateData = (networkSettings: NetworkSettingsData) => {
		this.data = { ...this.data, ...networkSettings };
		console.log('ws updateData', this.data);
	};

	// * Websocket Functions
	/**
	 * @function connect
	 * This function establishes the connect with the websocket and also ensures constant reconnection if connection closes
	 */
	connect = () => {
		this.status = {
			autoReconnect: true,
			connecting: false,
			connected: false,
		};

		try {
			console.log('ws connect', `ws://${this.data.ip}:${this.data.port}`);
			if (!this.ws) this.ws = new WebSocket(`ws://${this.data.ip}:${this.data.port}`);

			// websocket onopen event listener
			this.ws.onopen = () => {
				clearTimeout(this.connectInterval); // clear Interval on on open of websocket connection
				clearTimeout(this.connectTimeout); // clear timeout as its connected now

				Emitter.emit('ws.onOpen', { opened: true });
				this.status = {
					...this.status,
					connecting: false,
					connected: true,
				};
				this.timeout = 1500; // reset timer to 1500 on open of websocket connection
			};

			// websocket onmessage event listener
			this.ws.onmessage = (ev: MessageEvent) => {
				Emitter.emit('ws.onMessage', { data: ev.data });
			};

			// websocket onclose event listener
			this.ws.onclose = (ev: CloseEvent) => {
				console.log('ws onclose', ev.currentTarget);
				this.timeout = this.timeout + this.timeout; //increment retry interval

				if (this.status.autoReconnect) {
					Emitter.emit('ws.onClose', {
						event: ev,
						timeout: this.timeout,
					});
					this.connectInterval = window.setTimeout(() => this.connect(), this.timeout); //call _wsCheck function after timeout
				} else {
					Emitter.emit('ws.onClose', {
						event: ev,
						timeout: 0,
					});
					this.ws = null;
				}
			};

			// websocket onerror event listener
			this.ws.onerror = (ev: Event) => {
				console.log('ws onclose', ev.currentTarget);
				Emitter.emit('ws.onError', {
					event: ev,
				});
				this.ws.close();
			};

			// Connection started
			Emitter.emit('ws.onConnect', { connecting: true });
			this.connectTimeout = window.setTimeout(() => {
				clearTimeout(this.connectTimeout); // clear timeout as its connected now
				this.status = {
					...this.status,
					connecting: false,
					connected: false,
				};
				Emitter.emit('ws.onClose', {
					event: { reason: 'Connection timed out' },
					timeout: 0,
				});
				if (this.ws !== null) this.ws.close();
			}, 10000);
		} catch (e) {
			Emitter.emit('ws.onError', {
				event: e,
			});
			clearTimeout(this.connectInterval); // clear Interval on on open of websocket connection
			clearTimeout(this.connectTimeout); // clear timeout as its connected now
		}
	};

	/**
	 * @function disconnect
	 * This function closes the websocket connect
	 * @param autoReconnect
	 * This paramater determins if the connection should autoReconnect once closed (default: true)
	 */
	disconnect = (autoReconnect = true) => {
		const { ws, status } = this;

		status.autoReconnect = autoReconnect;

		if (ws) ws.close();
	};

	/**
	 * utilited by the @function connect to check if the connection is close, if so attempts to reconnect
	 */
	_wsCheck = () => {
		const { ws, connect } = this;
		if (!ws || ws.readyState === WebSocket.CLOSED) connect(); //check if websocket instance is closed, if so call `connect` function.
	};

	_wsIsConnected = () => {
		const { ws } = this;

		return ws && ws.readyState === WebSocket.OPEN;
	};

	isConnected = () => {
		const readyState = this.ws ? this.ws.readyState : WebSocket.CLOSED;
		const connected = readyState === WebSocket.OPEN;

		Emitter.emit('ws.onIsConnected', {
			readyState: readyState,
			connected: connected,
		});
	};

	sendMessage = (msg: string) => {
		const { ws, _wsIsConnected } = this;

		try {
			if (msg && ws && _wsIsConnected()) ws.send(msg); //send data to the server
		} catch (error) {
			if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') console.error({ error }); // catch error
		}
	};
}

export default Websockets;
