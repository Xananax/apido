export default function isRequestVerbValid(req,method){
	if(!method){return true}
	if(Array.isArray(method)){
		return method.indexOf(req)>=0
	}
	return (method == req);
}