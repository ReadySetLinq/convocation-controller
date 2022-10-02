import React, { useRef, useCallback, useEffect } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { useQuery } from '@tanstack/react-query';
import { Box, AppBar, Toolbar, Tab, MenuItem, Select } from '@material-ui/core';
import { TabContext, TabPanel, TabList } from '@material-ui/lab';
import SettingsIcon from '@material-ui/icons/Settings';

import { convocationState } from '../stores/atoms';
import { defaultConvocationStoreState } from '../stores/constants/convocationState';
import { getConvocations } from '../services/api';
import { useStyles } from '../services/constants/styles';

import LoadingSpinner from '../views/loading-spinner';
import { ConvocationStoreState } from '../stores/interfaces/convocation-store';

export const ConvocationSelector = () => {
	const styles = useStyles();
	const convocation = useAtomValue(convocationState);
	const setConvocation = useSetAtom(convocationState);
	const { isLoading, error, data, isFetching } = useQuery(['getConvocations'], getConvocations, {
		refetchOnWindowFocus: false,
		enabled: convocation.id === defaultConvocationStoreState.id,
	});
	let isMounted = useRef<boolean>(false); // Only update states if we are still mounted after loading

	const handleChange = useCallback(
		(event: React.ChangeEvent<{ value: unknown }>) => {
			if (!isMounted.current) return;

			const selectedConvocation = data?.find(
				(convocation: ConvocationStoreState) => convocation.id === event.target.value,
			);
			if (selectedConvocation) setConvocation(selectedConvocation);
		},
		[data, setConvocation],
	);

	useEffect(() => {
		if (!isMounted.current) return;
		console.log('getConvocations data', data);

		if (data !== undefined && data.length > 0) {
			setConvocation({ ...defaultConvocationStoreState, id: data[0]?.id, title: data[0]?.title });
		}
	}, [data, setConvocation]);

	useEffect(() => {
		isMounted.current = true;

		// componentWillUnmount
		return () => {
			isMounted.current = false; // Mark as unmounted
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	console.log('ConvocationSelector', data);
	console.log('ConvocationSelector', isLoading, isFetching, error);

	if (!data || isLoading || isFetching) return <LoadingSpinner label='Loading Convocation List...' color='secondary' />;

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
						<div className={styles.errorText}>Error!</div>
						<Select fullWidth onChange={handleChange}>
							{data.map((item: ConvocationStoreState) => (
								<MenuItem key={`selectFormField-${item.id}`} value={item.id}>
									{item.title}
								</MenuItem>
							))}
						</Select>
					</div>
				</TabPanel>
			</TabContext>
		</Box>
	);
};

export default ConvocationSelector;
