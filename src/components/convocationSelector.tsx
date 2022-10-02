import React, { useRef, useCallback, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { useQuery } from '@tanstack/react-query';
import { Box, AppBar, Toolbar, Tab, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { TabContext, TabPanel, TabList } from '@mui/lab';
import SettingsIcon from '@mui/icons-material/Settings';

import { convocationState } from '../stores/atoms';
import { defaultConvocationStoreState } from '../stores/constants/convocationState';
import { getConvocations } from '../services/api';
import { useStyles } from '../services/constants/styles';

import LoadingSpinner from '../views/loading-spinner';
import { ConvocationStoreState } from '../stores/interfaces/convocation-store';

export const ConvocationSelector = () => {
	const { classes } = useStyles();
	const setConvocation = useSetAtom(convocationState);
	const { isLoading, error, data, isFetching } = useQuery(['getConvocations'], getConvocations);
	let isMounted = useRef<boolean>(false); // Only update states if we are still mounted after loading

	const handleChange = useCallback(
		(event: SelectChangeEvent<{ value: unknown }>) => {
			if (!isMounted.current) return;

			const selectedConvocation = data?.convocations.find(
				(convocation: ConvocationStoreState) => convocation.id === event.target.value,
			);
			if (selectedConvocation) setConvocation(selectedConvocation);
		},
		[data, setConvocation],
	);

	useEffect(() => {
		if (!isMounted.current) return;
		console.log('getConvocations data', data);

		if (data.length > 0) {
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

	if (!data || isLoading || isFetching) return <LoadingSpinner color='secondary' />;

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
						<div className={classes.errorText}>{error ?? error}</div>
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
