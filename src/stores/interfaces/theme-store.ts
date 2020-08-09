export type ThemeTypes = 'light' | 'dark' | undefined;

export interface ThemeTypesData {
	loaded?: boolean;
	theme: ThemeTypes;
}
