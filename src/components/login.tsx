import React, { useEffect, useRef, useCallback } from 'react';
import { Box, AppBar, Toolbar, Tab, Grid, Button } from '@mui/material';
import { TabContext, TabPanel, TabList } from '@mui/lab';
import SettingsIcon from '@mui/icons-material/Settings';
import { Field, Form, Formik, FormikHelpers } from 'formik';

import { TextFormField } from '../views/form-field';

import { getLogin } from '../services/api';
import { useStyles } from '../services/constants/styles';

import { initialLogin, LoginProps, LoginState } from './interface/login';

const Login: React.FC<LoginProps> = ({ state, setState }) => {
	const { classes } = useStyles();
	let isMounted = useRef<boolean>(false); // Only update states if we are still mounted after loading

	const onLogin = useCallback(
		async (values: LoginState, actions: FormikHelpers<LoginState>) => {
			if (!isMounted.current) return;

			actions.setSubmitting(true);

			if (await getLogin(values.username, values.password)) {
				setState((oldState) => ({
					...oldState,
					loggedIn: true,
					loginError: '',
				}));
			} else {
				setState((oldState) => ({
					...oldState,
					loginError: 'Failed to login! Try again...',
				}));
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
		<Box color='text.primary' bgcolor='background.paper' className={classes.boxWrapper} flexGrow={1} height='200vh'>
			<TabContext value='login'>
				<AppBar position='static' color='inherit' className={classes.appBar}>
					<Toolbar>
						<div className={classes.fullWidth}>
							<TabList variant='fullWidth' indicatorColor='primary' textColor='primary' aria-label='Menu Bar'>
								<Tab value='login' label='Login' aria-label='Login' icon={<SettingsIcon />} disableRipple />
							</TabList>
						</div>
					</Toolbar>
				</AppBar>
				<TabPanel value='login'>
					<div className={classes.fullWidth}>
						<div className={classes.errorText}>{state.loginError}</div>
						<Formik initialValues={initialLogin} onSubmit={onLogin}>
							{({ values, isValid, dirty, isSubmitting }) => {
								return (
									<Form
										onChange={() => {
											if (dirty && state.loginError !== '')
												setState((oldState) => ({
													...oldState,
													loginError: '',
												}));
										}}
									>
										<Field
											name='username'
											id='login.Username'
											label='Username'
											component={TextFormField}
											disabled={isSubmitting}
										/>
										<Field
											name='password'
											id='login.Password'
											label='Password'
											type='password'
											component={TextFormField}
											disabled={isSubmitting}
										/>

										<Grid container spacing={1}>
											<Grid item xs={6}></Grid>
											<Grid item xs={6}>
												<Button
													variant='contained'
													color={!isSubmitting && isValid ? 'primary' : 'secondary'}
													size='large'
													type='submit'
													disabled={
														!isValid || isSubmitting || values.username.length === 0 || values.password.length === 0
													}
												>
													{!isSubmitting ? 'Login' : 'Logging In...'}
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
