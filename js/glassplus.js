//  https://en.wikiquote.org/wiki/Brian_Kernighan
// Everyone knows that debugging is twice as hard as writing a program
// in the first place. So if you're as clever as you can be when you write it,
// how will you ever debug it?

function GLASSPLATE(f) { return f.glassplate( ) }
function inlineGLASS(s,m) { var template = GLASSPLATE( eval( "nonce = function (m) { /"+"***"+ s + "***"+"/}" ) ); return template(m) }

Function.prototype.glassplate =

function glassplate( opts ) {

		
    var functionsource = Strip( this ),		//  delete meteor line numbering
        startTime = Date.now( ),
        __name = getName( functionsource ),
        body = getBody( functionsource ),
        args = getArgs( functionsource );

//console.log(CFN,"|"+peek(Strip(functionsource),2000) );
                                                                var emitted = [ ];
																//  remove react inserted comments
                                                                function EMIT(s) { emitted.push( Strip(s) ) }    

                                                                EMIT( "function " + __name + "(" + args + ") {" );
                                                                //  if first argument is "true", enable entry/exit debugging
                                                                EMIT( "var __debug = (arguments[0] === true);\n" )
                                                                EMIT( "if(__debug){ Shiftargs(arguments); " +
                                                                    "console.log('◦"+ __name+ "◦'" +(args?","+args:"")+");}" );
    //  JSONize any glass args listed
    Each( arguments, function insertArgs(hash,i) {
        Pairs( hash, function copyHash(pr,j) {
            var key = pr[0], val = pr[1];
            args += ( args.length ? "," : "") + key;
                                                                EMIT( "\nvar " + key + " = " + JSON.stringify(val||{}) + "; // JSONized glassplate arg#"+(i+1)+" "+key );
        });
    });


    //  generate one nest level per argument name
    var namespaces  = args.split( "," ),
        openBraces  = MAP( namespaces, open).join(""),
        closeBraces = MAP( namespaces.reverse(), close).join(""); function open(n,i)  {  return  rep("  ",i)+"with ( " + n + ( n != "" ? "||("+n+"={ })" : "{ }" ) + " ) {\n"  }
    //function open(n,i)  {  return  rep("  ",i)+"with ( " + n + ( n != "" ? "" : "{ }" ) + " ) {\n"  }
    function close(n,i) {  return  "}\t\t// close " + n + "\n" }
    function rep(s,n) { var ret = ""; while ( n-- > 0 ) ret += s; return ret }
                                                                EMIT( "var o = [ ];         // collect output\n" );

                                                                EMIT( openBraces );

                                                                EMIT( "(function eval_closure(    ) {   //  closure for eval/Eval\n" );

    //  function = (EvenOdd(/*,*/).EvemOdd({{,}})) (body(function) );
    //var parts = body.split( /\/\*\*\*\*|\*\*\*\/|\/\*|\*\// );
    //var parts = body.split( /\/\*\*\*|\*\*\*\// );

    // allow 4-star and 3-star comment templates:
    //  / **** template **** / and / *** template *** /
    var parts = body.split( /\/\*\*\*\*|\/\*\*\*|\*\*\*\*\/|\*\*\*\// );
    parts.forEach(  function OUTER_EVENODD( part, i ) {
                        if ( i%2 == 0 ) {        
                            /** even **/                        EMIT( part );
                        } else          {
                            /** odd **/
                            var pieces = part.split( /\{\{|\}\}|<<|>>/ );
                            if ( part[0] == "*" ) {
                                                                EMIT( "/"+"*"+ part +"*"+"/" );
                                return;
                            }
                            pieces.forEach( function INNER_EVENODD( piece, j) {
                                                //  even
                                                if ( j%2 == 0 ) EMIT( "\tEmit(" + squote(piece) + ")" );
                                                //  odd
                                                if ( j%2 == 1 ) EMIT( "\tEmit( Eval(" + squote(piece) + ") )" );
                                            });
                        }
                    });

	//  Eval extends native eval with try-catch, etc
	function Eval( ___piece ) {
		var ___val, ___type;
		//  catch any eval errors
		try {
			___val = eval( ___piece );
		}
		//  passthrough undef eval
		catch (err) { ___val = "{{"+ ___piece +"}}"; }
		return ___val;
	}
																	//  pass through function definitions
                                                                EMIT(    '\t'+ Shiftargs );
                                                                EMIT(    '\t'+ Emit     );
                                                                EMIT(    '\t'+ Strip    );
                                                                EMIT(    '\t'+ Join     );
                                                                EMIT(    '\t'+ Eval     );

                                                                //  end the closure that makes Eval work
                                                                EMIT(    '\n})( ); //  immediate anon\n');

                                                                //  close the withs nesting, close function
                                                                EMIT(    closeBraces    );  
                                                                EMIT(    'var __ret = o.join("");\n' );
                                                                EMIT(    '__debug && console.log("debug",__name,"arguments",' );
                                                                EMIT(    'arguments[0]||"",arguments[1]||"","==>",__ret.length,__ret);\n' );
                                                                EMIT(    'return __ret;\n' +
                                                                         '}     //  end '+__name+' function\n'  );

    function Emit(vargs) { o.push.apply( o, arguments ) }
    function Join(vargs) { return o.join('') }
	function Strip(s) { return String(s).replace( /[ ]*[/][/]( \d+|)\n/mg, "\012") }
    function Shiftargs(a) { [ ].splice.call(a,0,1) }


    var ret = window.myJoin ? myJoin(emitted) : emmitted.join("\n"); // ret = optimizeGlass(emitted);
    //console.log("compiled",peek(ret,1e6));
    eval("ret = " +  ret);
    var endTime = Date.now( );
    //console.log(CFN,"compile time", __name, (endTime-startTime).toFixed(0)+"ms" );
    return ret;
} // end glassplate



//   we use regular expressions to parse
//   function foo( arg1,arg2... ) {  body  }

//  return foo
function getName( f ) {
                        var ret = f.toString( )
                                .replace( /function\s*|[(][^\0]*/g, "");
                        //console.log(CFN,ret);
                        return ret }

//  return body
function getBody( f ) { var ret = f.toString( )
                                .replace( /^function[^{]+.|}$/g, '')
                        //console.log(CFN,ret); 
                        return ret
                      }

//  return arg1,arg2,...
function getArgs( f ) { var ret = f.toString( )
                                .replace( /[)][^\0]*$/, '')
                                .replace( /function.*[(]/, '')
                                .replace( /\s+/g, '');
                        //console.log(CFN,ret);
                        return ret }

//  single quote multi-line string
function squote(s) { return "'" + s.replace(/\n/g, '\\n\\\n').replace(/'/g, "\\'") + "'" }











//  optimizer, added 10/15/2014
//  join that merges adjacent Emit 
function myJoin(a) {
    var ret = [ ];
    //console.log(CFN,a.length,a);
    //  eliminate nulls
    for (var i = 0; i < a.length; i++) {
        while ( a[i] && a[i].match(/^\s*Emit\(''\)\s*$/) )
            a.splice(i,1);  
    }
    //console.log(CFN,a.length,a);

    //  merge consecutive Emit
    var match;
    for ( i = 0; i < a.length; i++) {
        for ( var n = 0; a[i+n]; n++ ) {
            //  break not constant
            //console.log(CFN,i,n,a[i+n]);
            if ( !a[i+n].match(/^\s*Emit[()]/) )
                break;
        }
        //console.log(CFN,"!!!",n);
        if ( n <= 1 ) continue;
        var removed = a.splice( i, n);
            replace = MAP( removed, function stripConst(item,i) {
                                    //   parse  Emit('  <div>Hello World, ')
                                    var match = item.match( /^\s*Emit\(('[^\0]*')\)\s*$/m );
                                    if ( match ) return match[1];
                                    var match = item.match( /^\s*Emit\(\s*(Eval\('[^\0]*'\))\s*\)\s*$/m );
                                    if ( match ) return match[1];
                                    console.log(CFN,"oops", i, item);
                                    return "oops"+i;
                                    });
        a.splice( i, 0, "\tEmit(" + replace.join(",") + ")" );
    }
    return a.join('\n')
}
