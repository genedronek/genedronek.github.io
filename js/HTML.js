
//  I like to extend the DOM HTML element API to include a few array methods
//  -- but actually i do not like object.iterator, it seems seems inverted
NodeList.prototype.forEach = Array.prototype.forEach;
NodeList.prototype.indexOf = Array.prototype.indexOf;



	//  returns number or string, depending if starts like a number
	//  auto => 0 as special case
	//  ele.effStyle( )    ==> ele.style obj
	//  ele.effStyle(name) ==> parseFloat( ele.style.name ) || ele.style.name

	//  maybe should be numStyle
	Element.prototype
		.effStyle	= function effStyle( name )
					{
						var ele = this;
						var style = window.getComputedStyle( ele );
						if ( arguments.length == 0 ) return style;

						var str = style[ name ];
						if ( typeof name == "undefined" || typeof str == "undefined" ) 	return;
						var num = parseFloat( str );
						if ( str == "auto" ) 				return 0;
						//  prefer number return over string
						if ( str.match( /^[\d+-\.]+px$/ ) ) return num;
						return isNaN(num) ? str : num;
					}
	Element.prototype
		.effLength	= function effLength( name )
					{
						var ele = this;
						var style = window.getComputedStyle( ele );
						if ( arguments.length == 0 ) return style;
						console.log(CFN,name,this);

						//  prefer number return over string
						var str = style[ name ],
							num = parseFloat( str );
						if ( str == "auto" ) return 0;
						if ( str.match( /%/ ) ) alert("effLength: % in " + str + " " + name);
						return isNaN(num) ? str : num;
					}

					//  deprecating
	Element.prototype.getEff = Element.prototype.effStyle;



	Element.prototype
		//  		getter of rect bounds 
		//			bottom/top,left/right,height/width
		.getBBox	= function getBBox( ele )
					{
						ele = ele || this;
						var ret = ele.getBoundingClientRect();
						return ret;
					}
function getBBox( ele ) { console.log(CFN,ele, bySel(ele) ); return bySel(ele||document.documentElement).getBoundingClientRect( ) }
function getPos2( ele ) {
			console.log(CFN,ele, bySel(ele) );
			var ret = bySel(ele||document.documentElement).getBoundingClientRect( )
			return [ ret.left, ret.top ]
			}
function getSize2( ele ) {
			console.log(CFN,ele, bySel(ele) );
			var ret = bySel(ele||document.documentElement).getBoundingClientRect( )
			return [ ret.right - ret.left, ret.bottom - ret.top ]
			}


	Element.prototype

		//  		getter of node's (sibling-order) index
		//			can specify node of same type
		.childIx  =	function getIndex( type )
					{
						var parent = this.parentNode;
						if ( parent ) {
							var sib, siblings = parent.childNodes, like = -1;
							for (var i=0; sib = siblings[i]; i++) {
								if ( !type || sib.nodeName == type )
									like++;
								if ( sib == this )
									return like;
							}
						}
						return -1;
					};



	Element.prototype

		//  		getter of node's markup attrs
		//			returns mixed string and number type (not string) values if value looks like number
		//			returns only string values if raw=true
		.getOpts  = function getOpts(raw)
					{
						var opts = { };
						Each( this.attributes, function (attr,i) {
							var val = attr.value,
								num = parseFloat( val );
							opts[ attr.name ] = ( val.match( /^[--.0-9]+$/ )&&!raw ? num : val);
							//console.log(["getOpts", !raw, opts[attr.name],val,  val.match( /^[-+.0-9]+$/ )]);
						});
						return opts;
					};

