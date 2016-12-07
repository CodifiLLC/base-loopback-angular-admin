module.exports = function preloadData(app) {
	const CustomUser = app.models.CustomUser;

	if (process.env.NODE_ENV == 'testing') {
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
};
