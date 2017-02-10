/**
 * Based on @ericprieto code https://github.com/strongloop/loopback/issues/651#issuecomment-140879983
 *
 * Usage:
 * In models .js file, add code like this
 * <code>
    "mixins":{
     "DisableRelationMethods":{
       "exposeTypes":["findById", "get"],
       "exposeRelations": {
         "users": ["unlink"],
         "creator": true
       }
     }
   }
   </code>
 **/

module.exports = function(Model, options) {
	if (Model && Model.sharedClass) {
		//get the list of relations and / or methods to leave exposed
		var exposeRels = options.exposeRelations || {};

		//get the list of the types of methods (e.g. findById) to leave
		var methodTypesToExpose = options.exposeTypes || [];

		//list of all available methods that a relation might add
		const relationMethods = [
			'findById', 'destroyById', 'updateById', 'exists', 'link',
			'get', 'create', 'update', 'destroy', 'unlink', 'count', 'delete',
		];

		//limit the list of available methods by removing those in methodTypesToExpose
		const methodsToRemove = relationMethods
			.filter(method => methodTypesToExpose.indexOf(method) === -1);

		//get the list of relations on this class (except those we're to ignore)
		const relations = Object.keys(Model.definition.settings.relations)
			.filter(r => {
				return !exposeRels[r] || typeof exposeRels[r] === 'object';
			});

		//get exact list of methods to remove
		const methods = Array.prototype.concat.apply( //flatten the double map
			[],
			//do a cartesian join of methods and relations
			methodsToRemove.map(meth => relations.map(rel => {
				//if we were told to ignore this, return undefined
				if (exposeRels[rel] && exposeRels[rel].includes(meth)) return;

				//return constructed method name
				return `__${meth}__${rel}`;
			}))
		).filter(e => typeof e !== 'undefined');//remove undefined

		//remove all of the methods we've constructed
		methods.forEach(meth => {
			Model.disableRemoteMethodByName(`prototype.${meth}`);
		});

		//console.log(methods);
	}
};