//  returns attr strings and numeric values
//  returns all strings if raw is true
function getNodeAttrs( ele, raw ) {
	var opts = { };
		var list = ele.attributes,
			n = list.length;
		for (var i = 0; i < n; i++) {
			var attr = list[ i ];
			var val = attr.value,
				num = parseFloat( val );
			//  convert number string to number
			opts[ attr.name ] = ( val.match( /^[--.0-9]+$/ ) && !raw )
									? num
									: val;
			//console.log(["getOpts", !raw, opts[attr.name],val,  val.match( /^[-+.0-9]+$/ )]);
		};
		return opts;
};


	Element.prototype.removeNode = Element.prototype
		.detach   = function removeNode( ele )
					{
						ele  = bySel( ele || this );
						ele && ele.parentNode && ele.parentNode.removeChild( ele );
						return ele;
					}



	// appends to parent.  if 2d argument passed(and not false), 
	// uses insertBefore instead
	Element.prototype

		.appendTo = function appendTo( parent, ref )
					{
						//console.log( "appendTo", parent, ref );
						parent = bySel( parent );
						if ( arguments.length == 2 && ref !== false )
							parent.insertBefore( this, bySel( ref ) );
						else
							parent.appendChild( this );
						return this;
					};


	Element.prototype

		.prependTo = function prependTo( parent, ref )
					{
						parent = bySel( parent );
						ref = bySel( ref ) || parent.firstChild;
						parent.insertBefore( this, ref );
						return this;
					};


	Element.prototype

		.sizeTo = function resizeTo( w, h )  
					{
						this.style.width = px(w);
						this.style.height = px(h);
						return this;
					};

	//  why is this here?
	if (0 && !HTMLElement.prototype.matchesSelector) {
        HTMLElement.prototype.matchesSelector = function(selector) {
			try {
				//console.log(["matchesSelector this",this, selector, this.webkitMatchesSelector, HTMLElement.prototype]);
				var hp = HTMLElement.prototype,
					whp = hp.webkitMatchesSelector,
					mhp = hp.modMatchesSelector,
					thp = this.webkitMatchesSelector;
				console.log(["proto", hp,whp,mhp,thp]);
                if (whp) {
						console.log(["whp",whp,this.webkitMatchesSelector]);
                        //return HTMLElement.prototype.webkitMatchesSelector.call(this,selector);
                        return whp.call(this,selector);
                } else if (mhp) {
                        return this.mozMatchesSelector(selector);
                }
                var possibles = this.parentNode.querySelectorAll(selector);
                for (var i = 0; i < possibles.length; i++) {
                        if (possibles[i] === this) {
                                return true;
                        }
                }
                return false;
			} catch (ex) { /*alert( ex )*/ }
        };
	}

	Element.prototype .moveBy =

		function moveBy( x, y, dt, cb )    {
			var a = arguments, a = ( a[0] instanceof Array ? a[0] : a );
			function ms(s) { if (typeof s == "number" ) s += "ms"; return s;}
			if ( this.effStyle("position") == "static" )
				this.style.position = "relative";

			if ( dt ) {
				//console.log(["dt",dt,this.style.webkitTransition]);
				this.style.webkitTransitionProperty = "left,top";
				this.style.webkitTransitionDuration = ms( dt );
				this.transitionCount = this.style.webkitTransitionProperty.split(",").length;
				this.addEventListener( "webkitTransitionEnd", 
										function (e) { 
											var target = e.target;
											//console.log(["tend",e,e.type,target.transitionCount ]);
											if ( --target.transitionCount < 1 ) {
												// done
												if ( cb )
													cb.call( target, e )
											}
										},
										false );
			}
			var left = parseFloat(this.computedStyle.left),
			    top = parseFloat(this.computedStyle.left);
			this.style.left = (left + a[0]) + "px";
			this.style.top  = (top  + a[1]) + "px";
			console.log(["moveBy=>", this.style.left, this.style.top, a[0], a[1],dt,peek(cb) ]);
			return this;
		};

	Element.prototype

		//.moveTo = function moveTo( w, h, dt, cb )    {
		.moveTo = function moveTo( w, h )    {
						var a = arguments, a = ( a[0] instanceof Array ? a[0] : a );
						w = a[0]; h = a[1];
						//console.log( "moveTTo", w, h );

						function ms(s) { if (typeof s == "number" ) s += "ms"; return s;}

						if ( this.effStyle("position") == "static" )
							this.style.position = "relative";

						this.style.left = px( a[0] );
						this.style.top  = px( a[1] );
						//console.log("moveTo=>", this.style.left, this.style.top, w,h);
						return this;
					};

	Element.prototype

		.inlineStyle  = function inlineStyle( obj )
					{
						if ( !obj )
							throw "undefined ele";

						//  shallow COPY style properties
						for (var name in obj) {
							if ( !obj.hasOwnProperty(name) ) continue;
							var val = obj[ name ];
							// perhaps add px to bare number
							if ( typeof val == "number" && !this.cssNumber[name] && val !== 0 ) {
								// console.log(["inlineStyle",name,obj]);
								val += "px";
							}
							this.style[ name ] = val;
							//console.log(CFN, this.style[ name ] );
						}
						return this;
					}


