
/* -------------------------------------------------------------------- */
/* 正则表达式集合                                                       */
/* -------------------------------------------------------------------- */
//\n\s*\r                               //匹配空白行
//<(\S*?)[^>]*>.*?</\1>|<.*? />         //匹配HTML标记
//[a-zA-z]+://[^\s]*                    //匹配网址URL
//[1-9][0-9]{4,}                        //匹配腾讯QQ号
//\d{15}|\d{18}                         //匹配身份证
//\d+\.\d+\.\d+\.\d+                    //匹配ip地址
//^[A-Za-z0-9]+$　　                    //匹配由数字和26个英文字母组成的字符串
//^\w+$　　                             //匹配由数字、26个英文字母或者下划线组成的字符串

var g_re_sidesblk = /^\s*|\s*$/;        //匹配首尾空白字符
var g_re_cnstr = /[\u4e00-\u9fa5]/;     //匹配中文字符
var g_re_dbbyte = /[^\x00-\xff]/;       //匹配双字节字符(包括汉字在内)
var g_re_enstr = /^[A-Za-z]+$/;         //匹配由26个英文字母组成的字符串
var g_re_upEnstr = /^[A-Z]+$/;          //匹配由26个英文字母的大写组成的字符串
var g_re_dnEnstr = /^[a-z]+$/;          //匹配由26个英文字母的小写组成的字符串
var g_re_phoneno = /\d{3}-\d{8}|\d{4}-\d{7}/;                       //匹配国内电话号码
var g_re_postcode = /[1-9]\d{5}(?!\d)/;                             //匹配中国邮政编码
var g_re_email = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;     //匹配Email地址

var g_re_upInt = /^[1-9]\d*$/;                                      //匹配正整数
var g_re_dnInt = /^-[1-9]\d*$/;                                     //匹配负整数
var g_re_int = /^-?[1-9]\d*$/;                                      //匹配整数+
var g_re_upFloat = /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$/;                //匹配正浮点数
var g_re_dnFloat = /^-([1-9]\d*\.\d*|0\.\d*[1-9]\d*)$/;             //匹配负浮点数
var g_re_float = /^-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)$/;     //匹配浮点数+

var g_re_date = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/;                    //匹配日期类型是否为YYYY-MM-DD hh:mm:ss格式的类型 
var g_re_time = /^((20|21|22|23|[0-1]\d)\:[0-5][0-9])(\:[0-5][0-9])?$/;     //匹配时间类型为hh:mm:ss格式的类型   
var g_re_ip = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;                               //匹配ip地址
var g_re_account = /^[a-zA-Z][a-zA-Z0-9_]{1,15}$/;                          //匹配帐号是否合法(字母开头，允许2-16字节，允许字母数字下划线)+

/* -------------------------------------------------------------------- */
/* 浏览器兼容相关                                                       */
/* -------------------------------------------------------------------- */
if(typeof(HTMLElement)!="undefined" && !window.opera) { 
    HTMLElement.prototype.__defineGetter__("outerHTML",function() { var a=this.attributes, str="<"+this.tagName;for(var i=0;i<a.length;i++) if(a[i].specified) str+=" "+a[i].name+'="'+a[i].value+'"'; if(!this.canHaveChildren) return str+" />"; return str+">"+this.innerHTML+"</"+this.tagName+">"; }); 
    HTMLElement.prototype.__defineSetter__("outerHTML",function(s) { var r = this.ownerDocument.createRange(); r.setStartBefore(this); var df = r.createContextualFragment(s); this.parentNode.replaceChild(df, this); return s; }); 
    HTMLElement.prototype.__defineGetter__("canHaveChildren",function() { return !/^(area|base|basefont|col|frame|hr|img|br|input|isindex|link|meta|param)$/.test(this.tagName.toLowerCase()); }); 
} 

