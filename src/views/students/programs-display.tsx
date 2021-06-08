import React, { memo } from 'react';
import { useRecoilState } from 'recoil';
import { isEqual } from 'lodash';
import { NativeSelect } from '@material-ui/core';
import { generate } from 'shortid';

import { studentsState } from '../../stores/atoms';

const ProgramsDisplay = () => {
	const [studentsStore, setStudentsStore] = useRecoilState(studentsState);

	const handleProgramChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const programName = event.currentTarget.value;

		setStudentsStore((oldState) => ({
			...oldState,
			programName,
			selectedIndex: -1,
			selectedStudentID: '',
		}));
	};

	return (
		<NativeSelect
			id={`programName-${generate()}`}
			name='programName'
			value={studentsStore.programName}
			onChange={handleProgramChange}
			disabled={studentsStore.switching ? true : false}
		>
			{studentsStore.programs.map((value: string, index: number) => (
					<option key={`programsDisplay-${value}-${index}`} aria-label={value} value={value}>
						{value}
					</option>
				))
			}
		</NativeSelect>
	);
};

export default memo(ProgramsDisplay, isEqual);
