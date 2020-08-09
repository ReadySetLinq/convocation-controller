import { ConnectionState } from '../../services/interfaces/connection';

export interface NetworkDisplayProps {
	size?: 'small' | 'medium' | 'large' | undefined;
	state: ConnectionState;
}
