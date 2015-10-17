export default function makeAPIIsValidCommandFunction(methods,defaultMethod){
	return function isValidMethod(methodName){
		return (methodName in methods);
	};
}