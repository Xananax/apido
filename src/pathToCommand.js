export default function pathToCommand(str){
	var args = str.replace(/^\/|\/\/|\/$/,'').split('/');
	const methodName = args.shift();
	return [methodName,args];
}