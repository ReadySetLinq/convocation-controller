import Emitter from './emitter';
import {
	UUID,
	Name,
	UUID_Name,
	UUID_Name_Value,
	UUID_Name_Values,
	UUID_Name_Index,
	UUID_TakeID,
	UUID_TakeID_ObjName_Value_PropName,
} from './interfaces/xpn-events';

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
	'xpn.startXPN': (uuid: UUID = null) => {
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
	'xpn.joinService': (name: Name = '') => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'join',
				data: {
					name,
				},
			}),
		);
	},
	'xpn.leaveService': (name: Name = '') => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'leave',
				data: {
					name,
				},
			}),
		);
	},
	// Take Items
	'xpn.GetTakeItemLayer': ({ uuid = null, takeID = -1 }: UUID_TakeID) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'takeitem',
					action: 'GetTakeItemLayer',
					properties: { uuid, takeID },
				},
			}),
		);
	},
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
	// Counter Widget
	'xpn.GetCounterWidgetValue': ({ uuid = null, name = '' }: UUID_Name) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'GetCounterWidgetValue',
					properties: { uuid, name },
				},
			}),
		);
	},
	'xpn.EditCounterWidget': ({ uuid = null, name = '', value = '' }: UUID_Name_Value) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'EditCounterWidget',
					properties: { uuid, name, value },
				},
			}),
		);
	},
	'xpn.DecreaseCounterWidget': ({ uuid = null, name = '', value = '' }: UUID_Name_Value) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'DecreaseCounterWidget',
					properties: { uuid, name, value },
				},
			}),
		);
	},
	'xpn.IncreaseCounterWidget': ({ uuid = null, name = '', value = '' }: UUID_Name_Value) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'IncreaseCounterWidget',
					properties: { uuid, name, value },
				},
			}),
		);
	},
	// Text List
	'xpn.GetTextListWidgetValues': ({ uuid = null, name = '' }: UUID_Name) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'GetTextListWidgetValues',
					properties: { uuid, name },
				},
			}),
		);
	},
	'xpn.GetTextListWidgetItemIndex': ({ uuid = null, name = '' }: UUID_Name) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'GetTextListWidgetItemIndex',
					properties: { uuid, name },
				},
			}),
		);
	},
	'xpn.SetTextListWidgetValue': ({ uuid = null, name = '', value = '' }: UUID_Name_Value) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'SetTextListWidgetValue',
					properties: { uuid, name, value },
				},
			}),
		);
	},
	'xpn.SetTextListWidgetValues': ({ uuid = null, name = '', values = [] }: UUID_Name_Values) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'SetTextListWidgetValues',
					properties: {
						uuid,
						name,
						values: values.join(';'),
					},
				},
			}),
		);
	},
	'xpn.SetTextListWidgetItemIndex': ({ uuid = null, name = '', index = 0 }: UUID_Name_Index) => {
		Emitter.emit(
			'conn.sendMessage',
			JSON.stringify({
				service: 'xpression',
				data: {
					category: 'widget',
					action: 'SetTextListWidgetItemIndex',
					properties: { uuid, name, index },
				},
			}),
		);
	},
};

export default XPN_Events;
