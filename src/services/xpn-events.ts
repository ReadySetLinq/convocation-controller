import Emitter from './emitter';

import { UUID, UUID_TakeID, UUID_TakeID_ObjName_Value_PropName } from './interfaces/xpn-events';

export class XPN_Events {
	public addListeners = () => {
		// Register all event "on" listeners
		Object.entries(events).forEach(([key, value]) => {
			Emitter.on(key, value);
		});
	};

	public removeListeners = () => {
		// Remove all event listeners
		Object.keys(events).forEach((key) => {
			Emitter.off(key);
		});
	};
}

export const events = {
	// Main
	'xpn.start': ({ uuid = null }: UUID) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'main',
					action: 'start',
					properties: { uuid },
				},
			}),
		);
	},
	// Take Items
	'xpn.GetTakeItemStatus': ({ uuid = null, takeID = -1 }: UUID_TakeID) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'takeitem',
					action: 'GetTakeItemStatus',
					properties: { uuid, takeID },
				},
			}),
		);
	},
	'xpn.SetTakeItemOffline': ({ uuid = null, takeID = -1 }: UUID_TakeID) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'takeitem',
					action: 'SetTakeItemOffline',
					properties: { uuid, takeID },
				},
			}),
		);
	},
	'xpn.SetTakeItemOnline': ({ uuid = null, takeID = -1 }: UUID_TakeID) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'takeitem',
					action: 'SetTakeItemOnline',
					properties: { uuid, takeID },
				},
			}),
		);
	},
	'xpn.EditTakeItemProperty': ({
		uuid = null,
		takeID = -1,
		objName = '',
		value = '',
		propName = '',
	}: UUID_TakeID_ObjName_Value_PropName) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'takeitem',
					action: 'EditTakeItemProperty',
					properties: {
						uuid,
						takeID,
						objName,
						value,
						propName,
					},
				},
			}),
		);
	},
};

export default XPN_Events;
