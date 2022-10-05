import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Grid, Button, Tabs, Tab, Paper } from '@mui/material';
import { Formik, Form, FormikHelpers } from 'formik';
import { isEqual } from 'lodash';

import {
	loadedSettings,
	googleSheetsSettings,
	networkSettings,
	xpnSettings,
	setGoogleSheetsSettings,
	setNetworkSettings,
	setXPNSettings,
} from '../../stores/selectors';
import NetworkSettings from './network';
import XpressionSettings from './xpression';
import GoogleSheetsSettings from './google-sheets';
import { useStyles } from '../../services/constants/styles';
import { TabPanel, a11yProps } from '../../views/tab-panel';
import LoadingSpinner from '../../views/loading-spinner';

import { settingsSchema } from './constants/settings';
import { updateNetwork, updateGoogleSheet, updateXpression } from '../../services/api';

// Import Interfaces
import { SettingsState } from './interfaces/settings';

type errorType = {
	network?: string;
	googleSheets?: string;
	xpression?: string;
};

const defaultErrorType: errorType = {
	network: undefined,
	googleSheets: undefined,
	xpression: undefined,
};

const Settings = () => {
	const { classes } = useStyles();
	const isSettingsLoaded = useAtomValue(loadedSettings);
	const googleSheetsStore = useAtomValue(googleSheetsSettings);
	const networkStore = useAtomValue(networkSettings);
	const xpnStore = useAtomValue(xpnSettings);
	const setGoogleSheetsStore = useSetAtom(setGoogleSheetsSettings);
	const setXPNStore = useSetAtom(setXPNSettings);
	const setNetworkStore = useSetAtom(setNetworkSettings);
	const initialSettings: SettingsState = {
		network: networkStore,
		gs: googleSheetsStore,
		xpn: xpnStore,
	};
	const [tabIndex, setTabIndex] = useState(0);
	const networkMutation = useMutation(updateNetwork);
	const googleSheetMutation = useMutation(updateGoogleSheet);
	const xpressionMutation = useMutation(updateXpression);
	const [submitErrors, setsubmitErrors] = useState<errorType>(defaultErrorType);
	let isMounted = useRef<boolean>(false); // Only update states if we are still mounted after loading

	const hasChanged = useCallback(
		(values: SettingsState) =>
			!isEqual(values.gs, googleSheetsStore) ||
			!isEqual(values.network, networkStore) ||
			!isEqual(values.xpn, xpnStore),
		[googleSheetsStore, networkStore, xpnStore],
	);

	const handleTabChange = useCallback((event: React.ChangeEvent<{}>, newTabIndex: number) => {
		setTabIndex(newTabIndex);
	}, []);

	const onSubmit = useCallback(
		(values: SettingsState, actions: FormikHelpers<SettingsState>) => {
			if (!isMounted.current) return;

			actions.setSubmitting(true);

			if (
				isEqual(values.gs, googleSheetsStore) &&
				isEqual(values.xpn, xpnStore) &&
				isEqual(values.network, networkStore)
			) {
				actions.setStatus();
				actions.setSubmitting(false);
				actions.resetForm({ values });
			}

			// Only save if values changed
			let updatedValues = [];
			let submittedError: errorType = { ...defaultErrorType };

			if (!isEqual(values.gs, googleSheetsStore)) {
				updatedValues.push(
					googleSheetMutation.mutate(values.gs, {
						onSettled: (data, error, _variables) => {
							if (!isMounted.current) return;
							if (!data || error) {
								if (error) submittedError.googleSheets = (error as unknown as AxiosError).message;
								values.gs = { ...googleSheetsStore };
							} else setGoogleSheetsStore(data);
						},
					}),
				);
			}

			if (!isEqual(values.xpn, xpnStore)) {
				updatedValues.push(
					xpressionMutation.mutate(values.xpn, {
						onSettled: (data, error, _variables) => {
							if (!isMounted.current) return;
							if (!data || error) {
								if (error) submittedError.xpression = (error as unknown as AxiosError).message;
								values.xpn = { ...xpnStore };
							} else setXPNStore(data);
						},
					}),
				);
			}

			if (!isEqual(values.network, networkStore)) {
				updatedValues.push(
					networkMutation.mutate(values.network, {
						onSettled: (data, error, _variables) => {
							if (!isMounted.current) return;
							if (!data || error) {
								if (error) submittedError.network = (error as unknown as AxiosError).message;
								values.network = { ...networkStore };
							} else setNetworkStore(data);
						},
					}),
				);
			}

			Promise.all(updatedValues).finally(() => {
				if (!isMounted.current) return;
				actions.setStatus();
				actions.setSubmitting(false);
				actions.resetForm({ values });
				setsubmitErrors(submittedError);
			});
		},
		[
			googleSheetMutation,
			googleSheetsStore,
			networkMutation,
			networkStore,
			setGoogleSheetsStore,
			setNetworkStore,
			setXPNStore,
			xpnStore,
			xpressionMutation,
		],
	);

	useEffect(() => {
		isMounted.current = true;

		// componentWillUnmount
		return () => {
			isMounted.current = false; // Mark as unmounted
		};
	}, []);

	if (!isSettingsLoaded) return <LoadingSpinner key={'settings.LoadingSpinner'} />;

	return (
		<div className={classes.root}>
			<Grid container className={classes.grid} justifyContent='center' alignItems='center' spacing={1}>
				<Grid item>
					<Formik initialValues={initialSettings} validationSchema={settingsSchema} onSubmit={onSubmit}>
						{({ values, errors, touched, isValid, dirty, isSubmitting }) => {
							const tabProps = {
								network: {
									changed:
										touched.network !== undefined && !isEqual(initialSettings.network, values.network) ? '* ' : '',
									error: errors.network !== undefined || errors.network !== undefined ? ' - Error' : '',
								},
								gs: {
									changed: touched.gs !== undefined && !isEqual(initialSettings.gs, values.gs) ? '* ' : '',
									error: errors.gs !== undefined ? ' - Error' : '',
								},
								xpn: {
									changed: touched.xpn !== undefined && !isEqual(initialSettings.xpn, values.xpn) ? '* ' : '',
									error: errors.xpn !== undefined ? ' - Error' : '',
								},
							};

							if (
								hasChanged(values) &&
								(submitErrors.network !== undefined ||
									submitErrors.googleSheets !== undefined ||
									submitErrors.xpression !== undefined)
							) {
								setsubmitErrors({ ...defaultErrorType });
							}

							return (
								<Form>
									<Grid item>
										<div className={`${classes.tabRoot} && ${classes.fullWidth}`}>
											<Tabs
												variant='fullWidth'
												indicatorColor='primary'
												aria-label='Settings'
												value={tabIndex}
												onChange={handleTabChange}
											>
												<Tab
													disableRipple
													label={`${tabProps.network.changed}[Network${tabProps.network.error}]`}
													className={
														tabProps.network.error !== ''
															? classes.errorText
															: tabProps.network.changed !== ''
															? classes.changedText
															: undefined
													}
													{...a11yProps(0)}
												/>
												<Tab
													disableRipple
													label={`${tabProps.gs.changed}[Google Sheets${tabProps.gs.error}]`}
													className={
														tabProps.gs.error !== ''
															? classes.errorText
															: tabProps.gs.changed !== ''
															? classes.changedText
															: undefined
													}
													{...a11yProps(1)}
												/>
												<Tab
													disableRipple
													label={`${tabProps.xpn.changed}[Xpression${tabProps.xpn.error}]`}
													className={
														tabProps.xpn.error !== ''
															? classes.errorText
															: tabProps.xpn.changed !== ''
															? classes.changedText
															: undefined
													}
													{...a11yProps(2)}
												/>
											</Tabs>
											<Paper>
												<div>
													{submitErrors.network && (
														<p className={classes.errorText}>Error saving Network changes: {submitErrors.network}</p>
													)}
													{submitErrors.googleSheets && (
														<p className={classes.errorText}>
															Error saving GoogleSheets changes: {submitErrors.googleSheets}
														</p>
													)}
													{submitErrors.xpression && (
														<p className={classes.errorText}>
															Error saving Xpression changes: {submitErrors.xpression}
														</p>
													)}
												</div>
												<TabPanel value={tabIndex} index={0}>
													<NetworkSettings key={'settings.NetworkSettings'} isSubmitting={isSubmitting} />
												</TabPanel>
												<TabPanel value={tabIndex} index={1}>
													<GoogleSheetsSettings key={'settings.GoogleSheetsSettings'} isSubmitting={isSubmitting} />
												</TabPanel>
												<TabPanel value={tabIndex} index={2}>
													<XpressionSettings key={'settings.XpressionSettings'} isSubmitting={isSubmitting} />
												</TabPanel>
											</Paper>
										</div>
									</Grid>

									<Grid container spacing={1}>
										<Grid item xs={6}></Grid>
										<Grid item xs={6}>
											<Button
												variant='contained'
												color={!isSubmitting && touched && isValid ? 'primary' : 'secondary'}
												size='large'
												type='submit'
												disabled={!isValid || !dirty || isSubmitting || !touched || !hasChanged(values)}
											>
												{isValid && dirty && !isSubmitting && touched && hasChanged(values)
													? 'Save Settings'
													: isSubmitting
													? 'Saving...'
													: !isValid && dirty
													? 'Error!'
													: 'Saved'}
											</Button>
										</Grid>
									</Grid>
								</Form>
							);
						}}
					</Formik>
				</Grid>
			</Grid>
		</div>
	);
};

export default memo(Settings, isEqual);
