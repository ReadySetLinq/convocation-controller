import React, { useEffect, useRef, useCallback } from 'react';
import { Box, AppBar, Toolbar, Tab, Grid, Button } from '@material-ui/core';
import { TabContext, TabPanel, TabList } from '@material-ui/lab';
import SettingsIcon from '@material-ui/icons/Settings';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import bcrypt from 'bcryptjs';

import { credentials } from './constants/main';
import { TextFormField } from '../views/form-field';

import { useStyles } from '../services/constants/styles';

import { hashed } from './constants/login';
import { initialLogin, LoginProps, LoginState } from './interface/login';

const Login: React.FC<LoginProps> = ({ state, setState }) => {
	const styles = useStyles();
	let isMounted = useRef<boolean>(false); // Only update states if we are still mounted after loading

	const attempLogin = (username: string, password: string) => {
		if (username === credentials.username) {
			return bcrypt.compareSync(`${username}-${password}`, hashed);
		} else {
			return false;
		}
	};

	const onLogin = useCallback(
		(values: LoginState, actions: FormikHelpers<LoginState>) => {
			if (!isMounted.current) return;

			actions.setSubmitting(true);

			if (attempLogin(values.username, values.password)) {
				setState((oldState) => ({ ...oldState, loggedIn: true, loginError: '' }));
			} else {
				setState((oldState) => ({ ...oldState, loginError: 'Failed to login! Try again...' }));
			}

			if (!isMounted.current) return;
			actions.setStatus();
			actions.setSubmitting(false);
			actions.resetForm({ values });
		},
		[setState],
	);

	useEffect(() => {
		isMounted.current = true;

		// componentWillUnmount
		return () => {
			isMounted.current = false; // Mark as unmounted
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Box color='text.primary' bgcolor='background.paper' className={styles.boxWrapper} flexGrow={1} height='200vh'>
			<TabContext value='login'>
				<AppBar position='static' color='inherit' className={styles.appBar}>
					<Toolbar>
						<div className={styles.fullWidth}>
							<TabList variant='fullWidth' indicatorColor='primary' textColor='primary' aria-label='Menu Bar'>
								<Tab value='login' label='Login' aria-label='Login' icon={<SettingsIcon />} disableRipple />
							</TabList>
						</div>
					</Toolbar>
				</AppBar>
				<TabPanel value='login'>
					<div className={styles.fullWidth}>
						<div className={styles.errorText}>{state.loginError}</div>
						<Formik initialValues={initialLogin} onSubmit={onLogin}>
							{({ values, touched, isValid, dirty, isSubmitting }) => {
								return (
									<Form
										onChange={() => {
											if (dirty && state.loginError !== '') setState((oldState) => ({ ...oldState, loginError: '' }));
										}}
									>
										<Field
											name='username'
											id='login.Username'
											label='Username'
											component={TextFormField}
											disabled={isSubmitting || !touched}
										/>
										<Field
											name='password'
											id='login.Password'
											label='Password'
											type='password'
											component={TextFormField}
											disabled={isSubmitting || !touched}
										/>

										<Grid container spacing={1}>
											<Grid item xs={6}></Grid>
											<Grid item xs={6}>
												<Button
													variant='contained'
													color={!isSubmitting && touched && isValid ? 'primary' : 'secondary'}
													size='large'
													type='submit'
													disabled={
														!isValid ||
														!dirty ||
														isSubmitting ||
														!touched ||
														(values.username.length === 0 && values.password.length === 0)
													}
												>
													{isValid && dirty && !isSubmitting && touched
														? 'Login'
														: isSubmitting
														? 'Logging In...'
														: !isValid && dirty
														? 'Error! Try Again'
														: 'Login'}
												</Button>
											</Grid>
										</Grid>
									</Form>
								);
							}}
						</Formik>
					</div>
				</TabPanel>
			</TabContext>
		</Box>
	);
};

export default Login;
