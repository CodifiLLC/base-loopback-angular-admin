module.exports = function enableAuthentication(app) {
	//lookup the datasource that we want to persist
	const dataSource = app.datasources.persistent;

	//if we're not running against a mysql database, bail
	if (dataSource.connector.name != 'mysql') return;
	console.log('migrating....');

	//for every model connected, check if migration is needed, and run the migration
	Object.keys(dataSource.connector._models).forEach(model => {
		dataSource.isActual(model, (err, actual) => {
			if (!actual) {
				dataSource.autoupdate(model, function(err, result) {
					process.stdout.write(`Migrating ${model}:`);

					if (err) {
						process.stdout.write('failed');
						console.log(err);
						return;
					}

					process.stdout.write('success\n');
				});
			}
		});
	});
};
