
//  genedronek's idiosyncratic portability layer

window.__defineGetter__( "CFN",
		function currFN() { return "•"+String(arguments.callee.caller||"window").replace( /[()][^\0]*/m, "").replace( /function\s*/, "")+"•"  }
						);
window.__defineGetter__( "CFNA",
		function currFNA() { return String(arguments.callee.caller||"window").
							replace( /function\s+(\w*)\(([^\000\)]*)\)[^\000]*/m, "$1($2)" ).replace(/\s+/g,""); }
						);

window.__defineGetter__( "CFNAA",
		function currFNA() { 	var npa =  String(arguments.callee.caller||"window").
												replace( 	/function\s+(\w*)\(([^\000\)]*)\)[^\000]*/m, "$1($2)" ) .replace(	/\s+/g, "" );
								return [ npa, arguments.callee.caller.arguments ]; }
						);
Array.prototype.__defineGetter__( "JB", function (v) { return Array.prototype.join.call( this, " " ) } );
Array.prototype.__defineGetter__( "JC", function (v) { return Array.prototype.join.call( this, "," ) } );


function  byId(s,d) { return (s||{}).nodeName ? s : (d||document).getElementById(s) }

function isDom(e) { return (typeof e == "object" && e && e.nodeType && e.nodeName) && e }
function isString(e) { return typeof e == "string" && e }

function isFunct(v) { return Object.prototype.toString.call( v ) == "[object Function]" && v }
function isObj(v) { return v !== null && typeof v == "object" }


//  do querySelect if s is string, return s if s is already dom
//
// acts like ele thunk at last instant
//  ele = bySel( ele );

function  bySel(s,d) {
		//console.log(CFN,typeof s,peek(s),typeof d);
	try {
		var ret;
		//  fast return if DOM already
		if ( isDom(s) ) {
			//console.log(CFN,s.nodeName,s);
			return ret = s;
		}
		//  sense selector string
		if ( !isString(s) ) {
			console.log(CFN,"bySel selector err",s,d||"")
			throw "bySel selector err "+s;
			return ret = s;
		}

		//  finalize parent
		var parent = d || document;
		parent = ( isString(parent) ? document.querySelector(parent) : parent );
		//  sense error
		if ( !isDom(parent) ) {
			throw "bySel parent err "+d;
			return ret = s
		}
		//  perform select
		ret = parent.querySelector( s );
	} catch (ex) { throw "bySel catch " + ex }
	finally { 
		//  catch return ret
		//console.log("bySel",peek(s),"==>", ret );
		return ret
	}
}

function  bySelAll(s,d) {
		var ret;
		s = s || {};
		//  sense d is a string still to look up
		d = d || document;
		if ( typeof d == "string" )
			d = document.querySelector( d );

		//  perform select if DOM
		if ( d && d.nodeType )
			ret = d.querySelectorAll( s );
		else
			throw "no parent node " + s +" "+ d;

		return ret;
}

function  COPY(a,n) { return n ? Array.prototype.slice.call(a,n) : Array.prototype.slice.call(a); }


function injectHTML(string,parent) {
	string = String( string || "no-html" ).trim() || "";
	parent = bySel( parent ) || document.body;
	if ( isDOM( parent ) )
		parent.innerHTML = string;
	return parent;
}

function innerHTML(string,ele,ret) {

	//  case !ret: return first injected node
	var target = bySel( ele );
	if ( isDOM( target ) )
		target.innerHTML = String( string || "no-html" ).trim( );
	if ( !isArray( ret ) )
		return ele.firstChild;

	//  case ret=[]: return array of nodes
	var cursor = ele.firstChild;
	while ( cursor ) {
		ret.push( cursor );
		cursor = cursor.nextSibling;
	}
	return ret;
}


//  return first injected node
function outerHTML(string,ele,ret) {
	string = String(string||"no-html").trim( );
	var target = bySel(ele);
	if ( !isDOM( target ) ) { throw "no outerHTML ele " + ele; return }
	var leftSib  = target.previousSibling,
		rightSib = target.nextSibling,
		parent = target.parentNode;

//console.log(CFN,string,ele,parent);
	//  mutatandis DOMinus
	target.outerHTML = string;

	//  return first injected node
	if ( !isArray( ret ) )
		return leftSib ? leftSib.nextSibling : parent.firstChild;
	
	//  gather list of injected nodes
	var cursor = ( leftSib ? leftSib.nextSibling : parent.firstChild )
	while ( isDOM( cursor ) && cursor != rightSib ) {
		ret.push( cursor )
		cursor = cursor.nextSibling;
	}
	console.log(CFN,ret.length,ret.length, ret[0] );

	return ret[0];
}

