import { atom, PrimitiveAtom } from 'jotai';

import { defaultThemeStoreState } from './constants/theme-store';
import { defaultSettingsStoreState } from '../components/settings/constants/settings';
import { defaultStudentsStoreState } from './constants/student-store';
import { defaultConvocationStoreState } from './constants/convocationState';

import { ThemeTypesData } from './interfaces/theme-store';
import { SettingsStoreState } from '../components/settings/interfaces/settings';
import { StudentsStoreState } from './interfaces/student-store';
import { ConvocationStoreState } from './interfaces/convocation-store';

export const themeState: PrimitiveAtom<ThemeTypesData> = atom(defaultThemeStoreState);

export const convocationState: PrimitiveAtom<ConvocationStoreState> = atom(defaultConvocationStoreState);

export const settingsState: PrimitiveAtom<SettingsStoreState> = atom(defaultSettingsStoreState);

export const studentsState: PrimitiveAtom<StudentsStoreState> = atom(defaultStudentsStoreState);
