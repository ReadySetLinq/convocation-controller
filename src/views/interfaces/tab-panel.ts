import { ReactNode } from 'react';

export interface TabPanelProps {
	children?: ReactNode;
	dir?: string;
	index: number;
	value: any;
}
