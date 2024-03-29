import { Theme, createTheme, responsiveFontSizes } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

export const lightTheme = responsiveFontSizes(
	createTheme({
		palette: {
			mode: 'light',
			primary: {
				light: '#25A0DA',
				main: '#0375E6',
				dark: '#0303E6',
				contrastText: '#f9f9f9',
			},
			secondary: {
				light: '#ffb170',
				main: '#fc8e20',
				dark: '#c86700',
				contrastText: '#f9f9f9',
			},
			error: {
				light: '#A80000',
				main: '#E70000',
				dark: '#FF0000',
			},
			background: {
				paper: '#f9f9f9',
				default: '#e6e6e6',
			},
			text: {
				primary: '#16191d',
				secondary: '#1d2126',
				disabled: '#8e8f90',
			},
		},
		typography: {
			fontFamily: 'Roboto,Helvetica Neue,Helvetica,Segoe UI,Arial,sans-serif',
		},
		...{
			MuiTextField: {
				variant: 'outlined',
				InputLabelProps: {
					shrink: true,
				},
			},
			MuiPaper: {
				elevation: 1,
			},
			MuiCard: {
				elevation: 1,
			},
			MuiTabPanel: {
				root: {
					padding: '0px',
				},
			},
		},
	}),
);

export const darkTheme = responsiveFontSizes(
	createTheme({
		palette: {
			mode: 'dark',
			primary: {
				light: '#20FCFC',
				main: '#208efc',
				dark: '#0375E6',
				contrastText: '#f9f9f9',
			},
			secondary: {
				light: '#ffb170',
				main: '#fc8e20',
				dark: '#c86700',
				contrastText: '#f9f9f9',
			},
			error: {
				light: '#A80000',
				main: '#E70000',
				dark: '#FF0000',
			},
			background: {
				paper: '#2a2e33',
				default: '#16191d',
			},
			text: {
				primary: '#f9f9f9',
				secondary: '#e6e6e6',
				disabled: '#8e8f90',
			},
		},
		typography: {
			fontFamily: 'Roboto,Helvetica Neue,Helvetica,Segoe UI,Arial,sans-serif',
		},
		...{
			MuiTextField: {
				variant: 'outlined',
				InputLabelProps: {
					shrink: true,
				},
			},
			MuiPaper: {
				elevation: 1,
			},
			MuiCard: {
				elevation: 1,
			},
			MuiTabPanel: {
				root: {
					padding: '0px',
				},
			},
		},
	}),
);

export const useStyles = makeStyles()((theme: Theme) => ({
	root: {
		display: 'flex',
		alignItems: 'center',
		flexGrow: 1,
	},
	centerRoot: {
		width: '103vw',
		justifyContent: 'center',
		color: theme.palette.text.secondary,
		'& svg': {
			margin: theme.spacing(1.5),
		},
		'& hr': {
			margin: theme.spacing(0, 0.5),
		},
	},
	grid: {
		width: '100vw',
		margin: '0px',
	},
	appBar: {
		justifyContent: 'center',
	},
	centeredAlert: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	titleLeft: {
		flexGrow: 1,
	},
	title: {
		marginRight: theme.spacing(5),
	},
	errorText: {
		color: theme.palette.error.main,
	},
	changedText: {
		color: theme.palette.mode === 'light' ? '#0303E6' : '#0375E6',
	},
	boxWrapper: {
		flexGrow: 1,
		justifyContent: 'center',
		margin: -10,
		width: '100vw',
		height: '200vh',
	},
	paper: {
		padding: '0.5em',
	},
	fullWidth: {
		width: '95vw',
	},
	fullWindow: {
		height: '200vh',
		width: '100vw',
		outline: 'none',
	},
	tabRoot: {
		backgroundColor: theme.palette.background.default,
		margin: theme.spacing(1),
	},
	summary: {
		alignItems: 'center',
	},
	column: {
		flexBasis: '33.33%',
	},
	details: {
		alignItems: 'center',
	},
	formControl: {
		margin: theme.spacing(2),
	},
	formGroup: {
		marginBottom: theme.spacing(3),
	},
	formTextField: {
		marginTop: theme.spacing(1),
	},
	wrapper: {
		margin: theme.spacing(1),
		position: 'relative',
	},
	button: {
		margin: theme.spacing(1),
	},
	buttonProgress: {
		position: 'absolute',
		top: '50%',
		left: '50%',
		marginTop: -12,
		marginLeft: -12,
	},
	iconButton: {
		paddingRight: theme.spacing(1),
	},
	table: {
		minWidth: 500,
	},
	tableHeader: {
		backgroundColor: theme.palette.background.default,
	},
	paginationAct: {
		flexShrink: 0,
		marginLeft: theme.spacing(2.5),
	},
}));
