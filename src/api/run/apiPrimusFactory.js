export default function primusFactory(runCommand){
	return function sparkData(spark){
		return function onData(data){
			const commandName = data.command;
			delete data.command;
			runCommand(commandName,data,(err,answer)=>{
				if(err){return spark.write(err);}
				spark.write(answer);
			});
		}
	}
}