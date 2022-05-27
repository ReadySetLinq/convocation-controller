import { atom, RecoilState } from "recoil";

import { ThemeTypesData } from "./interfaces/theme-store";
import { SettingsStoreState } from "../components/settings/interfaces/settings";
import { StudentsStoreState } from "./interfaces/student-store";

import { defaultThemeStoreState } from "./constants/theme-store";
import { defaultSettingsStoreState } from "../components/settings/constants/settings";
import { defaultStudentsStoreState } from "./constants/student-store";

export const themeState: RecoilState<ThemeTypesData> = atom({
  key: "themeState",
  default: defaultThemeStoreState,
});

export const settingsState: RecoilState<SettingsStoreState> = atom({
  key: "settingsState",
  default: defaultSettingsStoreState,
});

export const studentsState: RecoilState<StudentsStoreState> = atom({
  key: "studentsState",
  default: defaultStudentsStoreState,
});
