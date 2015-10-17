import api from './api';
import Promise from 'bluebird';

export default Promise.promisify(function makeAPIFromObject(name,object,cb){

	if(typeof name !== 'string'){
		cb = object;
		object = name;
		name = 'noName';
	}

	const commands = [];

	for(name in object){
		if(!Object.prototype.hasOwnProperty.call(object,name)){continue;}
		const method = object[name];
		if(typeof method !== 'function'){continue;}
		const length = method.size ? method.size : method.length ? method.length-1 : 0;
		const optionalParameters = [];
		var i = 0;
		const keys = [];
		while(i<length){
			const paramName = `arg${i}`;
			optionalParameters.push({name:paramName});
			keys.push(paramName);
			i++;
		}
		function run(params,cb){
			const args = keys.map(key=>params[key]);
			args.push(cb);
			method(...args);
		}
		commands.push({
			name
		,	parameters:[]
		,	optionalParameters
		,	run
		});
	}

	const apiProps = {
		name
	,	commands
	}

	api(apiProps)
		.then(api=>cb(null,api))
		.error(err=>cb(err));
})