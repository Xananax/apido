import apiHelpCommandSpecification from './apiHelpCommandSpecification';
import apiHelpFunctionFactory from './apiHelpFunctionFactory';

export default function apiHelpCommandFactory(apiSummary){
	return Object.assign({}
	,	apiHelpCommandSpecification
	,	{run:apiHelpFunctionFactory(apiSummary)
	});
}

