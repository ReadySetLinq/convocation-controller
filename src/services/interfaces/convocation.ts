import { GoogleSheets } from '../../components/settings/interfaces/google-sheets';
import { Network } from '../../components/settings/interfaces/network';
import { Xpression } from '../../components/settings/interfaces/xpression';

export type Convocations = {
	id: string;
	title: string;
};

export type Convocation = {
	id: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	googleSheet: GoogleSheets;
	googleSheetId: string | null;
	network: Network;
	networkId: string | null;
	xpression: Xpression;
	xpressionId: string | null;
};