function insertHTML(string,node,ref,ret) {
	console.log(CFN,peek(string), peek(node),ref,ret||"");
	//  finalize string
	string = string.trim( ) || "";
	//  finalize node
	var parent = (node && bySel( node )) || document.body;
	if ( !parent ) {
		console.log(CFN,peek(string),node,ref,ret,"no parent");
		throw "no parent" + node;
		return;
	}
	//  finalize ref = given node
	//  or use firstChild
	//  or use null
	ref = bySel( ref ) || (parent && parent.firstChild) || null;
	console.log(CFN,"ref is",ref, ref && ref.nodeName);

	console.log(CFN,peek(string), (parent.nodeName),ref,ret||"");
	// TODO could test parent for svg namespace? SVGElement -->> createElementNS

	//  insert temp div before ref node, and then outerHTML it
	var ele = parent.insertBefore( document.createElement("div"), ref);
	var leftSib = ele.previousSibling;
	var rightSib = ele.nextSibling;

	//  inject html
	ele.outerHTML = string;

	// return single first element
	if ( !isArray( ret ) ) {
		return ( (leftSib) ? leftSib.nextSibling : parent.firstChild )	
	}

	//  ret = return array of injected nodes
	var first = (leftSib) ? leftSib.nextSibling : parent.firstChild;
	while ( first && first != rightSib ) {
		ret.push( first );
		first = first.nextSibling;
	}
	return ret;
}

function appendHTML(string,d,ret) {
	string = String(string||"no-html").trim( );
	parent = bySel( d ) || document.body;
	//console.log(CFN,peek(string),parent,"d",d);

	var tmp = parent.appendChild( document.createElement("div") );
	var leftSib = tmp.previousSibling,
		rightSib = tmp.nextSibling;
	//  inject into DOM
	tmp.outerHTML = string;
	
	//  return first element injected
	if ( !isArray( ret ) ) {
		return  leftSib ? leftSib.nextSibling : parent.firstChild;
	}

	//  return array of injected nodes
	var first = (leftSib) ? leftSib.nextSibling : parent.firstChild;
	while ( first && first != rightSib ) {
		ret.push( first );
		first = first.nextSibling;
	}
	console.log(CFN,peek(string),parent, ret.length, ret[0] && ret[0].nodeName);
	return ret
}

//function injectHTML( blob, node, where, done,error) { }
//function injectCODE( blob, node, where, done,error) { }

//injectHTML( string, parent, ref, callback, opts )
//injectNodes( nodes, parent, ref, callback , opts)

function TODOinjectHTML(string,node,where) {
	string = string || "";
	node  = bySel( node );
	where = where || "last";
	where = (	where.match(/before$/)       ? "beforebegin" :
				where.match(/after/)         ? "afterend"    :
				where.match(/first(Child)?/) ? "afterbegin"  :
				where.match(/last(Child)?/)  ? "beforeend"   :
				"beforeend" );
}


function createHTML(string,parent,how,ref)
{
	function isString(x) { return typeof x == "string" }
	function fixSafari( ele ) { return ele.nodeType == 1 ? ele.nodeParent : ele; }
	function isEle(x) { return !!(x && typeof x == "object" && x.nodeType && x.nodeName) }
	function getChildIx( ele ) { return  Math.max( 0, inArray( ele.parentNode.childNodes, ele )) }
	try {

		//  thunk arguments to final values
		if ( !string ) { throw "createHTML no string"; return }
		string = string.trim( );
		var psave = parent;

		if ( typeof psave == "string" ) { 
			parent = bySel( parent );
		}
		if ( !parent ) {
			console.log(CFN,"no parent", psave);
		}
		parent || ( parent = document.body );
		
		how    = how || "append";
		ref    = ((typeof ref == "string") ? bySel( ref,parent ) : ref) || null;
		//console.log("createHTML",(string),'*',parent,parent.childNodes.length,how,ref);
		// error test top parent
		if ( parent == window.parent )
			throw "parent specified wrong";

		//  determine ref index where return will land
		var retIx = (isEle( ref )) ? getChildIx( ref ) : ref;
		//  append with index replaced by insert index+1
		if ( how.match(/app/) && typeof retIx == "number" ) {
			how = "ins";
			++retIx;
		}
		//  usually (99%) we want to append to end of list
		//console.log(  CFN, parent )
		if ( typeof retIx != "number" ) 
			retIx = parent.childNodes.length;

		//  surprize me! both a parent AND a grandparent node are required by outerHTML
		if ( !parent || !parent.parentNode )
			throw( ["createHTML no parent/grandparent", peek(string)].join("\n") );

		//  append/insert empty div
		var div = document.createElement( "div" );
		( how.match( /ins/ ) )
				? parent.insertBefore( div, ref )
				: parent.appendChild( div );

		//  rewrite div node; this will invalidate all refs
		div.outerHTML = string;

		//  finally return the index any child nodes created
		//console.log(CFN,"retIx", retIx, parent.childNodes[ retIx] );
		var ret = parent.childNodes[ retIx ];
	}
	catch (ex) { console.log(["createHTML failure",ex,parent,peek(string)]);}
	//console.log(["createHTML=>",ret, retIx, how, ref]);
	return ret;
}

