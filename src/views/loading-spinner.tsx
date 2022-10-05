import React from 'react';
import { Grid, CircularProgress, CircularProgressProps, Typography } from '@mui/material';
import Box from '@mui/material/Box';

export const LoadingSpinner: React.FC<CircularProgressProps & { label?: string }> = ({ label, ...props }) => {
	return (
		<Grid container justifyContent='center' alignItems='center' spacing={1}>
			<Box display='center'>
				<CircularProgress variant='indeterminate' disableShrink {...props} />
				<Typography variant='caption' aria-label={label} component='div' color='textSecondary'>
					{label}
				</Typography>
			</Box>
		</Grid>
	);
};

export default LoadingSpinner;