Element.prototype.cssText =
Element.prototype.styleText =
Element.prototype.textStyle = function textStyle( obj ) {
								if ( !obj || typeof obj != "object" )
									throw "undefined ele";
								//console.log( CFN, obj );

								//  shallow COPY style properties
								var list = [ ];
								for (var name in obj) {
									if ( !obj.hasOwnProperty(name) ) continue;
									var val = obj[ name ];
									// perhaps add px to bare number
									if ( typeof val == "number" && !this.cssNumber[name] && val !== 0 ) {
										// console.log(["inlineStyle",name,obj]);
										val += "px";
									}
									list.push( camelToHyphen(name) + ":" + val + ";" );
									//this.style[ name ] = val;
								}
								this.style.cssText = list.join('');
								//console.log(["textStyle=>", this.style.cssText, list ]);
								return this;
							}


	Element.prototype

		// Exclude the following css properties to add px
		.cssNumber = {
						"fillOpacity": true,
						"fontWeight": true,
						"lineHeight": true,
						"opacity": true,
						"orphans": true,
						"widows": true,
						"zIndex": true,
						"zoom": true
					},


	Element.prototype

		.inlineAttrs  = function inlineProps( key, val )
					{
						//  handle (key,val,...) pairs signature
						if ( typeof key == "string" ) {
							var a = COPY( arguments );
							while ( a.length > 0 ) {
								key = a.shift( ), val = a.shift( );
								this[ key ] = val;
							}
							return this;
						}
						//  handle (obj) signature
						var obj = key;
						for (var key in obj) {
							if ( !obj.hasOwnProperty( key ) ) continue;
							this[ key ] = obj[ key ];
						}
						return this;
					}
	Element.prototype.inlineProps = Element.prototype.inlineAttrs;


	Element.prototype

		//  inlineEvents( obj, usecapture, ... )
		//  inlineEvents( event, func, usecapture, ... )
		//  usecapture - optional boolean becomes usecapture
		//
		.inlineEvents = function inlineEvents( event, func, usecapture )
					{
						//console.log(CFN,this,event,func,usecapture);
						var ele = this;
						var a = COPY(arguments), list = [ ], a0;
						//  parse arguments into list
						while ( a0 = a.shift() ) {
							if ( typeof a0 == "string"  ) { list.push([ a0, a.shift() ]) }
							if ( typeof a0 == "boolean" ) { usecapture = a0 }
							if ( typeof a0 == "object"  ) { list.concat( Pairs( a0 ) ) }
						}
						var triples = MAP( list, function (item) {
										return [ item[0] , item[1] , usecapture || false ] });

						Each( triples, function attach( triple, ix ) {
							if ( triple && triple.length == 3 ) {
								ele.addEventListener( 	triple[0].replace(/^on/i,""),
														triple[1],
														triple[2]
													);
							}
						});
						return this;
					}


	Element.prototype

		.inlineHTML = function ( s )
					{
						this.innerHTML  = s;
						return this;
					}


//  TODO turn into extension

