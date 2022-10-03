import { atom, PrimitiveAtom } from 'jotai';

import { defaultThemeStoreState } from './constants/theme-store';
import { defaultSettingsStoreState } from '../components/settings/constants/settings';
import { defaultStudentsStoreState } from './constants/student-store';
import { defaultConvocationStoreState } from './constants/convocation-store';
import { defaultConnectionStoreState } from './constants/connection-store';

import { ThemeTypesData } from './interfaces/theme-store';
import { SettingsStoreState } from '../components/settings/interfaces/settings';
import { StudentsStoreState } from './interfaces/student-store';
import { ConvocationStoreState } from './interfaces/convocation-store';
import { ConnectionStoreState } from './interfaces/connection-store';

export const themeState: PrimitiveAtom<ThemeTypesData> = atom(defaultThemeStoreState);

export const convocationState: PrimitiveAtom<ConvocationStoreState> = atom(defaultConvocationStoreState);

export const settingsState: PrimitiveAtom<SettingsStoreState> = atom(defaultSettingsStoreState);

export const studentsState: PrimitiveAtom<StudentsStoreState> = atom(defaultStudentsStoreState);

export const connectionState: PrimitiveAtom<ConnectionStoreState> = atom(defaultConnectionStoreState);