var Each = EACH;
function EACH(a,f,returnA) {
	//console.log(CFN,a,f);
	try {

		(a || (a = [ ]));
		(f || (f = function Identity(x) { return x }));
		var n = a.length;
		if ( typeof a != "object" || isNaN( a.length ) || (a.nodeName&&a.nodeType) )
			throw "Each arg (" + typeof a + ") not array";
		
		//	2 args => just evaluate function
		if ( arguments.length == 2 ) { 
			for (var i = 0; i < n; i++)
				f( a[i], i, a );
			return returnA;
		}

		//	3 args => map.  evaluate function and return value
		if ( arguments.length == 3 ) {
			returnA = returnA || [ ];
			for (var i = 0; i < n; i++) {
				returnA.push( f( a[i], i) );
			}
		}
		return returnA;

	}
	catch (ex) { console.log( "Each( ), iteration #",i,ex ); debugger; throw ex; }
	finally { return returnA }
}

function  expandTabs(s,w)
{
	var m;
	while ( m = s.match( /^([^\t]*)(\t+)(.*)/) )
	 	s = m[1] + spaces( m[2].length * w - m[1].length % w ) + m[3];
	return s;
	function spaces(n) { return repeat( ' ', n ) };
}

//  shallow copy into target (if key yet undefined) from source object(s)
function Defaults( target, source) {
	console.log( CFN, target, source);
	var a = COPY( arguments ),
		Void = a.shift( ),
		n = 0;
	target || ( target = { } );

	//  iterate over source objects
	while ( source = a.shift( ) ) {
		console.log( CFN, ++n, source);
		//  iterate testing every source key
		Pairs( source, doPAIR);
	};

	return target;

	//  set value if target.key undefined and new value defined
	function doPAIR( pr ) {
		var key = pr[0], val = pr[1];
		if ( !target.hasOwnProperty( key ) && isDEF( val ) ) {
			target[ key ] = val;
		}
	}
	function isDEF(x) { return typeof x != "undefined" && x !== null }
}

//  Extend( obj, string, string )
//  Extend( obj, { key:value,...}, ... )
EXTEND = Extend;
function  Extend( obj /* vargs */ ) {
	//  essentially a shallow copy of listed initializers
	obj || (obj = { });
	//console.log(CFN,"OBJ=",obj);
	var args = Array.prototype.slice.call( arguments, 1),
		n = args.length,
		initObj,
		i, key;
	
	//  interate over list of initializers
	for ( i = 0; i < n; i++ ) {

		if ( initObj  = args[ i ] ) {
			//console.log(CFN,i,initObj, typeof initObj );

			//  sense given simple key,value pair
			if ( typeof initObj == "string" ) {
						var key = args[i], value = args[++i];
						obj[ key ] = value;
						continue;
			}
			//  otherwise, shallow copy all local pairs
			for ( key in initObj ) {
				if ( initObj.hasOwnProperty( key ) ) {
					obj[ key ] = initObj[ key ];
				}
			}
		}
	}
	//console.log(CFN,obj);
	return obj;
}
//console.log( Extend({ },"hello","world",{hell:"yes",name: "name",}) );

function float(x) { return parseFloat(x) }

