export default function makeAPIRunPath(runCommand,pathToCommand){
	return function runPath(str,...params){
		const cb = params[params.length-1];
		if(!(typeof cb == 'function')){
			throw new Error('no callback function provided to runCommandPath()');
		}
		const [command,parameters] = pathToCommand(str);
		params.unshift(parameters);
		runCommand(command,...params);
	}
}