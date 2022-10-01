import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Grid, Paper } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
interface Props {
	children: ReactNode;
}
class ErrorBoundary extends Component<Props> {
	state = { hasError: false };

	static getDerivedStateFromError = (_error: Error) => {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	};

	componentDidCatch = (error: Error, errorInfo: ErrorInfo) => {
		// You can also log the error to an error reporting service
		console.error(error, errorInfo);
	};

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
