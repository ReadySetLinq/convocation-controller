import React from 'react';
import { Grid, Paper } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';

class ErrorBoundary extends React.Component {
	state = { hasError: false };

	static getDerivedStateFromError(error: any) {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	componentDidCatch(error: any, errorInfo: any) {
		// You can also log the error to an error reporting service
		console.error(error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return (
				<Paper
					style={{
						justifyContent: 'center',
						margin: -10,
						height: '100vh',
						width: '96ww',
					}}
				>
					<Grid container style={{ width: '96vw', margin: '0px', padding: '1em' }} justify='center' spacing={1}>
						<Grid item xs={3}></Grid>
						<Grid item xs={6}>
							<Alert key='errorBoundary.Alert' severity='error' variant='outlined'>
								<AlertTitle>Something went wrong!</AlertTitle>
							</Alert>
						</Grid>
						<Grid item xs={3}></Grid>
					</Grid>{' '}
				</Paper>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
