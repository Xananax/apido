export default function apiRunCommandFactory(commands,getValidCommand,defaultCommand){
	return function runCommand(_commandName,...params){
		const commandName = getValidCommand(_commandName,defaultCommand);
		const cb = params[params.length-1];
		if(!(typeof cb == 'function')){
			throw new Error('no callback function provided to run()');
		}
		if(!commandName){return cb(new Error(`${_commandName} does not exist`))}
		const command = commands[commandName];
		command.run(...params)
	}
}