function functName(s) 	{ return String(s).replace( /[(][^\0]*/,"").replace(/function\s*/,'') } //)

function getFunctionStack(ret) {
	ret = ret || [ ];
	var ttl = 99,
		callee = getFunctionStack.arguments.callee,
		caller;

	while ( --ttl >= 0 && (caller = callee).caller ) {
		callee = caller.caller;
		ret.push( ttl ? [ functName( callee ), callee ] : ["...ttl=0",null] );
	}
	//console.log(CFN,ret.length,ret);
	return ret;
}

function  grep(a,keep,drop) {
	a = (a instanceof Array) ? a : [ a ];
	keep = keep || /^/;			//  default always
	drop = drop || /huh$^/;		//  default never
	var r = [ ],
		n = a.length;
	//console.log(CFN,a,keep,drop,n);
	
	//  otherwise assume RegExp
	for (var i = 0; i < n; i++) {
		var x = a[ i ];
		if ( keep.test( x ) && !drop.test( x ) )
			r.push( x );
	}
	//console.log(CFN,"==>",r);
	return r;
}

//  copy a, less all b keys
function  Elide(a,b)
{
	// a is hash

	// if b is list, convert to hash
	if ( b instanceof Array )
		b = Hash( MAP( b, function (key) { return [ key, key ] }) );

	// now b is hash
	var ret = { };
	for (var key in a) {
		if ( ! (key in b) )
			ret[ key ] = a[ key ];
	}
	return ret;
}


//  dup indexOf
function  inArray(a,x) {
	// fail errors
	if ( !a )
		return -1;
	
	for (var i = 0, n = a.length; i < n; i++) 
		if ( a[ i ] === x )
			return i;
	return -1;
}

function IndexOf(a,x) { return inArray(a,x) }

function iota(n) { var i, ret = [ ]; for( i=0; i<n; i++) ret.push(i); return ret; }

function  isUndef(x)   { return typeof x == "undefined" }
function  isDef  (x)   { return typeof x != "undefined" }
function  isString(x) { return typeof x == "string" }


function  Drop(a,f) {
	a = a || [ ];
	f = f || /^/;
	var ret = [ ];
	//console.log(["Drop", TypeOf(a), TypeOf(f) ]);
	if ( TypeOf(f) == "String" ) f = new RegExp( f );
	if ( TypeOf(f) == "RegExp" ) {
		for (var i = 0, n = a.length; i < n ; i++) {
			var match = a[i].toString( ).match( f )
			if ( !match )
				ret.push( a[i] );
		}
		//console.log(["Drop=>", ret]);
		return ret;
	}
	for (var i = 0, n = a.length; i < n ; i++) {
		var bool = f( a[i] );
		if ( bool )
			ret.push( a[i] );
	}
	//console.log(["Drop=>", ret]);
	return ret;
}
function  Keep(a,f) {
	a = a || [ ];
	f = f || /^/;
	var ret = [ ];
	//console.log(["Keep", TypeOf(a), TypeOf(f) ]);
	if ( TypeOf(f) == "String" ) f = new RegExp( f );
	if ( TypeOf(f) == "RegExp" ) {
		for (var i = 0, n = a.length; i < n ; i++) {
			var match = a[i].toString( ).match( f )
			if ( match )
				ret.push( a[i] );
		}
		return ret;
	}
	for (var i = 0, n = a.length; i < n ; i++) {
		var bool = f( a[i] );
		if ( bool )
			ret.push( a[i] );
	}
	//console.log(["Keep=>", ret]);
	return ret;
}


//  return list a - list b
//  eliminates duplicates
function  listDiff(a,b)
{
	var hash = { };
	for (var i = 0, n = a.length; i < n; i++)
		hash[ a[i] ] = true;
		
	for (var i = 0, n = b.length; i < n; i++)
		delete hash[ b[i] ];

	return keys( hash );
}

function  isArray(a)  { return Object.prototype.toString.call(a) == "[object Array]" }

function  isString(s) { return typeof s == "string" }

function  isLengthy(a) { return a && typeof a == "object" && a.hasOwnProperty('length') && isLength( a.length ) }
function  isLength(len) { typeof len == "number" && len >= 0 }

// add ecma5 getOwnProper
function keys(o) { var r=[]; for(var i in o) { if ( o.hasOwnProperty(i) ) r.push(i); } return r }


function Thunk(v) { var ret = v; if ( typeof v == "function" ) ret = v( ); console.log(CFN,v,"==>",ret);return ret; }

function Keys(h) { return (Object.getOwnPropertyNames) ? Object.getOwnPropertyNames( h ) : keys( h ) }

//  iterate hash as pairs 
//  optional filter function (key,val,ix) -> [ key , eval ]
//  undef keys and evals are ignored
Pairs = PAIRS
function PAIRS(o,f) {
	var r=[ ];
	f = f || function (key,val,ix) { return [ key , val ] };

	var ix = 0;
	for(var key in o) {
		if ( o.hasOwnProperty(key) ) {
			var val = o[key];
			var eval = f( key, val, ix++ );
			if ( typeof eval != "undefined" && typeof key != "undefined" )
				r.push( eval );			// return key value pair
		}
	}
	//console.log(CFN,"==>",r);

	return r;
}

function Hash(a) { var r={ }; Each( a, function (pr) { r[ pr[0] ] = pr[1] }); return r }
function HashMap(a,f) { return Hash( MAP( a, f) ) }
function HashPairs(h,f) { return Hash( Pairs( h, f) ) }

function  vals(o) { var r=[];for(var i in o) if ( o.hasOwnProperty(i) ) r.push(o[i]); return r        }
function pairs(o) { var r=[];for(var i in o) if ( o.hasOwnProperty(i) ) r.push([i,o[i]]); return r; }
function  Vals(o) { var r=[];for(var i in o) if ( o.hasOwnProperty(i) ) r.push(o[i]); return r        }
function  Values(o) { var r=[];for(var i in o) if ( o.hasOwnProperty(i) ) r.push(o[i]); return r        }

function MapPairs(hash,f) { return MAP( Pairs(hash), f); }
function HashMapPairs(hash,f) { return Hash( MapPairs(hash,f) ) }

function  MAP(a,f,ret) 
{
	var ret = Each(a,f,ret || [ ]);
	return ret;
}

//  MAPT - map, keep truthy (v)=>(not(false(v)))
//  MapNF - map but keep only non-false values
MAPT = MapNF;
function MapNF(a,f,ret) {
	ret = ret || [ ];
	for ( var i=0, n = a.length; i < n; i++) {
		var ai = a[ i ],
			val = f( ai, i, a);
		if ( typeof val == "undefined" )
			console.log("ai undefined", i,ai);
		if ( typeof val != "undefined" && val !== null && val !== false )
			ret.push( val );
	}
	return ret;
}

function MapJoin(a,f,ch) { return MAP(a,f).join(ch|'') }

//  like Each for hashes <F2>
function Own(hash,f) { ret = [ ]; for (k in hash) { hash.hasOwnProperty(k) && ret.push( f( hash[k],k,hash ) ) }; return ret; }


// limit string to length n
function peek(s,n) {
	n = n || 39;
	//console.log( CFN, s, n ); 
	if ( s === null        ) 		s = "(null)";
	if ( typeof s == "undefined" )	s = "(undefined)";
	if ( typeof s != "string" )		s = String( s );
	s = s.replace( /\n/g, "↵")  //may display poorly in console
		  //.replace( /\n/g, "@")	//  better display
		 .replace( /\t/g, "▪︎")
		 .replace( /\s+/g, " ") 
	var head = s.substr(0,n),
		rem  = s.substr(n);
	return head + ( rem.length ? "..." : "" );
}

//  extract by name from list, field 'n' from array of items 'a'.
//  normally items are plain hashes
//  if an item is a dom node, getAttribute is used

function  Pluck(a,n) {
	return MAP(a, function (item,ix) {
		var obj = item[ n ];
		return (( typeof obj != "undefined")
					? obj
					: obj.getAttribute && obj.getAttribute( n ));
	});
}

//  pluck node style
function PluckStyle(a,n) { return MAP( a, function (ele) { return ele.style[ n ] }) }

// printObj(name,obj,level)(obj,level)
function printObj(name,obj,level,seen) {

	var a = COPY(arguments),
		ret = [ ];

	// string name is optional first argument
	name = ( (typeof a[0]).match(/string|number|bool/)
							? a.shift( )
							: "anon" );
	obj   = a[0] || { };
	level = a[1] || 0;
	seen  = seen || { };

	//  intercept atoms here
	if ( typeof obj != "object" )
		return indent( name + ": " + obj.toString( ), level);

	//  only objects can be recursive
	var ret = [ ],
		emit = function emit(s,l) { ret.push( indent(s,l) ); },
		sorted = keys( obj ),
		arry   = ( obj.constructor == Array
									? "[]"
									: "{}" );

	//  sense if obj seen already
	var recursion = Some( keys(seen), function (key,i) {
		if ( obj === seen[ key ] ) { return name; }
	});
	if ( recursion.length || level > 20 ) {
		return  indent( name + ":->" + recursion[0], level );
	}
	seen[ name + "." + level ] = obj;

	emit( name + arry[0], level );
	Each( sorted, function (key) {

		if ( !obj.hasOwnProperty( key ) )
			return;
		var value = obj[ key ],
			type  = typeof value;

		if ( type.match( /number|boolean|function|string/ ) || ( value && value.nodeType ) ) {
			emit( key + ": " + peek( value, 60 ), level+1 );
		}
		else {
			emit( printObj( key+"", obj[key], level+1, seen ) );
		}
	});
	emit( arry[1], level );

	return ret.join( "\n" );
	function repeat(s,n) { var r="";while(n-- > 0)r+=s;return r; }
	function indent(x,l) { return repeat('    ',l) + x; }
	function lpad(s,n) { n = n||0; s = s+""; while ( s.length < n ) s = " " + s; return s; }
}

function lpad(s,n,c) { n = Number(n)||0; c = String(c||" "); s = String(s); return repeat(c,n-s.length)+s; }
function rpad(s,n,c) { n = Number(n)||0; c = String(c||" "); s = String(s); return s+repeat(c,n-s.length); }
function ljust(s,n,c) { s+=''; n||(n=0); c||(c=' '); return (s+repeat(c,n-s.length)).slice(0,n); }
function rjust(s,n,c) { s+=''; n||(n=0); c||(c=' '); return (repeat(c,n-s.length)+s).slice(-n,n); }
function cjust(s,n,c) { s+=''; n||(n=0); c||(c=' '); var x = Math.floor((n-s.length)/2), prefix = repeat(c,x);
															return (prefix+s+prefix+" ").slice(0,n); }

function px(x) { if ( typeof x == "number" ) x += "px"; return x; }

function  random(n) {  return Math.floor( (n+0)*Math.random( ) )  }
function  randInterval(m,n) {  return m + (n-m+1) * Math.random( )  }
//console.log( "randi", randI( 90, 110 ) );

function  ranColor(opacity) {
	opacity = opacity || .5;
	var hexTab = "555556789ABCDEEF";	//  light random colors
	var r = hexTab[ random(16) ];
	var g = hexTab[ random(16) ];
	var b = hexTab[ random(16) ];
	var color = ["rgba(",[h(r),h(g),h(b),opacity].JC,")"].join("");
	//console.log("ranCOlor", color );
	return color
	function h(v) { var dec = parseInt(v+'0',16); return dec }
}

function  repeat(c,n) { var ret='';for(;n>0;--n) ret+=c; return ret; }

//  ret = Reduce( array, cbf, init)
//  and cbf( prev, curr, i, array )

function  Reduce(a,f,previous) {

	if ( !a ) { throw ("Reduce no array " + a); return}
	var n = a.length;

	// if no previous passed, use short form
	if ( arguments.length == 2 ) {
		previous = a[ 0 ];
		for (var i = 1; i < n; i++) {
			previous = f( previous, a[i], i , a);
		}
	}

	if ( arguments.length == 3 ) {
		
	}

	if ( a && a.length ) {
		if ( !f ) f = function sum(p,c,i,a) { return p + c };

		for (var i = 0, n = a.length; i < n; i++)
			previous = f( previous, a[i], i, a );
	}
	return previous;
}
//function mysum(p,c,i,a) { return p + c }
//console.log(["Reduce unit test", Reduce( [1,2], mysum) ]);

function  slice(a,i) { return Array.prototype.slice.call(a,i||0) }

function  WRONGSome(a,f,r) { r=r||[];a=a||[];for(var i=0,n=a.length;i<n;i++) {var v=f(a[i],i); v && r.push(v);}; return r;}
function  Filter(a,f,r) { r=r||[];a=a||[];for(var i=0,n=a.length;i<n;i++) {var x,v=f(x=a[i],i,a); v && r.push(x);}; return r;}
function  First(a,f,r)  { r=r||[];a=a||[];for(var i=0,n=a.length;i<n;i++) {var x,v=f(x=a[i],i,a); if ( v ) return x } }
function  Every(a,f,r) {
							r=r||[]; a=a||[];
							for(var i=0,n=a.length; i<n; i++) {
								var x, v = f.call(r,x=a[i],i,a);
								if (v == false) return false;
							}
							return true;
						}
function  Some(a,f,r) {
							r=r||[]; a=a||[];
							for(var i=0,n=a.length; i<n; i++) {
								var x, v = f.call(r,x=a[i],i,a);
								if ( v ) return true;
							}
							return false;
						}

//console.log( "test Some", Some( [1,3,5], function (x) { return x == 3 }) );

function  spaces(n) { return repeat( ' ', n ) };

function showHash(h, sep) {
	var ret = [ ];
	var klist = keys( h );
	for (var k in klist) {
		var key = klist[k];
		if ( h.hasOwnProperty(key) )
			ret.push( key + ":" + h[key] );
	}
	function hasOwnProperty(x,y) { return Object.prototype.hasOwnProperty.call( x, y) }
	return ret.join( sep || ", ");
}
//console.log(["showHash", showHash({ show:42, hash:"haash"}) ]);
							
//  8/19/2014 EFD
//  toggle more than one classname at a time
function TOGGLE_CLASSES(sel,classnames,all) {
	var eles = arguments.length==3 ? bySelAll(sel) : [ bySel(sel) ],
		names = String(classnames).split(/ /);
	//console.log(CFN,sel,names,eles.length,names.length);
	
	Each( eles, function toggleMultiple(ele,i) {
		if ( !ele ) { console.log("TOGGLE no ele", sel, i, classnames, all); return }
		//console.log(CFN,ele.id, ele);
		for (var i = 0; names[i]; i++)
			ele.classList.toggle( names[i] );
		//console.log("final", ele.className);
	});
};

//  return iterator function that evaluates each function in order
//  usage:  var toggler = ToggleFactory( f1, f2, f3... );
//			var next = toggler( );
//  advance use: optional 1st arg obj is latched and used as context
function ToggleFactory( /* varga */ )
{
	var index = -1,
		fns = COPY( arguments ),
		context = //  consume optional first argument
				( typeof fns[0] == "object" )
								? fns.shift( )
								: { };

	return  Extend( 
					function iterator( ) {
						//  advance index to next function in list
						index = (index+1) % fns.length;

						//  call fn with context and index number
						return fns[ index ].call( context, index );
					}, {
						index:		index,
						fns:		fns,
						context:	context,
					});
}
 


function toCamel ( s ) { return String(s).replace(/^-|(\-[a-z])/g, function($1){return $1.toUpperCase( ).replace('-','') }) }
function toDashed ( s ) { return (s||"").replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase( ) }) }


