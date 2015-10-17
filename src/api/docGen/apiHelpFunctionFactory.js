export default function apiHelpFunctionFactory(apiSummary){
	return function APIHelp({name},cb){
		if(name){
			const {commands} = apiSummary;
			if(!(name in commands)){
				return cb(new Error(`${name} is not a valid command`));
			}
			if(!commands[name]){
				return cb(new Error(`${name} is not documented`))
			}
			return cb(null,commands[name]);
		}
		return cb(null,apiSummary);
	};
}
