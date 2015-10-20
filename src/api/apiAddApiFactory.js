import Promise from 'bluebird';
import commandFactory from '../command';

export default function addCommandFactory(apiName,apiCommands,apiCommandsSummary){
	return function addApi(newApi){
		const {name,description} = newApi.description;
		const command = {
			name
		,	description
		,	append:true
		,	optionalParameters:[
				{name:'_path'}
			]
		,	run(opts,cb){
				const path = (opts._path && opts._path.join(':')) || '';
				delete opts._path;
				newApi.runPath(path,opts)
				.then(answer=>cb(null,answer))
				.error(cb);
			}
		}

		const runCommand = commandFactory(command,apiName,(parameters,cb)=>{
			return function(err,result){
				if(err){return cb(err);}
				return cb(null,result)
			}
		});
		const {help} = runCommand
		apiCommandsSummary[name] = help || '';
		apiCommands[name] = runCommand;
		return addApi;
	}
}