function trim(s) { return 	String.prototype.trim ? String.prototype.trim.call(s) : String(s).replace( /(^\s+)|(\s+)$/g, '' ) }

function typeOf( obj ) { return Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1] }

//  return obj if true 
function isDOM( x ) { return !!(x && typeof x == "object" && x.nodeType && x.nodeName     ) }
function isDOC( x ) { return !!(x && typeof x == "object" && x.nodeType == 9 && x.nodeName) }
function isWIN( x ) { return !!(x && typeof x == "object" && x.document &&   x.Infinity   ) }


function arrayMax(a) { return Math.max.apply( Math, a); }
function arrayMin(a) { return Math.min.apply( Math, a); }

	// extract /** comments **/ block from function source.
	function uncomment( f ) {
	/**
	// Extract first block of source-code comments from function f.
	// Extracts commented lines through line with closing match.
	// Use of leading whitespace before slash star is optional.
	**/
		f = String(f || arguments.callee.caller).replace(/^[^{}]*[{}]/,"");
		// try double star
		var m = (f+"\n\n").match( /\s*[/][*][*](\s*TEMPLATE)*([^\0]*)[*][*][/]/im );
		if ( m ) return m[2];
		// try single star
		var m = (f+"\n\n").match( /\s*[/][*](\s*TEMPLATE)*([^\0]*)[*][/]/im );
		return m ? m[2] : "/*uncomment failed*\/";
	}
