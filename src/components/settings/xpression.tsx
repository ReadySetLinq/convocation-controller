import React, { memo, Fragment } from 'react';
import { Field } from 'formik';
import { isEqual } from 'lodash';
import { generate } from 'shortid';
import { TextFormField } from '../../views/form-field';

const XpressionSettings: React.FC<{ isSubmitting: boolean }> = ({ isSubmitting = false }) => {
	return (
		<Fragment>
			<Field
				name='xpn.tmrDelay'
				id={`tmrDelay-${generate()}`}
				label='Delay (milliseconds)'
				type='number'
				min='0'
				placeholder='Delay Between Names (milliseconds)'
				disabled={isSubmitting}
				component={TextFormField}
			/>

			<Field
				name='xpn.ExtraTakeID'
				id={`ExtraTakeID-${generate()}`}
				label='Extra TakeID'
				type='number'
				placeholder='[Set to -1 for no extra element]'
				disabled={isSubmitting}
				component={TextFormField}
			/>

			<Field
				name='xpn.TakeID'
				id={`TakeID-${generate()}`}
				label='Text TakeID'
				type='number'
				min='-999'
				placeholder='The TakeID sequencer number for the take item displaying names'
				disabled={isSubmitting}
				component={TextFormField}
			/>

			<Field
				name='xpn.Name'
				id={`Name-${generate()}`}
				label='Student Name property name'
				placeholder='The Xpression property object name'
				disabled={isSubmitting}
				component={TextFormField}
			/>

			<Field
				name='xpn.Extra'
				id={`Extra-${generate()}`}
				label='Student "Extra" property name'
				placeholder='[Leave empty if not being used]'
				disabled={isSubmitting}
				component={TextFormField}
			/>

			<Field
				name='xpn.Multiplier'
				id={`Multiplier-${generate()}`}
				label='Student "Multiplier" property name'
				placeholder='[Leave empty if not being used]'
				disabled={isSubmitting}
				component={TextFormField}
			/>
		</Fragment>
	);
};

export default memo(XpressionSettings, isEqual);
