import { atom, PrimitiveAtom } from 'jotai';

import { ThemeTypesData } from './interfaces/theme-store';
import { SettingsStoreState } from '../components/settings/interfaces/settings';
import { StudentsStoreState } from './interfaces/student-store';

import { defaultThemeStoreState } from './constants/theme-store';
import { defaultSettingsStoreState } from '../components/settings/constants/settings';
import { defaultStudentsStoreState } from './constants/student-store';

export const themeState: PrimitiveAtom<ThemeTypesData> = atom(defaultThemeStoreState);

export const settingsState: PrimitiveAtom<SettingsStoreState> = atom(defaultSettingsStoreState);

export const studentsState: PrimitiveAtom<StudentsStoreState> = atom(defaultStudentsStoreState);
