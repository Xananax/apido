import escapeRegExp from '../../utils/escapeRegExp'

function attachFalseCommand(command,arg,char){
	return arg? `${command}${char}${arg}` : `${command}`
}

function cleanStr(str){
	return str.replace(/^\//,'')
}

const commandSep_default = /\/(.+)/;
const parametersSep_default = /:/;
const commandChar_default = '/';

export default function pathToCommandFactory(commandSep,parametersSep,commands){
	var commandChar = commandSep ? commandSep : commandChar_default;
	commandSep = commandSep ? new RegExp(escapeRegExp(commandSep)+'(.+)') : commandSep_default
	;
	parametersSep = parametersSep ? new RegExp(escapeRegExp(parametersSep)) : parametersSep_default
	;
	return function pathToCommand(path,options){
		var command;
		var [tentativeCommand,parameters] = cleanStr(path)
			.split(commandSep)
			.slice(0,2);
		parameters = parameters && parameters.split(parametersSep) || []//.map(cleanStr);
		if(options && options.command){
			if(!commands || (commands && (options.command in commands))){
				command = options.command;
				parameters[0] = attachFalseCommand(tentativeCommand,parameters[0],commandChar);
			}
		}
		if(!command){
			if(commands && !(tentativeCommand in commands)){
				parameters[0] = attachFalseCommand(tentativeCommand,parameters[0],commandChar);
			}else{
				command = tentativeCommand;
			}
		}
		return [command,parameters];
	}
}