function evalPath( path, ctx ) {
	ctx = ctx || document;
	var components = path.match(/([^!.]*)([!.]|$)/g);
	console.log(["eval Path components",components]);

	//  iterate over lookups
	var base = ctx;
	for (var i = 0; components.length && base; i++) {
		var comp = components.shift();
			//  parse name and suffix
			parse = comp.match(/([^!.]*)([!.]|$)/),
			name = parse[ 1 ],
			suffix = parse[ 2 ];
		console.log(["step",i,name,suffix]);

		//  lookup name per suffix
		if ( suffix == "!" && name != "" )
			base = base.querySelector( name );
		if ( suffix == "." && name != "" || suffix == "" && name != "" )
			base = base[ name ];

		//  early exit if lookup undefined
		if ( !base ) {
			console.log(["Path component lookup failed",i, comp, path]);
			return { };		// empty but extant
		}
	}
	console.log(["Path=>", base, path]);
	return base;
}


	Element.prototype
		.webkitPageToNode = function ( x , y ) { return webkitPageToNode(this,x,y) };

	Element.prototype
		.webkitNodeToPage = function ( x , y ) { return webkitNodeToPage(this,x,y) };

function webkitNodeToPage( ele, x, y)
{
	var pt = new WebKitPoint(x,y);
	var ret = window.webkitConvertPointFromNodeToPage( this, pt );
	//console.log(["nodePoint->pagePoint", pt, ret, ret.x, ret.y ]);
	return [ ret.x, ret.y ];
}
window.webkitNodeToPage = webkitNodeToPage;

function webkitPageToNode( ele, x, y )
{
	var pt = new WebKitPoint(x,y);
	var ret = window.webkitConvertPointFromPageToNode( ele, pt );
	//console.log(["webkitPageToPoint",ele, ele.id, x,y,"=>", ret.x, ret.y ]);
	return [ ret.x, ret.y ];
}
window.webkitPageToNode = webkitPageToNode;


	Element.prototype
		.transform = function (s,duration,ease,done)
						{
							ease = ease || "ease";
							this.style.webkitTransform = s;
							if ( duration ) {
								this.removeEventListener( "webkitTransitionEnd", this._wte, false );
								this.addEventListener( "webkitTransitionEnd", (this._wte = transformEnd), false );
								this.style.webkitTransition = "-webkit-transform" + " " + ms(duration) + " " + ease;
							}
							function transformEnd(e) {
								this.removeEventListener( "webkitTransitionEnd", this._wte, false );
								this.style.webkitTransition = "";
								if ( done ) done(e);
							}
							function ms(x) { if ( typeof x == "number" ) x = x + "ms"; return x }
						}



//  ele.replaceBy(new) - replaces node ele by node new, returns new;
	Element.prototype

		.replaceBy = function replaceBy(ele) 
						{
							var p = this.parentNode;
							if ( !p ) return this;
							// insert new(ele) before existing(this)
							p.insertBefore( ele, this );
							p.removeChild( this );
							return ele;
						}


	Element.prototype

		.select = function select( s ) 
						{
							// thunk string selector into node if not already
							return s.nodeName ? s : this.querySelector( s );
						}
function select(s,ele) {
	try {
		//console.log(["select",s,ele]);
		var ret = (ele||document).querySelector(s);
	}
	catch (ex) {
		alert( "select "+ s + " " + ex + traceback() );
	}
	return ret;
}
var Select = select;

	Element.prototype

		.selectAll = function select( s ) 
						{
							// thunk string selector into node if not already
							return typeof s != "string" ? s : this.querySelectorAll( s );
						}
function selectAll(s,ele) { return (ele||document).querySelectorAll(s) }

	Element.prototype
		.empty = function empty( )
						{
							//while (this.firstChild) {
								//this.removeChild( this.firstChild );
							//}
							this.innerHTML = '';
							return this;
						}

	Element.prototype
		.offset = function offset(x,y) {
							return getOffset( this,x,y ) 
						}

//  http://www.quirksmode.org/js/findpos.html
function getOffset( ele, ox, oy) {

	console.log(["getOffset", ele]);

	ox = isNaN( ox ) ? 0 : ox;
	oy = isNaN( oy ) ? 0 : oy;
	//  if not dom ele, quietly return 0,0
	if ( !ele || !ele.nodeType )
		return [0,0];

	var curleft = ox,
		curtop  = oy;
	if ( ele.offsetParent ) {
		do {
				curleft += ele.offsetLeft;
				curtop  += ele.offsetTop ;
		}  while  ( ele  = ele.offsetParent );
		console.log(["getOffset=>", curleft, curtop ]);
	}
	return [ curleft, curtop ];
}


