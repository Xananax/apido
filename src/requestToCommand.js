import pathToCommand from './pathToCommand';

export default function requestToCommand(req){
	const [methodName,path] = pathToCommand(req.path);
	const requestVerb = req.method.toLowerCase();
	return [methodName,path,requestVerb];	
}