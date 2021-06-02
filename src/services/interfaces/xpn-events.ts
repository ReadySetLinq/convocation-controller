// Interface Exports
export interface UUID {
  uuid: string | null;
}

// Interface Exports
export interface UUID_TakeID {
  uuid: string | null;
  takeID: number;
}

export interface UUID_TakeID_ObjName_Value_PropName {
  materialName?: string | null;
  uuid: string | null;
  takeID: number;
  objName: string;
  value: string;
  propName: string | null;
}

// XPN Data Interface Exports
export interface XPN_Data {
  name: string;
  action: string;
  response: unknown;
}

export interface XPN_TakeItem_Data {
  uuid?: string;
  takeID: number | string;
  action: string;
  response: unknown;
}

export interface XPN_TakeItem_Layer {
  uuid: string;
  takeID: number | string;
  layer: number | string;
  action: string;
}

export interface XPN_TextListWidget_Data {
  name: string;
  action: string;
  response: string[] | string | number;
}
