import Promise from 'bluebird';
import {validAPI} from '../validation';
import apiHelpCommandFactory from './docGen';
import apiAddCommandFactory from './apiAddCommandFactory';
import apiAddApiFactory from './apiAddApiFactory';
import {
	apiMiddlewareFactory
,	apiRunCommandFactory
,	apiRunPathFactory
,	apiRunFactory
,	apiPrimusFactory
} from './run';
import getValidCommandFactory from './utils/getValidCommandFactory';
import pathToCommandFactory from './utils/pathToCommandFactory';

export default Promise.promisify(function makeAPI(props,cb){
	validAPI(props)
	.then(()=>{
		let {
			name:apiName
		,	description:apiDescription
		,	commandSeparator
		,	commandParametersSeparator
		,	useJson
		} = props;
		
		const defaultCommand = props.default || 'help';
		const apiCommands = {};
		const apiCommandsSummary = {};
		const addCommand = apiAddCommandFactory(apiName,apiCommands,apiCommandsSummary);
		const addApi = apiAddApiFactory(apiName,apiCommands,apiCommandsSummary);

		const apiSummary = {
			name:apiName
		,	description:apiDescription
		,	commands:apiCommandsSummary
		}

		props.commands
			.slice()
			.concat(apiHelpCommandFactory(apiSummary))
			.forEach(addCommand)
		;
		
		const getValidCommand = getValidCommandFactory(apiCommands);
		const pathToCommand = pathToCommandFactory(commandSeparator,commandParametersSeparator,apiCommands)
		const runCommand = apiRunCommandFactory(apiCommands,getValidCommand,defaultCommand);
		const runPath = apiRunPathFactory(runCommand,pathToCommand);
		const middleware = apiMiddlewareFactory(runCommand,pathToCommand,useJson);
		const primus = apiPrimusFactory(runCommand);

		const api = {
			runCommand:Promise.promisify(runCommand)
		,	runPath:Promise.promisify(runPath)
		,	middleware
		,	primus
		,	description:apiSummary
		,	commands:apiCommands
		,	addCommand
		,	nest:addApi
		}

		cb(null,api);

	})
	.error(err=>cb(err));
});