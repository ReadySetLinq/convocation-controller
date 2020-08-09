import { TextFormFieldProps, SelectFormFieldProps, SliderFormFieldProps } from '../interfaces/form-field';

export const textFormFieldDefaults: TextFormFieldProps = {
	fullWidth: true,
	margin: 'normal',
};

export const selectFormFieldDefaults: SelectFormFieldProps = {
	label: undefined,
	options: [],
};

export const sliderFormFieldDefaults: SliderFormFieldProps = {
	label: '',
	showValue: false,
	step: 1,
	min: 0,
	max: 100,
	marks: false,
};
