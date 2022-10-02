import React, { useCallback, useState, useRef, useEffect, memo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Grid, Divider, Button } from '@mui/material';
import BackupIcon from '@mui/icons-material/Backup';
import SaveIcon from '@mui/icons-material/Save';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
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
import Storage from '../../services/storage';
import { useStyles } from '../../services/constants/styles';
import LoadingSpinner from '../../views/loading-spinner';
import { defaultSettings } from './constants/settings';

import { GoogleSheetsSettingsData } from './interfaces/google-sheets';
import { XpnSettingsData } from './interfaces/xpression';
import { NetworkSettingsData } from './interfaces/network';

const ImportExportSettings: React.FC<{ isSubmitting: boolean }> = ({ isSubmitting = false }) => {
	const isSettingsLoaded = useAtomValue(loadedSettings);
	const googleSheetsStore = useAtomValue(googleSheetsSettings);
	const networkStore = useAtomValue(networkSettings);
	const xpnStore = useAtomValue(xpnSettings);
	const setGoogleSheetsStore = useSetAtom(setGoogleSheetsSettings);
	const setXPNStore = useSetAtom(setXPNSettings);
	const setNetworkStore = useSetAtom(setNetworkSettings);
	const [status, setStatus] = useState<string>('');
	const inputImport = useRef<HTMLInputElement>(null);
	let isMounted = useRef<boolean>(false); // Only update states if we are still mounted after loading
	const { classes } = useStyles();

	const onUseDefaultButtonClick = useCallback(() => {
		if (!isMounted.current) return;

		setStatus('Loading...');

		Storage.saveSettings({
			loaded: isSettingsLoaded,
			network: { ...defaultSettings.network, password: networkStore.password },
			gs: defaultSettings.gs,
			xpn: defaultSettings.xpn,
		}).then(() => {
			if (!isMounted.current) return;
			setGoogleSheetsStore(defaultSettings.gs);
			setXPNStore(defaultSettings.xpn);
			setNetworkStore({ ...defaultSettings.network, password: networkStore.password });
			window.location.reload();
		});
	}, [isSettingsLoaded, networkStore.password, setGoogleSheetsStore, setNetworkStore, setXPNStore]);

	const handleImportChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const { files } = event.target;
			console.log('handleImportChange', files);

			if (files && files.length > 0) {
				console.log('handleImportChange 2', files[0]);
				setStatus('Importing...');
				const fileReader = new FileReader();
				fileReader.readAsText(files[0], 'UTF-8');
				fileReader.onload = () => {
					try {
						if (!isMounted.current) return;

						if (fileReader.result instanceof ArrayBuffer) {
							return;
						}

						if (fileReader.result !== undefined && fileReader.result !== null) {
							const jsonResult = JSON.parse(fileReader.result);
							Storage.saveSettings({
								loaded: isSettingsLoaded,
								network: (jsonResult.network as NetworkSettingsData) ?? networkStore,
								gs: (jsonResult?.gs as GoogleSheetsSettingsData) ?? googleSheetsStore,
								xpn: (jsonResult?.xpn as XpnSettingsData) ?? xpnStore,
							}).then(() => {
								if (!isMounted.current) return;
								if (jsonResult.gs) setGoogleSheetsStore({ ...jsonResult.gs } as GoogleSheetsSettingsData);
								if (jsonResult.xpn) setXPNStore({ ...jsonResult.xpn } as XpnSettingsData);
								if (jsonResult.network) setNetworkStore({ ...jsonResult.network } as NetworkSettingsData);
								window.location.reload();
							});
						}
					} catch (e) {
						console.error(e);
					}
				};
			}
		},
		[isSettingsLoaded, networkStore, googleSheetsStore, xpnStore, setGoogleSheetsStore, setXPNStore, setNetworkStore],
	);

	const onImportButtonClick = useCallback(() => {
		if (inputImport && inputImport.current) inputImport.current.click();
	}, [inputImport]);

	const onExportButtonClick = useCallback(() => {
		if (!isMounted.current) return;
		const fileData = JSON.stringify({
			network: { ...networkStore, password: '' },
			gs: googleSheetsStore,
			xpn: xpnStore,
		});
		const blob = new Blob([fileData], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.download = `convocation-settings-${new Date().toISOString().split('T')[0]}.json`;
		link.href = url;

		if (!isMounted.current) return;

		setStatus('Exporting...');
		link.click();

		setTimeout(() => {
			if (!isMounted.current) return;
			setStatus('');
		}, 1000);
	}, [googleSheetsStore, networkStore, xpnStore]);

	useEffect(() => {
		isMounted.current = true;

		// componentWillUnmount
		return () => {
			isMounted.current = false; // Mark as unmounted
		};
	}, []);

	if (status !== '') return <LoadingSpinner key={'settings.ImportExportLoadingSpinner'} label={status} />;

	return (
		<Grid container spacing={1} alignItems='center' className={classes.centerRoot}>
			<Button
				variant='contained'
				color={!isSubmitting ? 'primary' : 'secondary'}
				className={classes.button}
				size='large'
				type='button'
				onClick={onUseDefaultButtonClick}
				disabled={isSubmitting}
				startIcon={<FolderSpecialIcon />}
			>
				Load Default Settings
			</Button>
			<Divider orientation='vertical' flexItem />
			<input
				type='file'
				accept='application/JSON'
				name='fileImportInput'
				id='fileInput'
				ref={inputImport}
				onChange={handleImportChange}
				onInput={handleImportChange}
				style={{ display: 'none' }}
			/>
			<Button
				variant='contained'
				color={!isSubmitting ? 'primary' : 'secondary'}
				className={classes.button}
				size='large'
				onClick={onImportButtonClick}
				type='button'
				disabled={isSubmitting}
				startIcon={<BackupIcon />}
			>
				Import Settings
			</Button>
			<Divider orientation='vertical' flexItem />
			<Button
				variant='contained'
				color={!isSubmitting ? 'primary' : 'secondary'}
				className={classes.button}
				size='large'
				type='button'
				onClick={onExportButtonClick}
				disabled={isSubmitting}
				startIcon={<SaveIcon />}
			>
				Export Settings
			</Button>
		</Grid>
	);
};

export default memo(ImportExportSettings, isEqual);
