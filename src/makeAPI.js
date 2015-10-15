import {validAPI} from './validation';
import Promise from 'bluebird';
import makeMethod from './makeMethod';
import makeAPIHelpFunction from './makeAPIHelpFunction';
import makeAPIMiddleware from './makeAPIMiddleware';
import makeAPIRunFunction from './makeAPIRunFunction';
import apiHelpMethodSpecification from './apiHelpMethodSpecification';
import makeAPIRunPath from './makeAPIRunPath';

export default Promise.promisify(function makeAPI(props,cb){
	validAPI(props)
	.then(()=>{
		let {name:apiName,description,key} = props;
		const defaultMethod = props.default || 'help';
		const methods = {};
		const helps = {};
		const yargsCommands = []
		const apiJsonHelp = {
			name:apiName
		,	description
		,	methods:helps
		}
		props.methods.push(Object.assign({},apiHelpMethodSpecification,{run:makeAPIHelpFunction(helps,apiJsonHelp)}));
		props.methods.forEach(method=>{
			const {name} = method;
			const m = makeMethod(method,apiName);
			helps[name] = m.description ? m.description : null;
			methods[name] = Promise.promisify(m.method);
			yargsCommands.push(m.yargsOptions);
		});

		//methods.help.run =;

		const api = {
			run:Promise.promisify(makeAPIRunFunction(methods,defaultMethod))
		,	runPath:Promise.promisify(makeAPIRunPath(methods,defaultMethod))
		,	middleware:makeAPIMiddleware(methods,defaultMethod)
		,	description:apiJsonHelp
		,	methods
		}

		cb(null,api);

	})
	.error(err=>cb(err));
});