import extend from 'node.extend';

export default function commandRestParametersHandlerFactory(checkAndCoerceParameters){
	return function toParams(...parameters){
		return extend(...parameters
			.map(parameter=>parameter?checkAndCoerceParameters(parameter):false)
			.filter(Boolean)
			.reverse()
		);
	}
}