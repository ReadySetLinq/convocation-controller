import React, { memo, Fragment } from 'react';
import { Field } from 'formik';
import { isEqual } from 'lodash';
import { generate } from 'shortid';
import { TextFormField } from '../../views/form-field';

const GoogleSheetsSettings: React.FC<{ isSubmitting: boolean }> = ({ isSubmitting = false }) => {
	return (
		<Fragment>
			<Field
				name='gs.API_Key'
				id={`gs.API_Key-${generate()}`}
				label='Google API Key'
				placeholder='The API Key for google'
				disabled={isSubmitting}
				component={TextFormField}
			/>

			<Field
				name='gs.GoogleSheetsID'
				id={`gs.GoogleSheetsID-${generate()}`}
				label='Spreadsheet ID'
				placeholder='The ID for the google sheets containing all data'
				disabled={isSubmitting}
				component={TextFormField}
			/>

			<Field
				name='gs.StudentID'
				id={`gs.StudentID-${generate()}`}
				label='Student Unique ID'
				placeholder='The unique id column for a student'
				disabled={isSubmitting}
				component={TextFormField}
			/>

			<Field
				name='gs.Name_Column'
				id={`gs.Name-${generate()}`}
				label='Student Name Column'
				placeholder='The name column for a student'
				disabled={isSubmitting}
				component={TextFormField}
			/>

			<Field
				name='gs.Extra_Column'
				id={`gs.Extra_Column-${generate()}`}
				label='Student "Extra" Column'
				placeholder='The "Extra" column for a student'
				disabled={isSubmitting}
				component={TextFormField}
			/>

			<Field
				name='gs.Multiplier_Column'
				id={`gs.Multiplier_Column-${generate()}`}
				label='Student "Multiplier" Column'
				placeholder='The "Multiplier" column for a student [If left blank the multiplier system will always display 0]'
				disabled={isSubmitting}
				component={TextFormField}
			/>

			<Field
				name='gs.Division_Column'
				id={`gs.Division_Column-${generate()}`}
				label='Program "Division" Column'
				placeholder='The "Division" column for a students program [If left blank this will not auto-update the background image based on program]'
				disabled={isSubmitting}
				component={TextFormField}
			/>

			<Field
				name='gs.OrderBy'
				id={`gs.OrderBy-${generate()}`}
				label='OrderBy Column'
				placeholder='[A comma seperated list of column names, leave empty for default]'
				disabled={isSubmitting}
				component={TextFormField}
			/>
		</Fragment>
	);
};

export default memo(GoogleSheetsSettings, isEqual);
