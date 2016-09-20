//console.log("debug.js begin loading");
/*  debug survival kit  */

function Alert(s) { console.log(["Alert", traceback() + s]); alert( traceback() + s ); }

//  jquery pipline print length and comment.  need to load jquery before debug
if ( typeof window.$ != "undefined") {
	$.fn.tee = function (s) { console.log(["tee", (this.length || 0) + " elements", s||""]); return this; };
	//console.log( "$.fn.tee", $.fn.tee );
}

//  count number of nodes of type "sel"
function nodeCount(sel) { sel=sel||"*";return  bySelAll(sel).length }

function traceback(func) {

	func = func || traceback;
	arguments.callee.caller;
	var traces = [ ];

	//  up to 25 calls deep
	for (var i = 0; i < 25; i++) {
		if ( !func || typeof func != "function" )
			break;
		var str = func.toString().substr(0,40)
					.replace( /\s+/g, ' ')
					.replace( /\n/g, ' ');
		(i>0) && traces.push( str );
		func = func.arguments.callee.caller;
	}
	var ret = MAP( traces.reverse(), function (t,i) {
					return ( i + repeat('  ',1+i) + t );
				}),
		nl = "\n";
	return nl + ret.join(nl) + nl;
}

if ( !peek )
	var peek = function peek(s,n) { n = n || 33; return (s+"").substr(0,n); }
if ( !indent )
	var indent = function indent(k) { return repeat(' ',k); }

/*
function dumpObject(obj,name,level) {
	name  = name || "noname";
	if ( arguments.length < 3 ) {
		level = 0;
		dumpObject.seen = [ ];
		dumpObject.ret = [ ];
	}

	function emit(s) { dumpObject.ret.push( s ) }
	if ( typeof obj != "object" )
		return  indent(level) + name + "("+(typeof obj)+")"+ ":" + peek( object );
	
	Each( keys(obj), function (key) {
		var val = obj[ key ];
		emit( )
*/

//  getPrototypeChain() better named: consolePrototypeChain

function getPrototypeChain( obj, title, maxlen ) {
	title && console.log( '"'+ title +'"', obj );
	function keys(h) { var ret = Object.getOwnPropertyNames( h ).sort(); console.log("ret",ret);return ret; }

	var here = obj,			//obj.prototype or obj
		ret = [ ]
		;
	//  walk up chain to top and print methods found
	if ( here ) {

		for (var i = 0; i < 20 && here; i++) {
			console.log( i, 
						here, 
						Object.getOwnPropertyDescriptor(here),
						keys( here ).length, keys(here),
						typeOf(here),
						here.constructor  );

			var methods = keys( here ),
				type = ( methods && methods.length && methods[0][0] ==="(" )
							? methods.shift()
							: "";

			var funs = [ ], data = [ ];
			var funs = [ ], data = [ ];
			var funs = [ ], data = [ ];
			Each( methods, function dispatch( name ) {
				var descr = Object.getOwnPropertyDescriptor( here, name );
				//console.log("prop descr", name, descr );
				//if ( here.hasOwnProperty(name) ) console.log("hasownprop", name, typeof here, here);
				//else console.log("skipprop", name);
				try {
					if ( descr.get ) { data.push(name); return; }
					if ( typeof here[ name ] == "function" ) funs.push( name );
					if ( typeof here[ name ] != "function" ) data.push( name );
				} catch (ex) {
					console.log("poopoo", here, name );
					data.push( name );
				}
			});
			methods = data.concat( funs );

			if ( !type && here == top    && here != window ) type = "top window";
			if ( !type && here == parent && here != window ) type = "parent window";

			//  see if well known type or type.prototype
			if ( !type ) {
				var list = "Array Boolean Date Function Math Number Object RegExp Window Document".split(" ");
				while ( type = list.shift() ) {
					if ( here == eval( type ) ) break;				
					if ( here == eval( type += ".prototype" ) ) break;
				}
			}
			type = type || typeOf( here );
			ret.unshift({ i: i, type: type, methods: methods.join(" ") });

			//  onwards, upwards
 			here = Object.getPrototypeOf( here );
			//  if you want to suppress boring object.proto
			//if ( here == Object.prototype ) break;

		}

		Each( ret, function (entry,i) {
			console.log( rpad( lpad(i,2) + repeat(' ',2*i) +  
								(i>0 ? " ↑ " : "   ") + entry.type, 40) + 
						peek(entry.methods,maxlen||66) );
		});
	}
		return  ret;
}


function getKeys( obj ) {

	if ( Object.getOwnPrototypeNames ) {
		var descrs = Object.getOwnPrototypeNames( obj );
		console.log( "descrs", MAP( descrs, function (d) { return d }) );
		return descrs;
	}
	return keys( obj );
}

//  supply overridable default
window.Status || (window.Status = function ( ) { });


