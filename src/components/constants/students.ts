import { generate } from "shortid";

import { editTakeItemProps } from "../interface/students";

export const defaultEditTakeItemProps: editTakeItemProps = {
  uuid: generate(),
  propName: "text",
  materialName: null,
  takeID: -1,
  objName: "",
  value: "",
};

export enum Loading {
  CHECKING = 0,
  LOADING_STUDENTS,
  PROCESSING_STUDENTS,
  RESETTING_STUDENTS,
  XPN_FAILED,
  EMPTY,
}

export const loadingStates = [
  "Checking settings...",
  "Loading Student Data...",
  "Processing Student Data...",
  "Resetting Student Data...",
  "Failed to start Xpression!",
  "",
];
