import { generate } from "shortid";

import { StudentData, StudentsStoreState } from "../interfaces/student-store";

export const defaultStudentData: StudentData = {
  id: generate(),
  name: "",
  extra: "",
  multiplier: 0,
  displayName: "",
};

export const defaultProgramName = "[Select A Program]";

export const defaultStudentsStoreState: StudentsStoreState = {
  isLoading: true,
  loggedIn: false,
  ctrlStarted: false,
  isExtraOnline: false,
  isOnline: false,
  isBackgroundOnline: false,
  students: [],
  programName: defaultProgramName,
  programs: [defaultProgramName],
  selectedIndex: -1,
  selectedStudentID: "",
  lastProgram: "",
  switching: false,
};