//  replace webkitPageToNode
//  convert page-relativeXY to node-relativeXY
function genericPageToNode(ele,x,y) {
	var ulc = getPageOffset( ele );
	var ret = [ x - ulc[0], y - ulc[1] ];
	//console.log(["genericPageToNode",ele,x,y,"=>", ret.join(' ')]);
	//var wret = webkitPageToNode(ele,x,y);
	//console.log(["webkitPageToNode",ele,x,y,"=>", ret.join(' '), wret.join(' ')]);
	return ret;
}


//  return effective styles object ( no arg )
//  lookup single effective style arg= "name"
//  return object of list of styles if arg= blank separated list ("name name name...")
function getStyle(el,arg) {

	list = (arg||"").split( /\s+/ );
	//console.log(["getStyle",el,arg,list]);

	//  el = element or query
	var x = ( typeof el == "string" )
				? document.querySelector( el )
				: el;

	//  get document
	var doc = x.ownerDocument;

	//  get effective style object
	var y = ( x.currentStyle )
				? x.currentStyle
				: doc.defaultView.getComputedStyle(x,null);

	//  if no arg => return style object
	if ( !arg ) return y;

	//  if singluar arg => return string
	if ( list.length == 1 ) return y[ list[0] ];

	//  if space separated list => compose return object
	var ret = { };
	for (var i=0, prop; prop = list[i]; i++) {
		if ( y.hasOwnProperty( prop ) )
			ret[ prop ] = y[ prop ];
	}
	console.log(["getStyle=>", ret]);
	return ret;
}

//  return styles object given el and space-separated list 
//  el can be element or selector string
function getStyles(el,arg) {

	list = (arg||"").split( /\s+/ );
	//console.log(["getStyle",el,arg,list]);

	//  el = element or query
	//console.log( "gbysel", bySel( el ) );
	var x = bySel( el );

	//  get document
	var doc = x.ownerDocument,
		win = doc.defaultView;

	//  get effective style object
	var y = ( x.currentStyle )
				? x.currentStyle		//  IE hack
				: win.getComputedStyle(x,null);
	//console.log(["getStyles", x, y, doc, y['left'], y['top'], x.style.left, x.offsetLeft]);

	//  if 1 arg, return raw style object
	if ( arguments.length == 1 ) return y;

	var ret = { };
	for (var i=0, prop; prop = list[i]; i++) {
		if ( y.hasOwnProperty( prop ) )
			ret[ prop ] = y[ prop ];
	}
	return ret;
}

HTMLElement.prototype.getStyles = function (s) { 
	var ret =  arguments.length ? getStyles( this, s ) : getStyles( this );
	//console.log(["prototype getStyles =>", ret ]);
	return ret
}


//   ele.style.X effective <-> ele.computedStyle.X
HTMLElement.prototype.__defineGetter__( 'computedStyle',  function getComputedStyle( ) {
		return ret = window.getComputedStyle( this, null); 
});

//  de-structure subtree by descriptor object
//  iterate over keys, do root.querySelector( descrOBJ[key] ) 
//  return each query via returnOBJ[key] 
//  in the provided return struct object
//  chainable.
//  efd  12/2013

HTMLElement.prototype.destruct = 
HTMLElement.prototype.unstruct = 

function unstruct( retObj, descrObj, allFlag ) {
	var root;
	//  provide defaults
	root     || (root     = this);
	descrObj || (descrObj = { });
	retObj   || (retObj   = { });
	allFlag  || (allFlag  = false);
	if ( !isDOM( root ) ) { throw "root not DOM"; return }

	for ( var key in descrObj ) {
		var sel = descrObj[ key ];
		//console.log( CFN, key, sel, retObj, descrObj );
		retObj[ key ] = ( ( allFlag == true )
							? root.querySelectorAll( sel )
							: root.querySelector   ( sel ) );
	}
	//console.log(CFN,"==>",retObj);

	return this;	//  chain gang bangable
}



