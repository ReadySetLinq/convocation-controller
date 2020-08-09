export interface gsObject {
	data: string[];
	errors: string[];
	meta: {
		aborted: boolean;
		cursor: number;
		delimiter: string;
		fields: string[];
		linebreak: string;
		truncated: boolean;
	};
}
