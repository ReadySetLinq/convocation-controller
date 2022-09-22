import React, { memo } from 'react';
import { useAtom } from 'jotai';
import { isEqual } from 'lodash';
import { NativeSelect } from '@material-ui/core';
import { generate } from 'shortid';

import { studentsState } from '../../stores/atoms';

const ProgramsDisplay = () => {
	const [studentsStore, setStudentsStore] = useAtom(studentsState);

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
			{studentsStore.programs.map((value: any, index: number) => {
				const _program = studentsStore.programs[index];

				return (
					<option key={`programsDisplay-${_program}-${index}`} aria-label={_program} value={_program}>
						{_program}
					</option>
				);
			})}
		</NativeSelect>
	);
};

export default memo(ProgramsDisplay, isEqual);