/* -------------------------------------------------------------------- */
/* about valid (return true or false)                                   */
/* -------------------------------------------------------------------- */
function asUndefined(obj)   { return typeof(obj)=="undefined"; }
function asNull(obj)        { return obj==null; }
function asValidVal(obj)    { return !asUndefined(obj) && !asNull(obj); }
function asObj(obj)         { return Object.prototype.toString.call(obj) === '[object Object]'; }
function asStr(obj)         { return Object.prototype.toString.call(obj) === '[object String]'; }
function asNum(obj)         { return Object.prototype.toString.call(obj) === '[object Number]'; }
function asArr(obj)         { return Object.prototype.toString.call(obj) === '[object Array]'; }
function asReg(obj)         { return Object.prototype.toString.call(obj) === '[object RegExp]'; }
function asBool(obj)        { return Object.prototype.toString.call(obj) === '[object Boolean]'; }
function asDate(obj)        { return Object.prototype.toString.call(obj) === '[object Date]'; }
function asElem(obj)        { if (!obj) return false; return (typeof(obj) == "object" && typeof(obj.ownerDocument) != 'undefined'); }
function asDOM(obj)         { if (!obj) return false; return (typeof(obj) == 'object' && typeof(obj.parseError) != 'undefined'); }

/* -------------------------------------------------------------------- */
/* script type's prototypies                                            */
/* -------------------------------------------------------------------- */
String.prototype.trim       = function() { return this.replace(/(^\s*)|(\s*$)/g, ""); } 
String.prototype.ltrim      = function() { return this.replace(/(^\s*)/g, ""); } 
String.prototype.rtrim      = function() { return this.replace(/(\s*$)/g, ""); }
String.prototype.padLeft    = function(len, str) { var ret = this; if((""+str)=="") return ret; while(ret.length<len) { ret = str + ret; } return ret; }
String.prototype.padRight   = function(len, str) { var ret = this; if((""+str)=="") return ret; while(ret.length<len) { ret = ret + str; } return ret; }
String.prototype.format     = function() { var args = arguments; return this.replace(/\{(\d+)\}/g, function(m, i) { return args[i]; }); }
String.prototype.codeLength = function() { return this.replace(/[^\x00-\xff]/g,"**").length; }
String.prototype.htmlEncode = function() { var text = this; text = text.replace(/&/g, "&amp;"); text = text.replace(/"/g, "&quot;"); text = text.replace(/</g, "&lt;"); text = text.replace(/>/g, "&gt;"); text = text.replace(/'/g, "&#39;"); return text; }
String.prototype.htmlDecode = function() { var text = this; text = text.replace(/&amp;/g, "&"); text = text.replace(/&quot;/g, "\""); text = text.replace(/&lt;/g,  "<"); text = text.replace(/&gt;/g, ">"); text = text.replace(/&#39;/g, "'"); return text; }
String.prototype.replaceAll = function(oldstr, newstr) { raRegExp = new RegExp(oldstr, "g"); return this.replace(raRegExp, newstr); }
String.prototype.toDate     = function(format, arrSptrs) { format = format+""; if (!asArr(arrSptrs)) arrSptrs = ['-', ' ', ':']; var dateArr = this.toArray(arrSptrs); var fmtArr = format.toArray(arrSptrs); if (dateArr.length < fmtArr.length) return null; var y = 1970; var M = 1; var d = 1; var h = 0; var m = 0; var s = 0; var S = 0; for (var i = 0; i < fmtArr.length; i++) { switch (fmtArr[i].substr(0, 1)) { case "y": y = jx.getInt(dateArr[i], y); break; case "M": M = jx.getInt(dateArr[i], M); break; case "d": d = jx.getInt(dateArr[i], d); break; case "h": h = jx.getInt(dateArr[i], h); break; case "m": m = jx.getInt(dateArr[i], m); break; case "s": s = jx.getInt(dateArr[i], s); break; case "S": S = jx.getInt(dateArr[i], S); break; } } if (y < 100) y += 2000; return new Date(y, M - 1, d, h, m, s, S); } /* "09.01.01 12:01:01".toDate("yyyy.MM.dd hh:mm:ss", ['.',' ', ':'])  return null while failure */
String.prototype.toArr      = function() { var args = arguments; var thisStr = this; if (args.length < 1) args = ['']; else if (asArr(args[0])) args = args[0]; var sptr = args[0]; for (var i = 1; i < args.length; i++) { thisStr = thisStr.replaceAll(args[i], sptr); } return thisStr.split(sptr); }
String.prototype.validReg   = function(check) { if (!check.test(this)) { return false; } return true; }

Date.prototype.format       = function(format) { var o = { "M+": this.getMonth() + 1, "d+": this.getDate(),"h+": this.getHours(), "m+": this.getMinutes(),"s+": this.getSeconds(), "q+": Math.floor((this.getMonth() + 3) / 3), "S": this.getMilliseconds()}; if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length)); for (var k in o) if (new RegExp("(" + k + ")").test(format)) format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)); return format; }
Date.prototype.addYear      = function(val) { if(typeof(val) != "number") return this; return new Date(this.setFullYear(this.getFullYear() + val)); }
Date.prototype.addMonth     = function(val) { if(typeof(val) != "number") return this; var months = this.getFullYear() * 12 + this.getMonth() + val; var years = Math.floor(months / 12); months = months - (years * 12); var newLastDate = new Date(years, months, 0).getDate(); if(this.getDate() > newLastDate) return new Date(years, months, 0); return new Date(years, months, this.getDate()); }
Date.prototype.addDate      = function(val) { if(typeof(val) != "number") return this; var ms = this - new Date(0); var val = val * 24 * 60 * 60 * 1000; return new Date(ms + val); }
Date.prototype.getLastDate  = function() { return (new Date(this.getFullYear(), this.getMonth()+1, 0)).getDate(); }

