import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { useTheme } from '@material-ui/core/styles';

import { useStyles } from '../services/constants/styles';

export interface PaginationTableActionsProps {
	count: number;
	page: number;
	rowsPerPage: number;
	onChangePage: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

export const PaginationTableActions = (props: PaginationTableActionsProps) => {
	const classes = useStyles();
	const theme = useTheme();
	const { count, page, rowsPerPage, onChangePage } = props;

	const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		onChangePage(event, 0);
	};

	const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		onChangePage(event, page - 1);
	};

	const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		onChangePage(event, page + 1);
	};

	const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
	};

	return (
		<div className={classes.paginationAct}>
			<IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label='first page'>
				{theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
			</IconButton>
			<IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label='previous page'>
				{theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
			</IconButton>
			<IconButton
				onClick={handleNextButtonClick}
				disabled={page >= Math.ceil(count / rowsPerPage) - 1}
				aria-label='next page'
			>
				{theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
			</IconButton>
			<IconButton
				onClick={handleLastPageButtonClick}
				disabled={page >= Math.ceil(count / rowsPerPage) - 1}
				aria-label='last page'
			>
				{theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
			</IconButton>
		</div>
	);
};

export default PaginationTableActions;