// remove whitespace-only nodes

HTMLElement.prototype.clean =

	function clean( nodeType, keep, drop ) {

		nodeType = nodeType || 3,	// text
		keep = keep || /^/,			// all
		drop = drop || /$^/,		// none
		node = this,				// start recursion
		level = 0,
		cnt = 0;				
		var ret = cleaner( this, level );
		console.log(CFN,"==>", cnt, ret.nodeName, ret);
		return this;

		function cleaner( node, level ) {
			if ( node && node.childNodes ) {
				for (var i=0,child; child = node.childNodes[i]; i++) {
					//console.log(CFN,level,i,child.nodeName,child.nodeType,peek(child.nodeValue), ( !/\S/.test(child.nodeValue) ) );
					if ( child.nodeType == nodeType /* text */)
						//  pattern = first non-blank char
						if ( !/\S/m.test(child.nodeValue) )
							node.removeChild(child), --i, ++cnt;
					//  to curse or recurse, that is the question
					if ( child.nodeType == 1 /* element */)
						cleaner( child, level+1 );
				}
			}
			return node;
		}
}

function replaceFirstNumber( sel, n) {
	//  replaceFirstNumber( sel, n )
	//  carefully search selected element innerText and replace first number found.
	//      +-ddd.ddd  
	//   {{ +-ddd.ddd }}		handlebars notation
	//  returns true if element selected and element was updated
	sel = bySel( sel );
	if ( sel && sel.nodeType ) {
		var patt = /([{][{]\s*)*([+-]?[0-9.][0-9.]*[0-9]*)(\s*[}][}])*/; 
		sel.innerText = sel.innerText.replace( patt, n );
		return true;
	}
	//console.log(["replaceFirstNumber", sel, n, sel && sel.innerText ]);
}


//  ele.innerSize()
//  innerSize( ele )
function innerSize( ele ) {
	//  is this function call or method?
	ele = (arguments.length == 1 ? bySel( ele ) : this);
	if ( ele ) {
		return [ ele.offsetWidth, ele.offsetHeight ];
	}
}


function getDocumentHeight() {
    var D = document;
	console.log( 
        Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
        Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
        Math.max(D.body.clientHeight, D.documentElement.clientHeight) );
    return Math.max(
        Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
        Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
        Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    );
}

if ( window.Node && Node.prototype && !Node.prototype.contains) {
	Node.prototype.contains = 	
			function contains_shim(arg) {
				return !!(this.compareDocumentPosition( bySel(arg) ) & 16)
			}
}

//  camelCaseName -> camel-case-name
function camelToHyphen(name) {	
	var ret = name.replace(   /([A-Z])/g,  function (all,letter) { 
							return "-" + letter.toLowerCase() })
					.replace( /^webkit/, "-webkit" ); 
	return ret;
}

//  create magical lazy uid property in every element
//  that appears when you first reference it.
HTMLElement.prototype.__defineGetter__(
	"uid", 
	function uidGetter( ) {
		//console.log(CFN,this.nodeName)

		//  trick chain to prevent recursion
		var tmp = Object.getPrototypeOf( this );
		Object.setPrototypeOf( this, Object.prototype );
		//  set into node object
		if ( this instanceof SVGElement ) console.log("SVG",this);
		this.uid = ++HTMLElement.prototype.UIDcnt;
		//  restore chain
		Object.setPrototypeOf( this, tmp );
		return this.uid;
	}
);
HTMLElement.prototype.UIDcnt = 0;
SVGElement.prototype.__defineGetter__(
	"uid", 
	function uidGetter( ) {
		//console.log(CFN,this.nodeName)

		//  trick chain to prevent recursion
		var tmp = Object.getPrototypeOf( this );
		Object.setPrototypeOf( this, Object.prototype );
		//  set into node object
		if ( this instanceof SVGElement ) console.log("SVG",this);
		this.uid = ++HTMLElement.prototype.UIDcnt;
		//  restore chain
		Object.setPrototypeOf( this, tmp );
		return this.uid;
	}
);