//getPrototypeChain( window );
//  create simple status line
function Status(s) {
	if ( !Status.line ) {
		//  add status-box and Status.line to html node
		var box = document.documentElement.appendChild(
					document.createElement('status-box'));
		box.innerHTML = `

			<div id= status-line
						title="     jsGenie™ events monitor\nshows event type, node, and name" ></div>
			<style>
				status-box			{ width: 0; height: 100%; z-index: 1000000; }
				status-box			{ display: block; position: absolute; }
				{{  fix StatusBox to bottom of status-box }}
				 #status-line		{ position:fixed; left:9px; bottom:36px; z-index: 1000; }
				 #status-line		{ color: green; font: 20px arial; opacity:.8; }
				 #status-line		{ background: rgba(0,255,0,.2); padding: .2em; }
				 #status-line		{ height:2em; }
				 #status-line		{ -webkit-border-radius: 2px; border: 2px solid rgba(0,255,0,.3); }
				 #dumb-button		{ position: fixed; left: 19px; bottom: 16px; z-index: 1000; }
				 #dumb-button		{ color: green; font: 20px arial; opacity: .8; }
				 #dumb-button		{ background: rgba(255,200,0,.1); padding: .2em; }
				 #dumb-button		{ height:1em; cursor:pointer; }
			</style>
		`
		Status.line = box.querySelector( "#status-line" );
		console.log( "status create",box, Status.line );
	}
	Status.line.innerHTML = s;
}

//window.addEventListener( "unload", function (e) { alert('unloading') }, true);


var globalEventCount = 0;

//  add debug listeners to window
function  addWindowListeners( keep, drop ) {


	//console.log("addWindowListeners()");
	//  window special case requires getOwnPropertyNames to get consistent results
	function keys(h) { return Object.getOwnPropertyNames( h ).sort() }
	//function keys(h) { var ret=[]; for(var k in h) if ( h.hasOwnProperty(k) ) ret.push(k); return ret; }
	keep = keep || /^on/;
	drop = drop || /$none/;

	//  extract list of desired events
	var keylist = grep( keys(document), /^on/),
		keylist = keylist.concat( grep( keys(window), /^on/) ),
		keylist = keylist.concat( MDN_Events_List ),
		keylist = MAP( keylist, ( key ) => key.replace( /^on/ ) ),
		seen = { };

	//  add listener per event listed
	EACH( keylist, function (key) {
		// capture phase!
		if ( !seen[ key ] )
			seen[ key ] = window.addEventListener( key, handleEvents, true ); 
	})
	var seenList = Pairs( seen, (k) => seen[k] );

	function handleEvents(e) {
		++globalEventCount;
		//console.log( CFN, e.type, e);
		tallyEvents( e );
		var t = [ 	
					globalEventCount,
					//formatEventPhase( e ),
					formatWhich( e ),
					formatEventType( e ), 
					formatCh( e ),
					formatTarget( e ),
					formatID( e ),
					formatClass( e ),
				].join(" ");

		//console.log(t);
		Status( t );
	}

	function formatEventType( e ) { return (e.type||"").replace(/xmouse/,"") }
	function formatEventPhase( e ) {
		var p = e.eventPhase;
		if ( p == 1 ) return "capture";
		if ( p == 2 ) return "nodeless";	// at node? ie window
		if ( p == 3 ) return "bubble";
		return ""
	}
	function formatTarget( e ) { return (e.target && e.target.nodeName) || "window" }
	function formatCh(e) { var w = e.which; return w ? (w+" "+String.fromCharCode(w)) : "" }
	function formatWhich(e) { 
		var w = e.which;
		if ( w == 1 ) return "left-button";
		if ( w == 2 ) return "middle-button";
		if ( w == 3 ) return "right-button";
	}
	function formatID( e ) {
		var id = (e.target && e.target.id) || "";
		return id ? ("#"+id ) : id;
	}
	function formatClass( e ) {
		//var value = e.target.className;
		var target = isNode( e.target );
		if ( !target || !target.getAttribute || !target.getAttributeNS ) return "";
		var value = target.getAttribute( "class" ) || target.getAttributeNS(null,"class");
		if ( !value ) return "";
		var list = value.split(" ");
		return (( list.length > 0 ) ? "." : "" ) + list.join(".");
	}
	function isNode(x) { return ( x && x.nodeType && x.nodeName ) ? x : null }
}

//  listen for all onxxxxxx events.
addWindowListeners(/^on/,/devicemotion|fartgas/);


function checkForDupIds( document ) {
	document = document || window.document;
	var ids = Pluck( document.documentElement.querySelectorAll( "[id]" ), "id"),
		map = { },
		dups = [ ];
	Each( ids, function (id) { 
			if ( id && map[id] ) dups.push(id),console.log("warning: duplicated id ", id);
			map[id] = 1;
			});
	if ( dups.length )
		console.log( "scan for duplicate ids: ", dups.length, "found" );
	return dups.length;
}

//  exhaustive testing
window.addEventListener( "load", function ( ) { checkForDupIds( document ) }, false);

GlobalEventCounts = { };

//  Keep running events tally in hash
function tallyEvents(e) {
	var type = e && (typeof e == 'object') && e.type;
	var hash = GlobalEventCounts;
	hash[ type ] = hash[ type ] ? ++hash[ type ] : 1;
	return hash;
}

function  ShowEventCounts( ) {
	console.log( PAIRS( GlobalEventCounts, (name,cnt) => name +": "+ cnt + "  ").sort() )
}

/*
function  grep(a,keep,drop) {
	a = (a instanceof Array) ? a : [ a ];
	keep = keep || /^/;			//  default always
	drop = drop || /huh$^/;		//  default never
	var r = [ ],
		n = a.length;
	console.log(CFN,a,keep,drop,n);
	
	//  otherwise assume RegExp
	for (var i = 0; i < n; i++) {
		var x = a[ i ];
		if ( keep.test( x ) && !drop.test( x ) )
			r.push( x );
	}
	console.log(CFN,"==>",r);
	return r;
}
function Each(a,f) { return [a||[]].forEach( f||function (x) { return x } ) }

*/
console.log("debug.js end loading");
