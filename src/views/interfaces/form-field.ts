export interface TextFormFieldProps {
	fullWidth?: boolean;
	margin?: 'normal' | 'none' | 'dense' | undefined;
}

export type option = { label: string; value: string };

export interface SelectFormFieldProps {
	label?: string;
	options: option[];
}

export interface SliderFormFieldProps {
	showValue?: boolean;
	step?: number;
	min?: number;
	max?: number;
	marks?: boolean;
	label: string;
}
