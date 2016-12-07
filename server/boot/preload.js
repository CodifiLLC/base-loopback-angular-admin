module.exports = function preloadData(app) {
	const CustomUser = app.models.CustomUser;
	const Role = app.models.Role;
	const RoleMapping = app.models.RoleMapping;

	Role.create({name: 'admin'}).then(role => {
		if (process.env.NODE_ENV !== 'testing') {
			CustomUser.find().then(users => {
				if (!users || !users.length) {
					console.log('No users found. Creating admin.');
					const defaultAdmin = {
						username: 'administrator',
						email: 'admin@codifi.us',
						firstName: 'Site',
						lastName: 'Admin',
						password: require('crypto').randomBytes(8)
									.toString('hex'),
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
				}
			});
		} else { //testing mode, load data on every boot
			CustomUser.create([
				{
					email: 'test1@codifi.us',
					emailVerified: true,
					firstName: 'Test',
					lastName: '1',
					password: 'test',
					username: 'test1',
				},
				{
					email: 'test2@codifi.us',
					emailVerified: true,
					firstName: 'Test',
					lastName: '2',
					password: 'test',
					username: 'test2',
				},
				{
					email: 'test3@codifi.us',
					emailVerified: true,
					firstName: 'Test',
					lastName: '3',
					password: 'test',
					username: 'test3',
				},
				{
					email: 'test4@codifi.us',
					emailVerified: true,
					firstName: 'Test',
					lastName: '4',
					password: 'test',
					username: 'test4',
				},
				{
					email: 'test5@codifi.us',
					emailVerified: true,
					firstName: 'Test',
					lastName: '5',
					password: 'test',
					username: 'test5',
				},
			], (err, users) => {
				if (err) console.log('user create err', err);
			});
		}
	});
};
