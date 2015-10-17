import pathToCommandFactory from '../src/api/utils/pathToCommandFactory';


describe('#pathToCommand',()=>{

	describe('# pathToCommandFactory(commandSeparator,ArgumentSeparator)',()=>{

		var pathToCommand = pathToCommandFactory();

		it('should use the characters provided',()=>{
			let pathToCommand = pathToCommandFactory('-','&')
			var [command,args] = pathToCommand('getFile-a/b/c/d/e/&f/g/h');
			command.should.equal('getFile');
			args.should.be.an.Array();
			args[0].should.equal('a/b/c/d/e/')
			args[1].should.equal('f/g/h')
		})
		describe('# pathToCommand(path,null)',()=>{
			it('should use the first item as a command name',()=>{
				var [command,args] = pathToCommand('getFile/a/b/c/d/e/');
				command.should.equal('getFile');
				args.should.be.an.Array();
				args[0].should.equal('a/b/c/d/e/')
			})
			it('should separate further arguments',()=>{
				var [command,args] = pathToCommand('getFile/a/b/c/d/e/:e/f/g/h/');
				command.should.equal('getFile');
				args.should.be.an.Array();
				args[0].should.equal('a/b/c/d/e/')
				args[1].should.equal('e/f/g/h/')
			})
		})
		describe('# pathToCommand(path,options)',()=>{
			it('should prefer the command name from options',()=>{
				var [command,args] = pathToCommand('getFile/a/b/c/d/e/',{command:'something'});
				command.should.equal('something')
				args.should.be.an.Array();
				args[0].should.equal('getFile/a/b/c/d/e/')
			})
			it('should still split arguments',()=>{
				var [command,args] = pathToCommand('getFile/a/b/c/d/e/:f/g/h',{command:'something'});
				args.should.be.an.Array();
				args[0].should.equal('getFile/a/b/c/d/e/')
				args[1].should.equal('f/g/h')
			})
		})
	})

	describe('# pathToCommandFactory(commandSeparator,ArgumentSeparator,commands)',()=>{	
		describe('# pathToCommand(path,null)',()=>{
			it('should use the commands argument to check if the command exists',()=>{
				let pathToCommand = pathToCommandFactory('','',{})
				var [command,args] = pathToCommand('getFile/a/b/c/d/e/',null);
				args.should.be.an.Array();
				args[0].should.equal('getFile/a/b/c/d/e/')
			})
			it('should still split arguments',()=>{
				let pathToCommand = pathToCommandFactory('','',{})
				var [command,args] = pathToCommand('getFile/a/b/c/d/e/:/e/f/g/h/',null);
				args.should.be.an.Array();
				args[0].should.equal('getFile/a/b/c/d/e/')
				args[1].should.equal('/e/f/g/h/')
			})
		})
		describe('# pathToCommand(path,options,commands)',()=>{
			it('should prefer the command name from options if it exists in the commands object',()=>{
				let pathToCommand = pathToCommandFactory('','',{'something':true})
				var [command,args] = pathToCommand('getFile/a/b/c/d/e/',{command:'something'});
				command.should.equal('something')
				args.should.be.an.Array();
				args[0].should.equal('getFile/a/b/c/d/e/')
			})
			it('should define no command name if neither the path nor the options define a valid command',()=>{
				let pathToCommand = pathToCommandFactory('','',{'notSomething':true})
				var [command,args] = pathToCommand('getFile/a/b/c/d/e/:f/g/h',{command:'something'});
				if(typeof command !== 'undefined'){throw new Error('command should be undefined');}
				args.should.be.an.Array();
				args[0].should.equal('getFile/a/b/c/d/e/')
				args[1].should.equal('f/g/h')
			})
			it('should prefer the command name from the path if it exists in the commands object',()=>{
				let pathToCommand = pathToCommandFactory('','',{getFile:true})
				var [command,args] = pathToCommand('getFile/a/b/c/d/e/:f/g/h',{command:'something'});
				command.should.equal('getFile');
				args.should.be.an.Array();
				args[0].should.equal('a/b/c/d/e/')
				args[1].should.equal('f/g/h')
			})
			it('should prefer the same command from options if it exists in the commands object',()=>{
				let pathToCommand = pathToCommandFactory('','',{getFile:true})
				var [command,args] = pathToCommand('getFile/a/b/c/d/e:f/g/h',{command:'getFile'});
				command.should.equal('getFile');
				args.should.be.an.Array();
				args[0].should.equal('getFile/a/b/c/d/e')
				args[1].should.equal('f/g/h')
			})
		})
	})

})