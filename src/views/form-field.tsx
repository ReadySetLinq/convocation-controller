import React, { memo } from 'react';
import { connect, FieldProps, getIn } from 'formik';
import { isEqual } from 'lodash';
import {
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormHelperText,
	Typography,
	Slider,
} from '@mui/material';

import { TextFormFieldProps, SelectFormFieldProps, SliderFormFieldProps } from './interfaces/form-field';

import { textFormFieldDefaults, selectFormFieldDefaults, sliderFormFieldDefaults } from './constants/form-field';

export const TextFormField: React.FC<FieldProps & TextFormFieldProps> = memo(
	connect(
		({ field, fullWidth = textFormFieldDefaults.fullWidth, margin = textFormFieldDefaults.margin, form, ...props }) => {
			const errorText = getIn(form.touched, field.name) && getIn(form.errors, field.name);

			return (
				<TextField
					fullWidth={fullWidth}
					margin={margin}
					helperText={errorText}
					error={!!errorText}
					{...field}
					{...props}
				/>
			);
		},
	),
	isEqual,
);

export const SelectFormField: React.FC<FieldProps & SelectFormFieldProps> = memo(
	connect(
		({ field, form, label = selectFormFieldDefaults.label, options = selectFormFieldDefaults.options, ...props }) => {
			const errorText = getIn(form.touched, field.name) && getIn(form.errors, field.name);
			return (
				<FormControl fullWidth error={!!errorText}>
					{label && <InputLabel>{label}</InputLabel>}
					<Select fullWidth {...field} {...props}>
						{options.map((option) => (
							<MenuItem key={`selectFormField-${option.value}`} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</Select>
					<FormHelperText>{errorText}</FormHelperText>
				</FormControl>
			);
		},
	),
	isEqual,
);

export const SliderFormField: React.FC<FieldProps & SliderFormFieldProps> = memo(
	({
		field,
		form,
		label,
		showValue = sliderFormFieldDefaults.showValue,
		step = sliderFormFieldDefaults.step,
		min = sliderFormFieldDefaults.min,
		max = sliderFormFieldDefaults.max,
		marks = sliderFormFieldDefaults.marks,
		...props
	}) => {
		return (
			<>
				{showValue ? (
					<Typography>
						{label} ({field.value})
					</Typography>
				) : (
					<Typography>{label}</Typography>
				)}
				<Slider
					onChange={(_, v) => form.setFieldValue(field.name, v)}
					value={field.value}
					step={step}
					min={min}
					max={max}
					marks={marks}
					{...props}
				/>
			</>
		);
	},
	isEqual,
);