//console.log( "uncomment test", uncomment( uncomment ) );


//  elapsed(name,"start  loading",obj) obj optional
//  elapsed(name,"finish loading",obj) obj optional

function elapsed( name, tag, obj ) {
	name = name || ""; tag = tag || "";
	elapsed.timers = elapsed.timers || { };
	var before = elapsed.timers[ name ],
		now = +(new Date).getTime( ),
		delta = now - before,
		ret = ( before
					? delta +"ms":
					"" );
	elapsed.timers[ name ] = now;
	elapsed.timers[ name +".delta" ] = delta;
	//			client.js    finished     0ms   optional obj
	console.log( name + ": " + tag + " " + ret, typeof obj != "undefined" ? obj : "", "elapsed( )", elapsed.timers );
}

function getViewport( ) { var h = document.documentElement; console.log( CFN, [ h.clientWidth, h.clientHeight ]); return[ h.clientWidth, h.clientHeight ]  }


function untemplate(tmp, ob) {
	tmp || (tmp = " ");
	ob  || (ob  = { });
	console.log(CFN,tmp,ob);

	with ( ob ) {
		console.log("with", ob, ob.val, typeof val );
		var ret = tmp.replace( RegExp("!!([^!!]*)!!","gi"), function(tag, prop){
						var ___val;
						try {
							//console.log("about to eval", prop);
							___val = eval( prop )
						} catch (err) {
							//console.log( CFN, err)
						}
						if ( typeof ___val == "undefined" ) {
							console.log( CFN, prop, ___val, tmp, ob );
							___val = "'" + prop + "?'";
						}
						return ___val;
					});
	}
	console.log( CFN, "==>", ret);
	return ret;
}
function test(ctx) {
/* TEMPLATE
hi
*/
	return newMicro( )
}
function newMicro( tmp, ctx1, ctx2 ) {
	console.log( CFN, arguments.caller.callee );
}
	
