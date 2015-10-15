export default function makeAPIHelpFunction(helps,description){
	return function APIHelp({name},cb){
		if(name){
			if(!(name in helps)){
				return cb(new Error(`${name} is not a valid command`));
			}
			if(!helps[name]){
				return cb(new Error(`${name} is not documented`))
			}
			return cb(null,helps[name]);
		}
		return cb(null,description);
	};
}
