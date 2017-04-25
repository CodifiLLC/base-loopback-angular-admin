import { LoopBackAuth } from './sdk/services';
import { CustomUser } from './sdk/models';

export class LoginAwareComponent {
	constructor(private auth: LoopBackAuth) { }

	isLoggedIn () {
		return this.auth.getCurrentUserId() != null;
	}

	isSuperuser () {
		const curUser: CustomUser = this.auth.getCurrentUserData();
		return curUser && curUser.roles && curUser.roles.find(r => r.name === 'admin');
	}

	getUserDisplayName () {
		const curUser: CustomUser = this.auth.getCurrentUserData();
		if (curUser) {
			return `${curUser.firstName || ''} ${curUser.lastName || ''}`;
		} else {
			return '';
		}
	}
}
