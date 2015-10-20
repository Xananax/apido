import Promise from 'bluebird';
import commandFactory from '../command';
import apiJSONResponseFactory from './utils/apiJSONResponseFactory';

export default function addCommandFactory(apiName,apiCommands,apiCommandsSummary){
	return function addCommand(commandProps){
		const {name:commandName} = commandProps;
		const runCommand = commandFactory(commandProps,apiName,apiJSONResponseFactory(apiName,commandName));
		const {help} = runCommand
		apiCommandsSummary[commandName] = help || '';
		apiCommands[commandName] = runCommand;
		return addCommand;
	}
}