import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useAtom } from 'jotai';
import { Grid, Button, Tabs, Tab, Paper } from '@material-ui/core';
import { Formik, Form, FormikHelpers } from 'formik';
import { isEqual } from 'lodash';

import { settingsState } from '../../stores/atoms';
import NetworkSettings from './network';
import XpressionSettings from './xpression';
import GoogleSheetsSettings from './google-sheets';
import ImportExportSettings from './import-export'
import Storage from '../../services/storage';
import { useStyles } from '../../services/constants/styles';
import { TabPanel, a11yProps } from '../../views/tab-panel';
import LoadingSpinner from '../../views/loading-spinner';

// Import Interfaces
import { SettingsState } from './interfaces/settings';

import { settingsSchema } from './constants/settings';
import { defaultSettingKeys } from '../../services/constants/storage';
import { clearGoogleCache } from '../../services/google-sheets';

const Settings = () => {
	const styles = useStyles();
	const [settingsStore, setSettingsStore] = useAtom(settingsState);
	const initialSettings: SettingsState = {
		network: settingsStore.network,
		gs: settingsStore.gs,
		xpn: settingsStore.xpn,
	};
	const [tabIndex, setTabIndex] = useState(0);
	let isMounted = useRef<boolean>(false); // Only update states if we are still mounted after loading

	const handleTabChange = useCallback((event: React.ChangeEvent<{}>, newTabIndex: number) => {
		setTabIndex(newTabIndex);
	}, []);

	const onSubmit = useCallback(
		(values: SettingsState, actions: FormikHelpers<SettingsState>) => {
			if (!isMounted.current) return;

			actions.setSubmitting(true);

			if (isEqual(values, settingsStore)) {
				actions.setStatus();
				actions.setSubmitting(false);
				actions.resetForm({ values });
			}

			// Only save if values changed
			let updatedValues = [];

			if (!isEqual(values.network, settingsStore.network)) {
				updatedValues.push(
					Storage.saveData(defaultSettingKeys.Network, values.network).then(() => {
						if (!isMounted.current) return;
						setSettingsStore((oldStore) => ({ ...oldStore, network: values.network }));
					}),
				);
			}

			if (!isEqual(values.gs, settingsStore.gs)) {
				updatedValues.push(
					Storage.saveData(defaultSettingKeys.GS, values.gs).then(() => {
						if (!isMounted.current) return;
						if (!isEqual(values.gs.GoogleSheetsID, settingsStore.gs.GoogleSheetsID)) clearGoogleCache(); // ID changed so clear cached data
						setSettingsStore((oldStore) => ({ ...oldStore, gs: values.gs }));
					}),
				);
			}

			if (!isEqual(values.xpn, settingsStore.xpn)) {
				updatedValues.push(
					Storage.saveData(defaultSettingKeys.XPN, values.xpn).then(() => {
						if (!isMounted.current) return;
						setSettingsStore((oldStore) => ({ ...oldStore, xpn: values.xpn }));
					}),
				);
			}

			Promise.all(updatedValues).finally(() => {
				if (!isMounted.current) return;
				actions.setStatus();
				actions.setSubmitting(false);
				actions.resetForm({ values });
			});
		},
		[setSettingsStore, settingsStore],
	);

	useEffect(() => {
		isMounted.current = true;

		// componentWillUnmount
		return () => {
			isMounted.current = false; // Mark as unmounted
		};
	}, []);

	if (!settingsStore.loaded) return <LoadingSpinner key={'settings.LoadingSpinner'} />;

	return (
		<div className={styles.root}>
			<Grid container className={styles.grid} justify='center' spacing={1}>
				<Grid item>
					<Formik initialValues={initialSettings} validationSchema={settingsSchema} onSubmit={onSubmit}>
						{({ values, errors, touched, isValid, dirty, isSubmitting }) => {
							const tabProps = {
								network: {
									changed:
										touched.network !== undefined && !isEqual(initialSettings.network, values.network) ? '* ' : '',
									error: errors.network !== undefined ? ' - Error' : '',
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

							return (
								<Form>
									<Grid item>										
										<div className={`${styles.tabRoot} && ${styles.fullWidth}`}>
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
															? styles.errorText
															: tabProps.network.changed !== ''
															? styles.changedText
															: undefined
													}
													{...a11yProps(0)}
												/>
												<Tab
													disableRipple
													label={`${tabProps.gs.changed}[Google Sheets${tabProps.gs.error}]`}
													className={
														tabProps.gs.error !== ''
															? styles.errorText
															: tabProps.gs.changed !== ''
															? styles.changedText
															: undefined
													}
													{...a11yProps(1)}
												/>
												<Tab
													disableRipple
													label={`${tabProps.xpn.changed}[Xpression${tabProps.xpn.error}]`}
													className={
														tabProps.xpn.error !== ''
															? styles.errorText
															: tabProps.xpn.changed !== ''
															? styles.changedText
															: undefined
													}
													{...a11yProps(2)}
												/>
												<Tab
													disableRipple
													label={`[Import/Export]`}
													{...a11yProps(3)}
												/>
											</Tabs>
											<Paper>
												<TabPanel value={tabIndex} index={0}>
													<NetworkSettings key={'settings.NetworkSettings'} isSubmitting={isSubmitting} />
												</TabPanel>
												<TabPanel value={tabIndex} index={1}>
													<GoogleSheetsSettings key={'settings.GoogleSheetsSettings'} isSubmitting={isSubmitting} />
												</TabPanel>
												<TabPanel value={tabIndex} index={2}>
													<XpressionSettings key={'settings.XpressionSettings'} isSubmitting={isSubmitting} />
												</TabPanel>
												<TabPanel value={tabIndex} index={3}>
													<ImportExportSettings key={'settings.ImportExportSettings'} isSubmitting={isSubmitting} />
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
												disabled={!isValid || !dirty || isSubmitting || !touched || isEqual(values, settingsStore)}
											>
												{isValid && dirty && !isSubmitting && touched && !isEqual(values, settingsStore)
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
