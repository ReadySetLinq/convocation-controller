import { defaultGoogleSheet } from '../../components/settings/constants/google-sheets';
import { defaultNetwork } from '../../components/settings/constants/network';
import { defaultXpression } from '../../components/settings/constants/xpression';

import { Convocations, Convocation } from '../interfaces/convocation';

export const defaultConvocations: Convocations[] = [];

export const defaultConvocation: Convocation = {
	id: '',
	title: 'Fall 2022',
	googleSheet: defaultGoogleSheet,
	googleSheetId: null,
	network: defaultNetwork,
	networkId: null,
	xpression: defaultXpression,
	xpressionId: null,
	createdAt: new Date(),
	updatedAt: new Date(),
};
