# apido

A library to create environment-agnostic, full-on json, self-documenting apis. These apis can then be consumed any way you want, http, sockets, command line, or as a library.

It doesn't create exactly REST-like Apis, because those would be incompatible with other consumption methods.

---

# Install & Usage

```sh
npm install --save apido
```

example:

```js
import apido from 'apido';

var todos = [
    {text:'b'}
,   {text:'a'}
]

apido({
    name:'Todos'
,   description:'Returns todo items'
,   default:'getAll'
,   key:'todos'
,   methods:[
        {
            name:'add'
        ,   method:['post','get']
        ,   description:'adds a todo item'
        ,   args:[
                {
                    name:'text'
                ,   description:'the todo text'
                ,   valid:'string'
                ,   validate(arg){
                        return typeof arg == 'string';
                    }
                }
            ]
        ,   run({text},cb){
                var index = todos.push({text}) -1 ;
                cb(null,{index,text});
            }
        }
    ,   {
            name:'update'
        ,   method:['put','get']
        ,   description:'updates a todo item'
        ,   args:[
                {
                    name:'id'
                ,   description:'the todo id'
                ,   valid:'number'
                ,   validate(arg){
                        return (
                            (typeof arg == 'number') ||
                            (typeof arg == 'string' && arg.match(/\d+/))
                        );
                    }
                ,   coerce(arg){
                        return parseInt(arg);
                    }
                }
            ,   {
                    name:'text'
                ,   description:'the todo text'
                ,   valid:'string'
                ,   validate(arg){
                        return typeof arg == 'string';
                    }
                }
            ]
        ,   run({text,id},cb){
                var todo = todos[id];
                if(!todo){return cb(new Error('todo was not found'))}
                todo.text = text;
                cb(null,todo);
            }
        }
    ,   {
            name:'get'
        ,   method:'get'
        ,   description:'returns a todo item'
        ,   args:[
                {
                    name:'id'
                ,   description:'the todo id'
                ,   valid:'number'
                ,   validate(arg){
                        return (
                            (typeof arg == 'number') ||
                            (typeof arg == 'string' && arg.match(/\d+/))
                        );
                    }
                ,   coerce(arg){
                        return parseInt(arg);
                    }
                }
            ]
        ,   run({id},cb){
                var todo = todos[id];
                if(!todo){return cb(new Error('todo was not found'))}
                cb(null,todo);
            }
        }
    ,   {
            name:'getAll'
        ,   method:'get'
        ,   description:'Returns all todos'
        ,   args:[]
        ,   optionalArgs:[
                {
                    name:'orderBy'
                ,   alias:'o'
                ,   default:'numerical'
                ,   description:'ordering of the todo items'
                ,   valid:["alphabetical","numerical","a","n"]
                ,   validate(arg){
                        return (['alphabetical','numerical','a','n'].indexOf(arg)>=0)
                    }
                ,   coerce(arg){
                        if(arg == 'a'){return 'alphabetical'}
                        if(arg == 'n'){return 'numerical'}
                        return arg;
                    }
                }
            ]
        ,   run({orderBy},cb){
                if(orderBy=='alphabetical'){
                    return cb(null,todos.slice().sort((a,b)=>{
                        return ((a.text < b.text) ? 
                            - 1 : 
                            (a.text > b.text) ?
                            1 :
                            0
                        );
                    }))
                }
                return cb(null,todos);
            }
        }
    ,   {
            name:'getUsers'
        ,   args:[
                {
                    name:'id'
                }
            ,   {
                    name:'path'
                }
            ]
        ,   run({id,path},cb){
                cb(null,{path});
            }
        }
    ]
})
.then(api=>{
    //api is ready
})
.error(err=>{throw err})

```

the `api` object will have five properties:

- `api.run(command,args)`
- `api.runPath(path,opts)`
- `api.middleware(req,res,next)`
- `api.methods`

You can call the methods in the example above as such:

```js
api.run('get',{id:0})
    .then(res=>console.log(res))
    .error(err=>throw err)
```

or:
```js
var req = {path:'/get/0',query:{}};
var res = {
    json(val){
        console.log(val)
    }
}
api.middleware(req,res)
```

or:
```js
api.methods.get({id:0})
    .then(res=>console.log(res))
    .error(err=>throw err)
```

