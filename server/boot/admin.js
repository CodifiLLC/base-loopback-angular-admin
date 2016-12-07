module.exports = function loadRoles(app) {
	const ACL = app.models.ACL;
	const CustomUser = app.models.CustomUser;
	const Role = app.models.Role;
	const RoleMapping = app.models.RoleMapping;

	//add Role ACLs
	ACL.create([
		{
			model: 'Role',
			accessType: ACL.EXECUTE,
			principalType: ACL.ROLE,
			principalId: Role.EVERYONE,
			permission: ACL.DENY,
			property: ACL.ALL
		},
		{
			model: 'Role',
			accessType: ACL.WRITE,
			principalType: ACL.ROLE,
			principalId: Role.EVERYONE,
			permission: ACL.DENY,
			property: ACL.ALL
		},
		{
			model: 'Role',
			accessType: ACL.WRITE,
			principalType: ACL.ROLE,
			principalId: 'admin',
			permission: ACL.ALLOW,
			property: ACL.ALL
		},
		{
			model: 'RoleMapping',
			accessType: ACL.EXECUTE,
			principalType: ACL.ROLE,
			principalId: Role.EVERYONE,
			permission: ACL.DENY,
			property: ACL.ALL
		},
		{
			model: 'RoleMapping',
			accessType: ACL.WRITE,
			principalType: ACL.ROLE,
			principalId: Role.EVERYONE,
			permission: ACL.DENY,
			property: ACL.ALL
		},
		{
			model: 'RoleMapping',
			accessType: ACL.WRITE,
			principalType: ACL.ROLE,
			principalId: 'admin',
			permission: ACL.ALLOW,
			property: ACL.ALL
		},
	], function (err, acl) {
		if (err) console.log('unable to create ACLs');
		//console.log('ACL entry created: %j', acl);
	});

	//add admin role
	Role.create({name: 'admin'}).then(role => {
		CustomUser.find().then(users => {
			if (!users || !users.length) {
				console.log('No users found. Creating admin.');
				const defaultAdmin = {
					username: 'administrator',
					email: 'admin@codifi.us',
					firstName: 'Site',
					lastName: 'Admin',
					password: require('crypto').randomBytes(8).toString('hex'),
					emailVerified: true
				};
				CustomUser.create(defaultAdmin)
				.then(user => {
					//make the user an admin
					return role.principals.create({
						principalType: RoleMapping.USER,
						principalId: user.id,
					});
				})
				.then(user => {
					console.log("Admin created with username '"  +
						defaultAdmin.username + "' and password '" +
						defaultAdmin.password + "'");
				});
			} else {
				console.log('Aleady have users. No need to create admin.');
			}
		});
	});
};
