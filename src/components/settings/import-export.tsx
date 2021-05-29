import React, { useCallback, useState, useRef, useEffect, memo } from "react";
import { useRecoilState } from 'recoil';
import { Grid, Divider, Button } from '@material-ui/core';
import BackupIcon from '@material-ui/icons/Backup';
import SaveIcon from '@material-ui/icons/Save';
import { isEqual } from 'lodash';

import { settingsState } from '../../stores/atoms';
import Storage from '../../services/storage';
import { useStyles } from '../../services/constants/styles';
import LoadingSpinner from '../../views/loading-spinner';

const ImportExportSettings: React.FC<{ isSubmitting: boolean }> = ({ isSubmitting = false }) => {
	const [settingsStore, setSettingsStore] = useRecoilState(settingsState);
	const [status, setStatus] = useState<string>("");
  const inputImport = useRef<HTMLInputElement>(null);  
	let isMounted = useRef<boolean>(false); // Only update states if we are still mounted after loading
	const styles = useStyles();

  const handleImportChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;

		if (files && files.length > 0) {
			setStatus("Importing...");
      const fileReader = new FileReader();
      fileReader.readAsText(files[0], "UTF-8");
      fileReader.onload = () => {
				try {					
					if (!isMounted.current) return;
					
					if (fileReader.result instanceof ArrayBuffer) {
						return;
					}
					
					if (fileReader.result !== undefined && fileReader.result !== null) {
						console.log("jsonResult", fileReader.result);
						const jsonResult = JSON.parse(fileReader.result);
						Storage.saveSettings({ ...settingsStore, network: jsonResult?.network, gs: jsonResult?.gs, xpn: jsonResult?.xpn }).then(() => {
							if (!isMounted.current) return;
							setSettingsStore((oldStore) => ({ ...oldStore, network: jsonResult?.network, gs: jsonResult?.gs, xpn: jsonResult?.xpn }));
							window.location.reload();
						});
					}
				} catch (e) {
					console.error(e);
				}
      };
		}
  }, [settingsStore, setSettingsStore]);

  const onImportButtonClick = useCallback(() => {
		if (inputImport && inputImport.current) inputImport.current.click();
  }, [inputImport]);
  
  const onExportButtonClick = useCallback(() => {
		if (!isMounted.current) return;		
		const fileData = JSON.stringify({			
			network: settingsStore.network,
			gs: settingsStore.gs,
			xpn: settingsStore.xpn,
		});
    const blob = new Blob([fileData], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `convocation-settings-${new Date().toISOString().split('T')[0]}.json`;
		link.href = url;
		
		if (!isMounted.current) return;

		setStatus("Exporting...");
		link.click();

		setTimeout(() => {
		if (!isMounted.current) return;
			setStatus("");
		}, 1000);
	}, [settingsStore]);
	
	useEffect(() => {
		isMounted.current = true;

		// componentWillUnmount
		return () => {
			isMounted.current = false; // Mark as unmounted
		};
	}, []);

	if (status !== '') return <LoadingSpinner key={'settings.ImportExportLoadingSpinner'} label={status} />;
	
	return (
		<Grid container spacing={1} alignItems="center" className={styles.centerRoot}>
      <input type='file' accept="application/JSON" id='fileInput' ref={inputImport} onChange={handleImportChange} style={{display: 'none'}}/>
				<Button
					variant='contained'
					color={!isSubmitting ? 'primary' : 'secondary'}
					className={styles.button}
					size='large'
					onClick={onImportButtonClick}
					type='button'
					disabled={isSubmitting}
					startIcon={<BackupIcon />}
				>
					Import Settings
				</Button>			
				<Divider orientation="vertical" flexItem />	
				<Button
					variant='contained'
					color={!isSubmitting ? 'primary' : 'secondary'}
					className={styles.button}
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
