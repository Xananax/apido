import Promise from 'bluebird';
import commandParametersCheckerFactory from './commandParametersCheckerFactory'
import extend from 'node.extend';
import commandRestParametersHandlerFactory from './commandRestParametersHandlerFactory';
import makeCommandSummary from './makeCommandSummary';
import parameterFactory from './parameterFactory';
import commandRunFunctionFactory from './commandRunFunctionFactory';
const assign = Object.assign;

function parseParameters(parameters,optionalParameters,makeParameter){
	return []
	.concat(
		parameters && parameters.map(parameter=>assign({},parameter,{required:true}))
	,	optionalParameters && optionalParameters.map(parameter=>Object.assign({},parameter,{required:false}))
	)
	.filter(Boolean)
	.map(makeParameter)
}



export default function makeCommand(commandProps,apiName,makeJSONResponse){
	const {
		name
	,	description
	,	parameters
	,	optionalParameters
	,	run
	,	append
	,	consume
	} = commandProps;
	const commandParametersByName = {};
	const commandParametersSummary = [];
	const commandOptionalParametersSummary = [];
	const commandParametersHelp = {};
	const makeParameter = parameterFactory(commandParametersByName,commandParametersHelp,commandParametersSummary,commandOptionalParametersSummary)
	const commandParameters = parseParameters(parameters,optionalParameters,makeParameter);
	const needsParameters = (commandParametersSummary.length>=0);
	const summary = makeCommandSummary(name,commandParametersSummary,commandOptionalParametersSummary);

	const commandHelp = {
		name
	,	summary
	,	description
	,	parameters:commandParametersHelp
	}
	const checkAndCoerceParameters = commandParametersCheckerFactory(needsParameters,commandParameters,commandParametersByName,append,consume);
	const toParams = commandRestParametersHandlerFactory(checkAndCoerceParameters)

	const runCommand = commandRunFunctionFactory(run,name,toParams,checkAndCoerceParameters,makeJSONResponse)
	const runCommandPromisified = Promise.promisify(runCommand);

	runCommandPromisified.check = checkAndCoerceParameters;
	runCommandPromisified.toParams = toParams;
	runCommandPromisified.run = runCommand;
	runCommandPromisified.help = commandHelp;
	return runCommandPromisified;
}