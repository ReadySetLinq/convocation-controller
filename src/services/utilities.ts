import { createContext, useRef, useEffect } from 'react';
import { transform, isEqual, isObject, isEmpty } from 'lodash';

import { Websockets } from './websockets';
import { Connection } from './connection';

export const corsAnywhere = 'https://cors.bridged.cc/';
export const corsAllOrigins = 'https://api.allorigins.win/raw?url=';

export const createCtx = <ContextType>() => {
	const ctx = createContext<ContextType | undefined>(undefined);
	return ctx;
};

export const usePrevious = <T extends {}>(value: T): T => {
	const ref = useRef<T>(value);

	useEffect(() => {
		ref.current = value;
	});

	return ref.current;
};

export const truncate = ($string: string, $length: number, $dots: string = '...') => {
	return String($string).length > $length ? $string.substring(0, $length - String($dots).length) + $dots : $string;
};

export const isDifferent = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

export const deepMerge = (opts: Record<string, any>, overrides: Record<string, any>, lowerCase: boolean = false) => {
	let out: Record<string, any> = {},
		i: string;
	if (Array.isArray(opts)) {
		return opts.concat(overrides);
	}
	for (i in opts) {
		const key: string = lowerCase ? i.toLowerCase() : i;
		out[key] = opts[i];
	}
	for (i in overrides) {
		const key: string = lowerCase ? i.toLowerCase() : i;
		const value: any = overrides[i];
		out[key] = key in out && typeof value == 'object' ? deepMerge(out[key], value, key === 'headers') : value;
	}
	return out;
};

export const getObjDifferences = (object: any, base: any) => {
	function changes(object: any, base: any) {
		const accumulator: any = {};
		Object.keys(base).forEach((key: string) => {
			if (object[key] === undefined) {
				accumulator[`${String(key)}`] = base[key];
			}
		});
		return transform(
			object,
			(accumulator, value, key) => {
				if (base[key] === undefined) {
					accumulator[`${String(key)}`] = value;
				} else if (!isEqual(value, base[key])) {
					accumulator[key] = isObject(value) && isObject(base[key]) ? changes(value, base[key]) : value;
				}
			},
			accumulator,
		);
	}
	return changes(object, base);
};

export const replaceItemAtIndex = (arr: any[], index: number, newValue: any) => {
	return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
};

export const removeItemAtIndex = (arr: any[], index: number) => {
	return [...arr.slice(0, index), ...arr.slice(index + 1)];
};

export const getDataValue = (student: any = {}, column: string = '') => {
	if (!isEmpty(column) && objHas.call(student, column)) return student[column];
	return '';
};

export const encodeUnicode = (str: string) => {
	return btoa(
		encodeURIComponent(str).replace(/[!'()*]/g, (c: string) => {
			return '%' + c.charCodeAt(0).toString(16);
		}),
	);
};

export const decodeUnicode = (str: string) => {
	return decodeURIComponent(atob(str));
};

export const webSockets = new Websockets();
export const connection = new Connection();

export const objHas = Object.prototype.hasOwnProperty;

export const Utilities = {
	corsAnywhere,
	createCtx,
	usePrevious,
	truncate,
	isDifferent,
	deepMerge,
	getObjDifferences,
	replaceItemAtIndex,
	removeItemAtIndex,
	encodeUnicode,
	decodeUnicode,
	webSockets,
	connection,
	objHas,
};

export default Utilities;
