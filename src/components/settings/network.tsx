import React, { memo, Fragment } from 'react';
import { Field } from 'formik';
import { isEqual } from 'lodash';
import { generate } from 'shortid';
import { TextFormField } from '../../views/form-field';

const NetworkSettings: React.FC<{ isSubmitting: boolean }> = ({ isSubmitting = false }) => {
	return (
		<Fragment>
			<Field
				name='network.ip'
				id={`ip-${generate()}`}
				label='IP Address'
				placeholder='IP for connecting to Xpression'
				disabled={isSubmitting}
				component={TextFormField}
			/>

			<Field
				name='network.port'
				id={`port-${generate()}`}
				label='Port'
				placeholder='Port for connecting to Xpression'
				type='number'
				disabled={isSubmitting}
				component={TextFormField}
			/>

			<Field
				name='network.userName'
				id={`userName-${generate()}`}
				label='Username'
				disabled={isSubmitting}
				component={TextFormField}
			/>

			<Field
				name='network.password'
				id={`password-${generate()}`}
				label='Password'
				type='password'
				disabled={isSubmitting}
				component={TextFormField}
			/>
		</Fragment>
	);
};

export default memo(NetworkSettings, isEqual);