//  micro alias to auto uncomment and autoctx if no args
function micro( s, ctx1, ctx2) {
	//console.log( CFN, s, ctx1,ctx2);
	var caller = arguments.callee.caller,
		cargs = caller.arguments;
	return ( (arguments.length)
				? microtemplate( uncomment(caller), cargs[0],cargs[1])
				: microtemplate( uncomment(caller), cargs[0],cargs[1]) );
}

var unTemplate = microtemplate;

//  see John Resig article for origin micro templating source
//  must be within a function!!!
function microtemplate(tmp, ob, obG ) {
	tmp || (tmp = " ");
	ob  || (ob  = { });		// as parent
	obG || (obG = { });		// as grandparent
	//console.log(CFN,tmp,ob,obG, arguments, arguments.callee, arguments.callee.caller);

	//  nested grandparent and parent lookup created using with statement
	with ( obG ) {
	  with ( ob ) {
		//console.log("with", keys(ob).JB, keys(obG).JB );
		var ret = tmp.replace( RegExp("{{([^{}]*)*}}","gi"), function(tag, prop){
						var ___val, ___type;
						try {
							//console.log("about to eval", prop);
							___val = eval( prop );
						} catch (err) {
							console.log( CFN, "catch", err)
						}

						switch ( ___type = typeof ___val )
						{
							case "function": 	mapFunction( ); break;
							case "undefined": 	mapUndefined( ); break;
							case "object":  	if ( ___val instanceof Array ) 		 	 	
													mapArray( );
												else if ( ___val instanceof HTMLElement ) 	
													mapHTML( );
												else if ( ___val instanceof SVGElement ) 	
													mapSVG( );
												else 
													mapObject( );
												break;
							case "string": break;
							case "number": break;
							default:	console.log("default reached", ___type );
						}

						function mapUndefined( )	{ console.log( CFN, prop, ___val, tmp, ob ); ___val = "'" + prop + "?'"; }
						function mapFunction( )		{ 
													//console.log( CFN, "about to evaluate " + ___val );
													var ret = ___val && ___val.apply( ob );
													//console.log( peek(___val), "apply returns",ret);
													___val = ret; }
						function mapArray( ) 		{ ___val = "" + ___val && ___val.join(" ") }
						function mapHTML ( ) 		{ ___val = "ele " + ___val && ___val.nodeName }
						function mapSVG  ( ) 		{ ___val = "svg " + ___val && ___val.nodeName }
						function mapObject( ) 		{ ___val = "obj " + keys( ___val ).join(" ") }

						//console.log("==>",___val, typeof ___val );
						var ___type = typeof ___val;
						if ( ___type == "function" ) { }
						else if ( ___type == "object" ) { }
						else if ( ___type == "undefined" ) { }
						return ___val;
					});
	  }
	}

	//console.log( CFN, "==>", "'"+ret+"'");
	return ret;
}