Array.prototype.getValue    = function() { var arr = this; for (var i = 0; i < arguments.length; i++) { if (typeof (arguments[i]) == "number" && arr.length > arguments[i]) { arr = arr[arguments[i]]; } else { return null; }} return arr; }
Array.prototype.indexOf     = function(val) { var nTemp = -1; for (var i = 0; i < this.length; i++) { if (this[i] == val) nTemp = i; if (this[i] == val && typeof(this[i])==typeof(val)) return i;} return nTemp; }
Array.prototype.merge       = function(arr) { if(!asArr(arr)) return this; for(var i=0; i<arr.length; i++) { this.push(arr[i]); } }
Array.prototype.each        = function(func) { for(var i=0; i<this.length; i++) { func(this[i], i); } }
Array.prototype.tile        = function() { var ret = (arguments.length > 0) ? arguments[0] : []; for(var i=0; i<this.length; i++){if(asArr(this[i])) ret.merge(this[i].tile()); else ret.push(this[i]); } return ret; }

/* -------------------------------------------------------------------- */
/* Jx Framework                                                         */
/* -------------------------------------------------------------------- */
var jxFramework = function() {}
jxFramework.prototype = {
    getStr                  : function(src, defVal) { if(!asValidVal(src)) return defVal; return src+""; },
    getInt                  : function(src, defVal) { src=parseInt(src, 10); if(isNaN(src)) return defVal; return src; },
    getNum                  : function(src, defVal) { src=parseFloat(src); if(isNaN(src)) return defVal; return src; },
    getArr                  : function(src) { var ret=[]; if(asStr(src)) return [src]; if(asNull(src) || typeof(src)!="object") return ret; if(src.length) for(var i=0; i<src.length; i++) ret.push(src[i]); return ret; },
    getElem                 : function(elemId) { if (asElem(elemId)) return elemId; return document.getElementById(jx.getStr(elemId, null)); },
    getElems                : function(elemFlag) { var ret=[]; var args=jx.getArr(arguments).tile(); var arg=null; var flag=""; var elemId=""; for(var i=0; i<args.length; i++) { arg=args[i]; if(asElem(arg)) { ret.push(arg); continue; } arg=jx.getStr(args[i], ""); if(arg.length<2) continue; flag=arg.substr(0,1); switch(flag) {  case "#": ret.push(document.getElementById(arg.substr(1))); break; case ".": ret.merge(jx.getElemsByCls(arg.substr(1))); break; case "&": ret.merge(jx.getArr(document.getElementsByTagName(arg.substr(1)))); break; case "@": ret.merge(jx.getArr(document.getElementsByName(arg.substr(1)))); break; default : ret.merge(jx.getArr(document.getElementsByName(arg))); break; } } return ret; },
    getElemsByCls           : function(className, rootNode) { var ret = []; if (!asStr(className)) return ret; var elems = null; if (!rootNode) { elems = document.all; } else { elems = jx.getElem(rootNode); if (elems) elems = elems.all; } var len = elems.length; var pattern = new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)'); for (var i = 0; i < len; i++) { if (pattern.test(elems[i].className)) { ret.push(elems[i]); } } return ret; },
    
    getElemStyle            : function(elem, styleName) { elem = jx.getElem(elem); if(!elem || !styleName) return null; return eval("elem.style." + styleName); },
    getElemAttr             : function(elem, attrName) { elem = jx.getElem(elem); if(!elem || !attrName) return null; switch(attrName.toLowerCase()) { case "tagname": return elem.tagName; default: return elem.getAttribute(attrName); } },
    getInnerText            : function(elem) { elem = jx.getElem(elem); if(!elem) return null; if (elem.innerText) return elem.innerText; else if (elem.textContent) return elem.textContent; else return null; },
    getValue                : function(elem) { elem = jx.getElem(elem); if (!elem) return null; var ret = null; if (elem.tagName == 'INPUT') { if (elem.type == 'radio' || elem.type == 'checkbox') { if (elem.checked == true) ret = elem.value; } else { ret = elem.value; } } else if (elem.tagName == 'SELECT') ret = elem.value; else ret = jx.getInnerText(elem); return ret; },
    getSelectValues         : function(elem) { elem = jx.getElem(elem); if(!elem) return null; if(elem.multiple) { var ret = []; for(var i=0; i<elem.options.length; i++) { if(elem.options[i].selected) ret.push(elem.options[i].value); } return ret; } else { return [elem.value]; } },
    getSelectText           : function(elem) { elem = jx.getElem(elem); if(!elem) return null; if(elem.multiple) { var ret = []; for(var i=0; i<elem.options.length; i++) { if(elem.options[i].selected) ret.push(elem.options[i].text); } return ret; } else { return [elem.text]; } },
    getChecklistValues      : function(elems) { elems = jx.getElems(jx.getArr(arguments).tile()); var ret = []; for(var i=0; i<elems.length; i++) { if(elems[i].checked) ret.push(elems[i].value); } return ret; },
    getRadiolistValue       : function(elems) { elems = jx.getElems(jx.getArr(arguments).tile()); for(var i=0; i<elems.length; i++) { if(elems[i].checked) return elems[i].value; } return null; },
    getSelectValuesByText   : function(elem, text) { elem = jx.getElem(elem); if(!elem && elem.options) return []; var ret = []; for(var i=0; i<elem.options; i++) { if(elem.options[i].text == text) ret.push(elem.options[i].value); } return ret; },
    getElemUp               : function(byelem, attrName, lookVal) { byelem = jx.getElem(byelem); attrName = jx.getStr(attrName, null); if (!byelem) return null; if (!attrName) return byelem.parentNode;while (jx.getAttr(attrName) != lookVal && byelem.tagName!="BODY") { byelem = byelem.parentElement; } if(jx.getAttr(byelem, attrName) != lookVal) byelem = null;return byelem; },
    getElemsDown            : function(byelem, attrName, lookVal) { byelem = jx.getElem(byelem); var ret = []; if (!byelem) return ret; elems = byelem.getElementsByTagName("*"); attrName = jx.getStr(attrName, null); if (!attrName) return jx.getArr(elems);for (var i=0; i<elems.length-1; i++) if(jx.getElemAttr(elems[i], attrName) == lookVal) ret.push(elems[i]); return ret; },
    
    setElemStyle            : function(elem, styleName, val) { if(!elem || !styleName) return null; return eval("elem.style." + styleName + "='" + val + "'"); },
    setElemAttr             : function(elem, attrName, val) { if(!elem || !attrName) return null; return elem.setAttribute(attrName, val); },
    setValue                : function(elem, val) { elem = jx.getElem(elem); if (!elem) return; if (elem.tagName == 'INPUT') { if (elem.type == 'radio' || elem.type == 'checkbox') { if (elem.value == val) elem.checked = true; } else { elem.value = val; } } else if (elem.tagName == 'SELECT') { elem.value = val; } else { elem.innerHTML = val; } return; },
    setSelectValues         : function(elem, vals, isAddOnly) { elem = jx.getElem(elem); if(!elem) return null; if(elem.multiple) { if(!asArr(vals)) return; for(var i=0; i<elem.options.length; i++) { if(vals.indexOf(elem.options[i].value) > -1) elem.options[i].selected = true; else if(!isAddOnly) elem.options[i].selected = false; } } else { return elem.value = vals[0]; } },
    setChecklistValues      : function(elems, vals, bAddOnly) { elems = jx.getElems(jx.getArr(arguments).tile()); for(var i=0; i<elems.length; i++) { if(vals.indexOf(elems[i].value) > 0) elems[i].checked = true; else if(!bAddOnly) elems[i].checked = false; } },
    setRadiolistValue       : function(elems, vals) { elems = jx.getElems(jx.getArr(arguments).tile()); for(var i=0; i<elems.length; i++) { if(elems[i].value == val) { elems[i].checked = true; return; } } },
    addSelectItem           : function(elem, val, text, index, isSelected, noRepeatBy) { elem = jx.getElem(elem); if(!elem) return null; if(jx.getStr(noRepeatBy, "") == "value") for(var i=0; i<elem.options.length; i++) if(elem.options[i].value==val) return; if(jx.getStr(noRepeatBy, "") == "text") for(var i=0; i<elem.options.length; i++) if(elem.options[i].text==text) return; index = jx.getInt(index, elem.length); var option = new Option(val, text); elem.options.add(option, index); if(isSelected) option.selected = true; },
    selectCheckboxes        : function(ckbName, type) { elems = jx.getElems(ckbName); if (!elems) return; var checkType; type = jx.getStr(type, "0"); if (type == '1') checkType = true; else if (type == '0') checkType = false; else if (type == '2') checkType = 2; else checkType = (elems[0].checked) ? false : true; if (type == 2) { for (var i = 0; i < elems.length; i++) elems[i].checked = !elems[i].checked; } else { for (var i = 0; i < elems.length; i++) elems[i].checked = checkType; } return; },
    selectCheckboxesByCkb   : function(ckbName, elem) { elems = jx.getElems(elems); elem = jx.getElem(elem); if (!elems || !elem) return; if (elem.checked) SelectChecks(elems, 1); else SelectChecks(elems, 0); return; },

    getExprType             : function() { return ((window.navigator.userAgent.indexOf("Opera") >= 1) ? 3 : (window.navigator.userAgent.indexOf("Gecko") >= 1) ? 2 : ((window.navigator.userAgent.indexOf("MSIE") >= 1) ? 1 : 0)); },
    getCookie               : function(cookieName) { var aCookie = document.cookie.split("; "); for (var i = 0; i < aCookie.length; i++) { var aCrumb = aCookie[i].split("="); if (cookieName == aCrumb[0]) { if (aCrumb.length > 1) return aCrumb[1]; else return ""; } } return null; },
    setCookie               : function(cookieName, val) { var argv = jx.setCookie.arguments; var argc = jx.setCookie.arguments.length; var expires = (argc > 2) ? argv[2] : null; var path = (argc > 3) ? argv[3] : null; var domain = (argc > 4) ? argv[4] : null; var secure = (argc > 5) ? argv[5] : false; document.cookie = cookieName + "=" + val + ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) + ((path == null) ? "" : ("; path=" + path)) + ((domain == null) ? "" : ("; domain=" + domain)) + ((secure == true) ? "; secure" : ""); },
    getRd                   : function(n) { var ret = ""; n = jx.getInt(n, 1); n = (n < 1) ? 1 : n; for (var i = 0; i < n; i++) ret += Math.random().toString().split(".")[1]; return ret; },
    write                   : function(html) { document.write(html); },
    clip                    : function(text) { window.clipboardData.setData('text', text); },
    fav                     : function(text, url) { if (!text) text = document.title; if (!url) url = document.location.href; if (window.sidebar && "object" == typeof (window.sidebar) && "function" == typeof (window.sidebar.addPanel)) window.sidebar.addPanel(text, url, ""); else if (document.all && "object" == typeof (window.external)) window.external.addFavorite(url, text); }
}
var jx = new jxFramework();

