export default function getValidCommandFactory(commands){
	return function getValidCommand(commandName,defaultCommand){
		return (commandName in commands) ? 
			commandName : 
			(defaultCommand && (defaultCommand in commands))?
				defaultCommand :
				false
		;
	};
}