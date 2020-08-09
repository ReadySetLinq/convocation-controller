import React from 'react';
import { Grid, CircularProgress, CircularProgressProps, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';

export const LoadingSpinner: React.FC<CircularProgressProps & { label?: string }> = ({ label, ...props }) => {
	return (
		<Grid container justify='center' spacing={1}>
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