/* -------------------------------------------------------------------- */
/* XMLHTTPRequest & XMLDOMDocument & XSLTemplate                        */
/* -------------------------------------------------------------------- */
var jxXML = function() {}
jxXML.prototype = {
    makeHttpRequest         : function() { return (window.ActiveXObject) ? new window.ActiveXObject("microsoft.xmlhttp") : new window.XMLHttpRequest(); },
    makeDOM                 : function() { var dom = (window.ActiveXObject) ? (new ActiveXObject("msxml2.DOMDocument.3.0")) : (document.implementation.createDocument("text/xml", "", null)); if (!dom) return null; dom.async = false; dom.validateOnParse = false; dom.resolveExternals = false; return dom; },
    loadDOMXmlStr           : function(xmlStr) { var dom = jxx.makeDOM(); dom.loadXML(xmlStr); return dom; },
    loadDOMXmlFile          : function(fileUrl) { var xmlhttp = MakeHttpRequest(); xmlhttp.open("GET", fileUrl, false); xmlhttp.send(null); return xmlhttp.responseXML; },
    
    getNodes                : function(xmlDoc, path) { if(!asDOM(xmlDoc)) return null; return xmlDoc.selectNodes(path); },
    getNode                 : function(xmlDoc, path) { if(!asDOM(xmlDoc)) return null; return xmlDoc.selectSingleNode(path); },
    addNode                 : function(xmlDoc, path, node, itemPos) { if(!asDOM(xmlDoc)) return false; var pnode = xmlDoc.selectSingleNode(path); if(!pnode) return false; if(!itemPos || itemPos<0) return pnode.appendChild(node); else return pnode.insertBefore(node, pnode.childNodes[itemPos]); },
    delNode                 : function(xmlDoc, path) { if(!asDOM(xmlDoc)) return false; try { var node = xmlDoc.selectSingleNode(path); node.parentNode.removeChild(node); return true; } catch(e) { return false; } },
    setNode                 : function(node, oldNode) { if(!node || !oldNode) return false; try { oldNode.parentNode.insertBefore(node, oldNode); oldNode.parentNode.removeChild(oldNode); return true; } catch(e) { return false; } },
    setNodeValue            : function(xmlDoc, path, val) { if(!asDOM(xmlDoc)) return false; var node = xmlDoc.selectSingleNode(path); if(!node) return false; node.text=val; return true; },
    getNodeValue            : function(xmlDoc, path) { if(!asDOM(xmlDoc)) return false; var node = xmlDoc.selectSingleNode(path); if(!node) return false; return node.text; }
}
var jxx = new jxXML();

/* -------------------------------------------------------------------- */
/* 自定义同义词                                                         */
/* -------------------------------------------------------------------- */
var jxe     = jx.getElem;
var jxes    = jx.getElems;
var jxv     = jx.getValue;
var jxv2    = jx.setValue;


