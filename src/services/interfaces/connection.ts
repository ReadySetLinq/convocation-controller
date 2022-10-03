import { NetworkSettingsData } from '../../components/settings/interfaces/network';
import XPN_Events from '../xpn-events';
export interface ConnectionImplementations {
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