function isString(v) { return typeof v == "string" }
function isDOM(v) { return v && typeof v == "object" && v.nodeType && v.nodeName }
function Capitalize(a) { a=String(a);return a.slice(0,1).toUpperCase( ) + a.slice(1) }


//  showObj -> array of lines
function showObj( o, key, keep, drop, ret, level ) {
	key    || (key   = "no-name");
	level  || (level = 0);
	ret    || (ret   = [ ]);
	keep   || (keep  = /^/);		// matches all
	drop   || (drop  = /$^none/);	// matches none
	var indent    = repeat( "  ", level),
	    indentKey = indent + rpad(key+":",5);
	return isATOM(o) ? fmtATOM(o) : fmtOBJ(o);

	function fmtOBJ (o) {	
		EMIT( indentKey + ((o instanceof Array) ? "[" : "{") );
		Pairs( o, function ea( tag, child,ix ) {
			//console.log(CFN,tag,child,ix);
			if ( keep.test( tag ) && !drop.test( tag ) )
				showObj( child, tag, keep, drop, ret, level+1 )
		});
		return EMIT( indent + ((o instanceof Array) ? "]" : "}") );
	}
	function fmtATOM(o) { return EMIT( indentKey +" "+ peek( o, 30) ) }
	function EMIT(s)   	{ ret.push(s); return ret }
	function isATOM(o) 	{ return !isOBJ(o) }
	function isOBJ(o)  	{ return (o && typeof o == "object") }
	function rpad(s,n) 	{ while ( s.length < n ) s += " "; return s }
}

//console.log( showObj({foo:1,bar:"yes",ooh:{recursive:"yeah",deepArray:[1,2],}, no:false},"test").join("\n") );
function Product(a,b,c,split) {
	split = split || /[,| ]+/;
	var ret = [ ];
	a || (a = ""); b || (b = ""); c || (c = "");
	a = (a instanceof Array) ? a : a.split( split );
	b = (b instanceof Array) ? b : b.split( split );
	c = (c instanceof Array) ? c : c.split( split );

	for (var i = 0; i < a.length; i++) {
		for (var j = 0; j < b.length; j++) {
			for (var k = 0; k < c.length; k++) {
				ret.push( a[i] + b[j] + c[k] );
			}
		}
	}
	return ret;
}


/*
Object.prototype.BINDALL =  ((

	function bindAll( self ) {
		self = self || this;
		var obj = this;
		Pairs( obj, function doBind(key,fun) {
			if ( typeof fun == "function" )
				obj[ key ] = fun.bind( self );
		});
		return obj
	}
));
*/


//alert( Product( "pre","mid","post" ) );

//alert("end each");