or:
```js
api.runPath('get/0') //or api.runPath('get',{id:0})
    .then(res=>console.log(res))
    .error(err=>throw err)
```

Additionally, all commands can be explored by calling `help`, like so:

```js
api.run('help').then()
api.methods.help().then()
api.middleware({path:'/help'},res)
api.runPath('/help')
//or, for a specific command:
api.run('help',{name:'getAll'}).then()
api.methods.help('getAll').then()
api.middleware({path:'/help/getAll'},res)
```

---

# Objects:

## Argument

A minimal argument needs at least a property `name`:

```js
var arg = {name:'id'}
```

Here's the complete list of properties:
```js
var arg = {
    name:'orderBy' //used when passing an object of arguments
,   alias:'o' //used in command-line (not implemented yet)
,   description:'ordering of the todo items' //displays in help
,   valid:["alphabetical","numerical","a","n"] //displays in help, NOT used by any validation function
,   validate(arg){ //should return a boolean
        return (['alphabetical','numerical','a','n'].indexOf(arg)>=0)
    }
,   coerce(arg){ //called only if validation passed
        if(arg == 'a'){return 'alphabetical'}
        if(arg == 'n'){return 'numerical'}
        return arg;
    }
}
```

Optional arguments take an additional property, `default`:
```js
// if `something` is not user specified, then "a value" will be returned
var arg = {
    name:'something'
,   default:'a value'
}
```


## Method

A minimal method needs the following:

```js
var method = {
    name:'addTodo' //name of the method
,   run(props,cb){
        cb(null,'anything')
    }
}
```

Here's the full listing of properties:

```js
var method = {
    name:'addTodo' //name of the method
,   method:['get','put'] //string or array of http verbs for which the method is valid. Used only in "middleware"
,   description:'Returns all todos' //used in help
,   append:false //if true, additional arguments will be appended to the last argument (see below)
,   args:[] //array of arguments objects
,   optionalArgs:[] //array of arguments objects
,   run(props,cb){
        cb(null,'anything')
    }
}
```

When calling a method, one might pass either an object or an array as arguments.
In other words, for the following method:
```js
var method = {
    name:'aMethod'
,   args:[
        {name:'first'}
    ,   {name:'second'}
    ]
,   run({first,second},cb){
        cb(null,true)
    }
}
```

All these calls are equivalent:
```js
api.run('aMethod',{first:'a',second:'b'})
api.run('aMethod',['a','b'])
api.runPath('/aMethod/a/b')
api.runPath('/aMethod',['a','b'])
api.runPath('/aMethod/a',{second:'b'})
api.runPath('/aMethod/a',[,'b'])
api.methods.aMethod(['a','b'])
api.methods.aMethod({first:'a',second:'b'})
```

**Note on the `append` property**: If true, arrays will be split on the arguments length, and the last argument will receive the remaining elements. In other words, for this call:
```js
api.run('aMethod',['a','b','c'])
```

the `run` function will be called with:
```js
function run({first,second},cb){
    console.log(first) //'a'
    console.log(second) //['b','c']
}
```

This is useful for having paths of arbitrary length, or for nesting apis:

```js
//getUsers/0/some/path/
var method = {
    name:'getUsers'
,   append:true
,   args:[
        {
            name:'id'
        }
    ,   {
            name:'path'
        }
    ]
,   run({id,path},cb){
        api2.runPath(path) // /some/path
            .then(result=>cb(null,result))
            .error(cb)
    }
}
```


# API

A minimal API needs the following:

```js
var API = {
    name:'Todos' //used in help
,   methods:[] //an array of methods objects
}
```

Full listing of properties:
```js
var API = {
    name:'Todos'
,   description:'Returns todo items'
,   default:'getAll' //when no method is provided, this will be the default method. Defaults to 'help'
,   methods:[]
}
```

After going through the factory, an API will have an additional method, `help`, that will display information about the api or any method.

---

# Compiling and testing

```sh
npm install --dev
```

tests:

```sh
npm test
```

compile:

```sh
npm run compile
```


Tests are a bit shit at the moment, but do make an ok job of testing the main functionality. The code is a bit of a mess and I'd need to refactor before being able to run more useful tests.

---

# MIT License

Copyright © Jad Sarout

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.