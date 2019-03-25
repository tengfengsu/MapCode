
// 正则表达式集合：
//\n\s*\r                             //匹配空白行
//<(\S*?)[^>]*>.*?</\1>|<.*? />       //匹配HTML标记
//[a-zA-z]+://[^\s]*                  //匹配网址URL
//[1-9][0-9]{4,}                      //匹配腾讯QQ号
//\d{15}|\d{18}                       //匹配身份证
//\d+\.\d+\.\d+\.\d+                  //匹配ip地址
//^[A-Za-z0-9]+$　　                  //匹配由数字和26个英文字母组成的字符串
//^\w+$　　                           //匹配由数字、26个英文字母或者下划线组成的字符串

var g_re_cnstr = /[\u4e00-\u9fa5]/;                     //匹配中文字符
var g_re_dbbyte = /[^\x00-\xff]/;                        //匹配双字节字符(包括汉字在内)
var g_re_sidesblk = /^\s*|\s*$/;                           //匹配首尾空白字符
var g_re_email = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;     //匹配Email地址
var g_re_phoneno = /^(\d{3,4}-)?\d{7,8}$/;                  //匹配国内电话号码
var g_re_mobile = /^(13[0-9]|15[0-9]|18[0-9])\d{8}$/;  //匹配手机
var g_re_postcode = /[1-9]\d{5}(?!\d)/;                        //匹配中国邮政编码

var g_re_exChar = /.*\'.*|.*%.*@.*/;

var g_re_upInt = /^[1-9]\d*$/;                     //匹配正整数
var g_re_upint1 = /^[0-9]\d*$/;                  //匹配正整数 前面可以有多个0
var g_re_dnInt = /^-[1-9]\d*$/;                      //匹配负整数
var g_re_int = /^(-?[1-9]\d*|0)$/;                    //匹配整数+
var g_re_upFloat = /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$/;  //匹配正浮点数
var g_re_dnFloat = /^-([1-9]\d*\.\d*|0\.\d*[1-9]\d*)$/; //匹配负浮点数
var g_re_float = /^-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)$/;   //匹配浮点数+

var g_re_enstr = /^[A-Za-z]+$/;                     //匹配由26个英文字母组成的字符串
var g_re_upEnstr = /^[A-Z]+$/;                        //匹配由26个英文字母的大写组成的字符串
var g_re_dnEnstr = /^[a-z]+$/;                        //匹配由26个英文字母的小写组成的字符串

var g_re_account = /^[a-zA-Z][a-zA-Z0-9_]{1,15}$/;        //匹配帐号是否合法(字母开头，允许2-16字节，允许字母数字下划线)+

var g_re_date = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/; //匹配日期类型是否为YYYY-MM-DD hh:mm:ss格式的类型 
var g_re_date1 = /^(?:(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(\/|-|\.)(?:0?2\1(?:29))$)|(?:(?:1[6-9]|[2-9]\d)?\d{2})(\/|-|\.)(?:(?:(?:0?[13578]|1[02])\2(?:31))|(?:(?:0?[1,3-9]|1[0-2])\2(29|30))|(?:(?:0?[1-9])|(?:1[0-2]))\2(?:0?[1-9]|1\d|2[0-8]))$/;
var g_re_time = /^((20|21|22|23|[0-1]\d)\:[0-5][0-9])(\:[0-5][0-9])?$/;   //匹配时间类型为hh:mm:ss格式的类型
var g_re_ip = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;       //匹配ip地址

var g_re_unIntbgin = /^[a-zA-Z_\u4e00-\u9fa5][a-zA-Z_0-9\u4e00-\u9fa5]*$/;               //不以数字开头


//document.onkeydown = function() 
//{     
//    alert(event.keyCode);
//    if(event.keyCode == 8) 
//    { 
//        if(event.srcElement.tagName.toLowerCase() != "input" 
//           && event.srcElement.tagName.toLowerCase() != "textarea") 
//            event.returnValue = false; 
//    } 
//} 


var $ = function(context) {
    return document.getElementById(context);
};

// --------------------------------------------------------------------
// script type's prototypies (string)
// --------------------------------------------------------------------
//获取URL参数的值
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}

//判断服务器文件是否存在
function FileExists(filepath) {
    var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    xmlhttp.open("GET", filepath, false);
    xmlhttp.send();
    if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) return true; //url存在 
        else if (xmlhttp.status == 404) return false; //url不存在 
        return false; //其他状态 
    }
}


String.prototype.padLeft = function(len, str) {
    var ret = this;
    while (ret.length < len) { ret = str + ret; }
    return ret;
}
String.prototype.padRight = function(len, str) {
    var ret = this;
    while (ret.length < len) { ret = ret + str; }
    return ret;
}
String.prototype.replaceAll = function(oldstr, newstr) {
    raRegExp = new RegExp(oldstr, "g");
    return this.replace(raRegExp, newstr);
}
String.prototype.trim = function() {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}
String.prototype.format = function() {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function(m, i) { return args[i]; });
}
String.prototype.codeLength = function() {
    var len = 0;
    for (i = 0; i < this.length; i++) {
        if (this.charCodeAt(i) > 0 && this.charCodeAt(i) < 128) len++;
        else len += 2;
    }
    return len;
}
String.prototype.length2 = function() {
    var cArr = this.match(/[^x00-xff]/ig);
    return this.length + (cArr == null ? 0 : cArr.length);
}

String.prototype.htmlEncode = function() {
    return this.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\'", "&#34;").replaceAll("\"", "&#39;");
}
String.prototype.htmlDecode = function() {
    return this.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&#34;", "\'").replaceAll("&#39;", "\"");
}
String.prototype.validReg = function(check) {
    if (!check.test(this)) { return false; } return true;
}
String.prototype.toArray = function() {
    var args = arguments; var thisStr = this;
    if (args.length < 1) args = [','];
    else if (IsArr(args[0])) args = args[0]
    var sptr = args[0];
    for (var i = 1; i < args.length; i++)
        thisStr = thisStr.replaceAll(args[i], sptr);
    return thisStr.split(sptr);
}
String.prototype.toDate = function(format, arrSptrs) {
    // "09.01.01 12:01:01".toDate("yyyy.MM.dd hh:mm:ss", ['.',' ', ':'])
    // return null while failure
    format = GetStr(format, 'yyyy-MM-dd hh:mm:ss');
    if (!IsArr(arrSptrs)) arrSptrs = ['-', ' ', ':'];
    var dateArr = this.toArray(arrSptrs);
    var fmtArr = format.toArray(arrSptrs);
    if (dateArr.length < fmtArr.length) return null;
    var y = 1970; var M = 1; var d = 1; var h = 0; var m = 0; var s = 0; var S = 0;
    for (var i = 0; i < fmtArr.length; i++) {
        switch (fmtArr[i].substr(0, 1)) {
            case "y": y = GetInt(dateArr[i], y); break;
            case "M": M = GetInt(dateArr[i], M); break;
            case "d": d = GetInt(dateArr[i], d); break;
            case "h": h = GetInt(dateArr[i], h); break;
            case "m": m = GetInt(dateArr[i], m); break;
            case "s": s = GetInt(dateArr[i], s); break;
            case "S": S = GetInt(dateArr[i], S); break;
        }
    }
    if (y < 100) y += 2000;
    return new Date(y, M - 1, d, h, m, s, S);
}


// --------------------------------------------------------------------
// valid type value
// --------------------------------------------------------------------

String.prototype.validNum = function() {
    if (g_re_float.test(this) || g_re_int.test(this))
        return true;
    return false;
}
String.prototype.validInt = function() {
    if (g_re_int.test(this))
        return true;
    return false;
}
String.prototype.validInt1 = function() {
    if (g_re_upint1.test(this))
        return true;
    return false;
}
String.prototype.validFloat = function() {
    if (g_re_float.test(this))
        return true;
    return false;
}
String.prototype.validAccount = function() {
    if (g_re_account.test(this))
        return true;
    return false;
}
String.prototype.IsLegality = function() {
    return (!g_re_exChar.test(obj));
}


// --------------------------------------------------------------------
// script type's prototypies (date) 
// --------------------------------------------------------------------
Date.prototype.format = function(format) {
    var o = { "M+": this.getMonth() + 1, "d+": this.getDate(),
        "h+": this.getHours(), "m+": this.getMinutes(),
        "s+": this.getSeconds(), "q+": Math.floor((this.getMonth() + 3) / 3), "S": this.getMilliseconds()
    }
    if (/(y+)/.test(format))
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}

// 在日期值上增加年份
Date.prototype.addYear = function(val) {
    if (typeof (val) != "number") return this;
    return new Date(this.setFullYear(this.getFullYear() + val));
}

// 在日期值上增加月份
Date.prototype.addMonth = function(val) {
    if (typeof (val) != "number") return this;
    var months = this.getFullYear() * 12 + this.getMonth() + val;
    var years = Math.floor(months / 12);
    months = months - (years * 12);
    var newLastDate = new Date(years, months, 0).getDate();
    if (this.getDate() > newLastDate)
        return new Date(years, months, 0);
    return new Date(years, months, this.getDate());
}

// 在日期值上增加天数
Date.prototype.addDate = function(val) {
    if (typeof (val) != "number") return this;
    var ms = this - new Date(0);
    var val = val * 24 * 60 * 60 * 1000;
    return new Date(ms + val);
}

// 获取日期月份中的最大日期数
Date.prototype.getLastDate = function() {
    return (new Date(this.getFullYear(), this.getMonth() + 1, 0)).getDate();
}


// --------------------------------------------------------------------
// script type's prototypies (array & object) 
// --------------------------------------------------------------------

Array.prototype.indexOf = function(val) {
    // alert([1,2,3,"2"].indexOf("2")); //3
    var nTemp = -1;
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) nTemp = i;
        if (this[i].toString() == val.toString() && typeof (this[i]) == typeof (val)) return i;
    }
    return nTemp;
}
Array.prototype.getValue = function() {
    // alert([1,2,3,["1","2","3"]].getValue(3,2));  // "2"
    var arr = this;
    for (var i = 0; i < arguments.length; i++) {
        if (typeof (arguments[i]) == "number" && arr.length > arguments[i]) { arr = arr[arguments[i]]; } else { return null; }
    }
    return arr;
}
Array.prototype.remove = function(index) {
    if (index >= 0 && index < this.length) {
        this.splice(index, 1);
    }
}

function GetObjAttr(obj, attrName) {
    return eval("obj." + attrName);
}


// --------------------------------------------------------------------
// about valid (return true or false)
// --------------------------------------------------------------------

function IsStr(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
}
function IsNum(obj) {
    return Object.prototype.toString.call(obj) === '[object Number]';
}
function IsDate(obj) {
    return Object.prototype.toString.call(obj) === '[object Date]';
}
function IsArr(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}
function IsObj(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}
function IsReg(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
}
function IsElem(obj) {
    if (!obj) return false;
    return (typeof obj == 'object') && typeof obj.document != 'undefined';
}
function IsDOM(obj) {
    if (!obj) return false;
    return (typeof obj == 'object') && typeof obj.parseError != 'undefined';
}
function IsHtmlObj(obj) {
    if (!obj) return false;
    return (typeof obj == 'object') && typeof obj.all != 'undefined';
}
function IsDocument(obj) {
    if (!obj) return false;
    return (typeof obj == 'object') && typeof obj.documentElement != 'undefined';
}
function IsFunction(obj) {
    if (!obj) return false;
    return (typeof obj == 'function') && obj.constructor == Function;
}
function IsLegality(obj) {
    return (!g_re_exChar.test(obj));
}


// --------------------------------------------------------------------
// get type value (include valid, return null or type value)
// --------------------------------------------------------------------

function GetStr(src, defVal) {
    // 当src为null/undefined时返回defVal
    if (IsStr(src)) return src;
    if (typeof (src) == "undefined" || src == null) return defVal;
    return src.toString();
}
function GetInt(src, defVal) {
    // 当src为null/undefined或parseInt后为NaN时,返回defVal
    // 可选参数,传入radix时,可指定parseInt时的进制数,默认为10
    src = parseInt(src, 10);
    if (isNaN(src)) return defVal;
    return src;
}
function GetNum(src, defVal) {
    // 与getInt类似,但支持Float类型
    src = parseFloat(src);
    if (isNaN(src)) return defVal;
    return src;
}
function GetElem(elemId) {
    // 当参数elemId实际是一个elem时直接返回,当无法获取elem时返回null
    if (IsElem(elemId)) return elemId;
    return document.getElementById(GetStr(elemId, null));
}
function GetElemUP(byelem, attrName, lookVal) {
    // 依指定属性名,获取父元素
    byelem = GetElem(byelem); attrName = GetStr(attrName, null);
    if (!byelem || !attrName) return null;
    while (byelem.getAttribute(attrName) != lookVal) {
        byelem = byelem.parentElement;
        if (byelem.tagName == "BODY") break;
    }
    return byelem;
}
function GetElems(elemName) {
    // 等同于document.getElementsByName,如果elemName本身己是elems集合,则直接返回
    if (elemName.length) if (elemName[0]) if (IsElem(elemName[0])) return elemName;
    return document.getElementsByName(GetStr(elemName, ''));
}
function GetElemsByClassName(className, rootNode) {
    // 依据className与父级elem获取对象集合,rootNode无效时默认为document
    // 当className无效时返回null,否则返回0长度集合或对象集合
    var ret = []; if (!IsStr(className)) return ret; var elems = null;
    if (!rootNode) { elems = document.all; } else { elems = GetElem(rootNode); if (elems) elems = elems.all; }
    var nLen = elems.length; var pattern = new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)');
    for (var i = 0; i < nLen; i++) { if (pattern.test(elems[i].className)) { ret.push(elems[i]); } }
    return ret;
}

function CheckDecimalLen(src, len) {
    var re = new RegExp("^([1-9]\\d*|0)$|^([1-9]\\d*\\.\\d{1," + len + "})$");
    return re.test(src);
}

// --------------------------------------------------------------------
// about elem's value (include valid, return null or type value)
// --------------------------------------------------------------------

function GetElemValue(elem) {
    // 取input's value,select[single mode]'s selectedValue,其它元素的innerHTML,未获取对象则返回null
    elem = GetElem(elem); var retVal = null; if (!elem) return retVal;
    if (elem.tagName == 'INPUT') {
        if (elem.type == 'radio' || elem.type == 'checkbox') {
            if (elem.checked == true) retVal = elem.value;
        }
        else { retVal = elem.value; }
    }
    else if (elem.tagName == 'SELECT') retVal = elem.value;
    else retVal = elem.innerHTML;
    return retVal;
}
function SetElemValue(elem, value) {
    // 取input's value,select's selectedValue,其它元素的innerHTML
    // input[checkbox/radio]的值与参数value匹配时,使其checked
    elem = GetElem(elem); if (!elem) return;
    if (elem.tagName == 'INPUT') {
        if (elem.type == 'radio' || elem.type == 'checkbox') {
            if (elem.value == value) elem.checked = true;
        }
        else { elem.value = value; }
    }
    else if (elem.tagName == 'SELECT') { try { elem.value = value; } catch (e) { } }
    else { elem.innerHTML = value; }
    return;
}
function GetChecksValue(elems) {
    // 传入checkbox's name或checkbox集合,获取选定的值
    // 返回值以数组形式存储
    elems = GetElems(elems); var retVal = [];
    for (var i = 0; i < elems.length; i++)
        if (elems[i].checked == true)
        retVal.push(elems[i].value);
    return retVal;
}
function SetChecksValue(elems, arrValues, bAddOnly) {
    // 设置checkboxs's的选定状态
    // bAddOnly[default:false]表示仅增加选定,不操作己选定项
    if (!IsArr(arrValues)) return; elems = GetElems(elems); if (!elems) return;
    for (var i = 0; i < elems.length; i++) {
        if (arrValues.indexOf(elems[i].value) >= 0) elems[i].checked = true;
        else if (bAddOnly != true) elems[i].checked = false;
    }
    return;
}
function GetSelectValues(elem) {
    // 获取selected option的己选定值, 适合于多选select
    var retVal = [];
    elem = GetElem(elem);
    if (elem.tagName != 'SELECT') return;
    for (var i = 0; i < elem.options.length; i++)
        if (elem.options[i].selected == true)
        retVal.push(elem.options[i].value);
    return retVal;
}
function SetSelectValues(elem, arrValues, bAddOnly) {
    // 设置select的值,更适合于多选select
    if (!IsArr(arrValues)) return;
    elem = GetElem(elem);
    for (var i = 0; i < elem.options.length; i++) {
        if (arrValues.indexOf(elem.options[i].value) >= 0) elem.options[i].selected = true;
        else if (bAddOnly != true) elem.options[i].selected = false;
    }
    return;
}
function GetRadiosValue(elems) {
    // 传入radio's name或radio集合,获取选定的值
    // 返回值为字符串,当无选定值时返回null
    elems = GetElems(elems);
    for (var i = 0; i < elems.length; i++)
        if (elems[i].checked == true)
        return elems[i].value;
    return null;
}
function SetRadiosValue(elems, value) {
    // 设置radios's的选定状态
    elems = GetElems(elems);
    for (var i = 0; i < elems.length; i++) {
        if (value == elems[i].value) { elems[i].checked = true; return; }
    }
    return;
}
function SetSelectItem(elem, value, text, iPos, isSelected) {
    // 选择(或增加并选择)一个Select's Item, iPos为无效值时表示追加
    elem = GetElem(elem); if (!elem) return; if (elem.tagName != 'SELECT') return;
    value = GetStr(value, ''); text = GetStr(text, '');
    iPos = GetInt(iPos, elem.options.length);
    var hasThisOpt = false;
    for (var i = elem.options.length - 1; i > -1; i--) {
        if (elem.options[i].value == value || elem.options[i].text == text) {
            hasThisOpt = true; if (isSelected) elem.options[i].selected = true; break;
        }
    }
    if (!hasThisOpt) {
        var opt = document.createElement('option');
        opt.value = value; opt.text = text;
        elem.options.add(opt, iPos); if (isSelected) SetSelectValues(elem, [value], true);
    }
    return;
}
function AddSelectItem(elem, value, text, iPos, isSelected) {
    // 选择(或增加并选择)一个Select's Item, iPos为无效值时表示追加
    elem = GetElem(elem); if (!elem) return; if (elem.tagName != 'SELECT') return;
    value = GetStr(value, ''); text = GetStr(text, '');

    var txtHtml = ">" + text + "<";
    if (elem.outerHTML.indexOf(txtHtml) != -1)
        return;
    iPos = GetInt(iPos, elem.options.length);
    var opt = document.createElement('option');
    opt.value = value; opt.text = text;
    elem.options.add(opt, iPos); if (isSelected == true) SetSelectValues(elem, [value], true);
    return;
}
// 判断select选项中是否存在Value="paraValue"的Item
function SelectIsExitItem(objSelect, objItemValue) {
    var isExit = false;
    objSelect = GetElem(objSelect); if (!objSelect) return isExit;
    for (var i = 0; i < objSelect.options.length; i++) {
        if (objSelect.options[i].value == objItemValue) {
            isExit = true;
            break;
        }
    }
    return isExit;
}
function SelectChecks(elems, type) {
    // 设置elems(Checkboxs)的值为checked=真(1)/假(0)/反选(2)/依第一项反选(3)
    elems = GetElems(elems); if (!elems) return;
    var checkType;
    if (type == '1') checkType = true;
    else if (type == '0') checkType = false;
    else if (type == '2') checkType = 2;
    else checkType = (elems[0].checked) ? false : true;

    if (type == 2) {
        for (var i = 0; i < elems.length; i++)
            elems[i].checked = !elems[i].checked;
    }
    else {
        for (var i = 0; i < elems.length; i++)
            elems[i].checked = checkType;
    }
    return;
}
function SelectChecksByCkb(elems, elem) {
    // 依据一个checkbox值设置一组checkbox值
    elems = GetElems(elems);
    elem = GetElem(elem);
    if (!elems || !elem) return;
    if (elem.tagName != 'INPUT' || elem.type != 'checkbox') return;
    if (elem.checked) SelectChecks(elems, 1);
    else SelectChecks(elems, 0);
    return;
}
function SetInput(elem, inputWidth, maxLength) {
    elem = GetElem(elem); if (!elem) return; if (elem.getAttribute("SetInput") == "true") return;
    var strMaxLength = "";
    if (arguments.length == 3) { strMaxLength = " maxLength=" + maxLength; }
    var val = GetInnerText(elem); elem.setAttribute("SetInput", "true"); elem.innerHTML = "";
    inputWidth = (IsStr(inputWidth) && inputWidth.length > 0) ? inputWidth : elem.clientWidth - 10 + "px";
    elem.innerHTML = '<input type="text" ' + strMaxLength + ' style="width:' + inputWidth + ';" name="SetInput_name" id="SetInput__' + elem.id + '" value=""/>' +
        '<input type="hidden" name="SetInputHid_name" id="SetInputHid__' + elem.id + '"/>';
    SetElemValue("SetInput__" + elem.id, val);
    SetElemValue("SetInputHid__" + elem.id, val);
}
function GetElemValue_SetInput(elem) {
    elem = GetElem(elem); if (!elem) return;
    return GetElemValue("SetInput__" + elem.id)
}
function SetInput_Reset(isResetToOld) {
    var elems = (isResetToOld) ? GetElems("SetInput_name") : GetElems("SetInputHid_name"); var len = elems.length;
    for (var i = len - 1; i > -1; i--) {
        elems[i].parentElement.removeAttribute("SetInput");
        elems[i].parentElement.innerText = GetElemValue(elems[i]);
    }
}
function SetSelect(elem, options, width) {
    elem = GetElem(elem); if (!elem) return; if (!options) return;
    if (elem.getAttribute("SetSelect") == "true") return;
    var val = GetElem(elem).innerText; elem.setAttribute("SetSelect", "true"); elem.innerHTML = "";
    if (!IsArr(options) && !IsArr(options[0])) return; var html = "";
    for (i = 0; i < options.length; i++) {
        strs = options[i]; html = html + "<option value='" + strs[0] + "'>" + strs[1] + "</option>";
    }
    elem.innerHTML = "<select style='width:" + width + ";' name='SetSelect_name' id='SetSelect__" + elem.id + "' value=''>" + html + "</select>" +
    "<input type='hidden' name='SetSelectHid_name' id='SetSelectHid__" + elem.id + "'/>";
    for (i = 0; i < GetElem("SetSelect__" + elem.id).length; i++) {
        if (GetElem("SetSelect__" + elem.id)[i].text == val) {
            GetElem("SetSelect__" + elem.id)[i].selected = true;
            break;
        }
    }
    SetElemValue("SetSelectHid__" + elem.id, val);
}
function GetElemValue_SetSelect(elem) {
    elem = GetElem(elem); if (!elem) return;
    return GetElemValue("SetSelect__" + elem.id)
}
function SetSelect_Reset(isResetToOld) {
    var elems = (isResetToOld) ? GetElems("SetSelect_name") : GetElems("SetSelectHid_name"); var len = elems.length;
    for (var i = len - 1; i > -1; i--) {
        elems[i].parentElement.removeAttribute("SetSelect");
        if (isResetToOld) {
            for (j = 0; j < elems[i].length; j++) {
                if (elems[i][j].selected) {
                    elems[i].parentElement.innerHTML = elems[i][j].text; break;
                }
            }
        }
        else
            elems[i].parentElement.innerHTML = GetElemValue(elems[i]);
    }
}
function GetInnerText(elem) {
    // 获取元素的innerText
    elem = GetElem(elem); if (!IsElem(elem)) return '';
    if (elem.text) return elem.text;
    else if (elem.innerText) return elem.innerText;
    else if (elem.textContent) return elem.textContent;
    else return '';
}

function GetValueByText(elementName, text) {
    if (text == "") return "";
    var elements = GetElem(elementName);
    for (var i = 0; i < elements.length; i++) {
        if (elements.options[i].text == text)
            return elements[i].value;
    }
    return "";
}

function GetSelectTextByValue(elementId, value) {
    var result = '';
    var elem = GetElem(elementId);
    if (elem.tagName != "SELECT") { return result; }
    for (var i = 0; i < elem.length; i++) {
        if (elem[i].value == value) {
            result = elem[i].text;
            break;
        }
    }
    return result;
}

function GetSelectTextBySelected(elementId) {
    var result = '';
    var elem = GetElem(elementId);
    if (elem.tagName != "SELECT") { return result; }
    for (var i = 0; i < elem.length; i++) {
        if (elem[i].selected == true) {
            result = elem[i].text;
            break;
        }
    }
    return result;
}

// --------------------------------------------------------------------
// about elem's style (include valid)
// --------------------------------------------------------------------

function GetStyleInfo(elem) {
    var info = { screenWidth: 0, screenHeight: 0, scrollWidth: 0, scrollHeight: 0, scrollLeft: 0, scrollTop: 0, width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0 };
    elem = GetElem(elem);
    if (!IsElem(elem)) return info;
    var rect = elem.getBoundingClientRect();
    var de = elem.document.body;
    var de1 = elem.document.documentElement;

    info.screenWidth = (de1.clientWidth > 0) ? de1.clientWidth : de.clientWidth;
    info.screenHeight = (de1.clientHeight > 0) ? de1.clientHeight : de.clientHeight;
    info.scrollWidth = de1.scrollWidth;
    info.scrollHeight = de1.scrollHeight;
    info.scrollLeft = de1.scrollLeft;
    info.scrollTop = de1.scrollTop;

    if (rect.left > 0) info.left = rect.left;
    if (rect.right > 0) info.right = rect.right;
    if (rect.top > 0) info.top = rect.top;
    if (rect.bottom > 0) info.bottom = rect.bottom;
    if (rect.right > rect.left && rect.left >= 0) info.width = rect.right - rect.left;
    else if (GetInt(elem.clientWidth, 0) > 0) info.width = GetInt(elem.clientWidth, 0);
    else if (GetInt(elem.style.width, 0) > 0) info.width = GetInt(elem.style.width, 0);
    if (rect.bottom >= rect.top && rect.top >= 0) info.height = rect.bottom - rect.top;
    else if (GetInt(elem.clientHeight, 0) > 0) info.width = GetInt(elem.clientHeight, 0);
    else if (GetInt(elem.style.height, 0) > 0) info.height = GetInt(elem.style.height, 0);
    return info;
}
function SetDisplay(elem, value) {
    elem = GetElem(elem); if (!IsElem(elem)) return;
    value = GetStr(value, null);
    if (value == null) {
        elem.style.display = ((elem.style.display == 'none') ? 'block' : 'none'); return;
    }
    if (value == 'block' || value == 'true' || value == '1') value = 'block'; else value = 'none';
    elem.style.display = value;
    return;
}
function SetClass(elem, className) {
    elem = GetElem(elem); if (!IsElem(elem)) return;
    className = GetStr(className, '');
    elem.className = className;
    return;
}
function AppClass(elem, className) {
    elem = GetElem(elem); if (!IsElem(elem)) return;
    className = GetStr(className, '');
    elem.className = elem.className + " " + className;
}
function RemoveClass(elem, className) {
    elem = GetElem(elem); if (!IsElem(elem)) return;
    className = GetStr(className, '');
    elem.className = elem.className.replaceAll(className, "");
}


// --------------------------------------------------------------------
// other
// --------------------------------------------------------------------
function GetTimeZone(startDatetime, endDatetime) {
    startDatetime = (IsDate(startDatetime)) ? startDatetime : startDatetime.toDate();
    endDatetime = (IsDate(endDatetime)) ? endDatetime : endDatetime.toDate();
    var timeZone = endDatetime - startDatetime;
    var h = GetInt(timeZone / 1000 / 60 / 60);
    var m = GetInt((timeZone - (h * 1000 * 60 * 60)) / 1000 / 60);
    return (h + "") + "时" + (m + "").padLeft(2, "0") + "分";
}
function FormatNum(num, len) {
    num = (num.indexOf(".") >= 0) ? num + "" : num + ".";
    num1 = num.substr(num.indexOf(".") + 1);
    num1 = num1.padRight(len, "0").substr(0, len);
    return num.split(".")[0] + "." + num1;
}
function Wrt(html) {
    document.write(html);
}
function Clip(text) {
    window.clipboardData.setData('text', text);
}
function GetRd(n) {
    var ret = "";
    n = GetInt(n, 1); n = (n < 1) ? 1 : n;
    for (var i = 0; i < n; i++) ret += Math.random().toString().split(".")[1];
    return ret;
}
function GetCookie(cookieName) {
    var aCookie = document.cookie.split("; ");
    for (var i = 0; i < aCookie.length; i++) {
        var aCrumb = aCookie[i].split("=");
        if (cookieName == aCrumb[0]) {
            if (aCrumb.length > 1) return unescape(aCrumb[1]);
            else return "";
        }
    }
    return null;
}
function SetCookie(cookieName, value) {
    var argv = SetCookie.arguments;
    var argc = SetCookie.arguments.length;
    var expires = (argc > 2) ? argv[2] : null;
    var path = (argc > 3) ? argv[3] : null;
    var domain = (argc > 4) ? argv[4] : null;
    var secure = (argc > 5) ? argv[5] : false;
    document.cookie = cookieName + "=" + escape(value) +
	    ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) +
	    ((path == null) ? "" : ("; path=" + path)) +
	    ((domain == null) ? "" : ("; domain=" + domain)) +
	    ((secure == true) ? "; secure" : "");
}
function AddFav(text, url) {
    if (!text) text = document.title;
    if (!url) url = document.location.href;
    if (window.sidebar && "object" == typeof (window.sidebar) && "function" == typeof (window.sidebar.addPanel))
        window.sidebar.addPanel(text, url, "");
    else if (document.all && "object" == typeof (window.external))
        window.external.addFavorite(url, text);
}
function GetExprType() {
    return ((window.navigator.userAgent.indexOf("Opera") >= 1) ? 3 : (window.navigator.userAgent.indexOf("Gecko") >= 1) ? 2 : ((window.navigator.userAgent.indexOf("MSIE") >= 1) ? 1 : 0));
}


// --------------------------------------------------------------------
// XMLHTTPRequest & XMLDOMDocument & XSLTemplate
// --------------------------------------------------------------------

function MakeHttpRequest() {
    // Create HttpRequest Object
    return (window.ActiveXObject) ? new window.ActiveXObject("microsoft.xmlhttp") : new window.XMLHttpRequest();
}
function MakeDOM(progId) {
    // Make a XMLDOMDocument Object
    var dom = (window.ActiveXObject) ? (new ActiveXObject("msxml2.DOMDocument.3.0")) : (document.implementation.createDocument("text/xml", "", null));
    if (!dom) return null; dom.async = false; dom.validateOnParse = false; dom.resolveExternals = false;
    return dom;
}
function LoadDOMXmlStr(xmlStr) {
    // LoadDOMXmlStr
    xmlStr = FixXmlForSpecChar(xmlStr);
    var dom = MakeDOM();
    dom.loadXML(xmlStr);
    return dom;
}
function LoadDOMXmlFile(fileUrl) {
    // LoadDOMXmlFile
    var xmlhttp = MakeHttpRequest();
    xmlhttp.open("GET", fileUrl, false);
    xmlhttp.send(null);
    return xmlhttp.responseXML;
}
function GetNodeValue(xmlDoc, nodeName) {
    // Get Node Value
    var ret = xmlDoc.selectSingleNode(nodeName);
    if (ret) ret = ret.text; else ret = "";
    return ret;
}
function GetNodeValues(xmlDoc, nodeName) {
    // Get Node Value
    var rets = xmlDoc.selectNodes(nodeName);
    var ret = [];
    if (rets) {
        for (i = 0; i < rets.length; i++)
            ret.push(rets[i].text);
    }
    return ret;
}
function SetNodeValue(xmlDoc, node, newVal) {
    // Set Value to Node and return XMLDocument
    var childs = node.childNodes;
    for (var i = childs.length - 1; i >= 0; i--) { if (childs[i].nodeType == 3) { try { node.removeChild(childs[i]); } catch (e) { } } }
    var newNodeVal = xmlDoc.createTextNode(newVal);
    node.appendChild(newNodeVal);
    return node;
}
function SetNodeValueEx(xmlDoc, path, newVal) {
    //To handle missing attribute and XPath starts with "//"
    var node = xmlDoc.selectSingleNode(path);
    if (node != null) SetNodeValue(xmlDoc, node, newVal);
    else if (path.charAt(0) == '@') xmlDoc.setAttribute(path.substring(1), newVal);
    else {
        var currentPath = ""; var nodesArray = path.split("/");
        for (var i = 0; i < nodesArray.length; i++) {
            if (nodesArray[i] == "") { currentPath += "/"; continue; }
            var parentNode = (currentPath == "/" || currentPath == "//") ? xmlDoc : xmlDoc.selectSingleNode(currentPath);

            currentPath += currentPath.charAt(currentPath.length - 1) == '/' ? nodesArray[i] : "/" + nodesArray[i];
            var selNode = xmlDoc.selectSingleNode(currentPath);
            if (selNode == null) {
                if (nodesArray[i].charAt(0) == '@') {
                    parentNode.setAttribute(nodesArray[i].substring(1), newVal);
                    node = parentNode; break;
                }
                else {
                    var newNode;
                    if (xmlDoc.ownerDocument == null) newNode = xmlDoc.createElement(nodesArray[i]);
                    else newNode = xmlDoc.ownerDocument.createElement(nodesArray[i]);
                    parentNode.appendChild(newNode);
                    if (i == nodesArray.length - 1) { node = SetNodeValue(xmlDoc, newNode, newVal); }
                }
            }
        }
    }
    return node;
}
function TransformToHtml(xml, xsl) {
    // Transform To Fragment/HTML
    var html;
    try { //xml = FixXmlForFF(xml);
        if (window.XSLTProcessor) {
            var xsltProcessor = new XSLTProcessor();
            xsltProcessor.importStylesheet(xsl);
            html = xsltProcessor.transformToFragment(xml, document);
            var virElem = document.createElement("div");
            virElem.appendChild(html);
            html = virElem.innerHTML;
        }
        else
            html = xml.transformNode(xsl);
    }
    catch (e) { html = ""; }
    return html;
}
function TransformToHtmlEx(xmlType, xslType, xml, xsl) {
    // Transform Xml and Xsl as type To Fragment/HTML
    try {
        var xmlDOM = (xmlType == 1) ? LoadDOMXmlFile(xml) : ((xmlType == 2) ? LoadDOMXmlStr(xml) : xml);
        var xslDOM = (xslType == 1) ? LoadDOMXmlFile(xsl) : ((xslType == 2) ? LoadDOMXmlStr(xsl) : xsl);
        var html = TransformToHtml(xmlDOM, xslDOM); return html;
    }
    catch (e) { return ""; }
}
function FixXmlForFF(xml) {
    // Fix the xml for Firefox
    var items = xml.selectNodes("//items/item");
    var itemNodes;
    for (var i = 0; i < items.length; i++) {
        itemNodes = items[i].childNodes;
        var item;
        for (var j = 0; j < itemNodes.length; j++) {
            item = itemNodes[j];
            item.text = Html2TextValue(HtmlDecode(HtmlDecode(item.text, true), true));
        }
    }
    return xml;
}
function FixXmlForSpecChar(xmlStr) {
    // Fix the xml for special character
    return xmlStr.replaceAll("&#x", "?");
}





// 除法函数
// 说明：javascript的算法结果会有误差，在两个浮点数相除的时候会比较明显。
// accDiv(4,2) //2
function accDiv(arg1, arg2) {
    var t1 = 0, t2 = 0, r1, r2;
    try { t1 = arg1.toString().split(".")[1].length } catch (e) { }
    try { t2 = arg2.toString().split(".")[1].length } catch (e) { }
    with (Math) {
        r1 = Number(arg1.toString().replace(".", ""))
        r2 = Number(arg2.toString().replace(".", ""))
        return (r1 / r2) * pow(10, t2 - t1);
    }
}

// 给Number类型增加一个div方法
// (9).div(3); //3
Number.prototype.div = function(arg) {
    return accDiv(this, arg);
}

// 乘法函数
// accMul(2,2)  //4
function accMul(arg1, arg2) {
    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try { m += s1.split(".")[1].length } catch (e) { }
    try { m += s2.split(".")[1].length } catch (e) { }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
}

// 给Number类型增加一个mul方法
// (6).mul(3); //18
Number.prototype.mul = function(arg) {
    return accMul(arg, this);
}

// 加法函数
// accAdd(1,2) //3
function accAdd(arg1, arg2) {
    var r1, r2, m;
    try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
    try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
    m = Math.pow(10, Math.max(r1, r2));
    return (arg1 * m + arg2 * m) / m;
}

// 给Number类型增加一个add方法
// (37).add(3); //40
Number.prototype.add = function(arg) {
    return accAdd(arg, this);
}

// 减法函数
// Subtr(5,4) //1
function Subtr(arg1, arg2) {
    var r1, r2, m, n;
    try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
    try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
    m = Math.pow(10, Math.max(r1, r2));
    n = (r1 >= r2) ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
}

// 给Number类型增加一个add方法
// (5).sub(37) //42
Number.prototype.sub = function(arg) {
    return Subtr(arg, this);
}

//--------------------------------------------------------------

function Hashtable() {
    this._hash = new Object();
    this.add = function(key, value) {
        if (typeof (key) != "undefined") {
            //            if (!this.contains(key) ) {
            //                this._hash[key] = typeof (value) == "undefined" ? null : value;
            //                return true;
            //            } else {
            //                return false;
            //            }
            this._hash[key] = typeof (value) == "undefined" ? null : value;
        } else {
            return false;
        }
    }
    this.remove = function(key) { delete this._hash[key]; }
    this.count = function() { var i = 0; for (var k in this._hash) { i++; } return i; }
    this.items = function(key) { return this._hash[key]; }
    this.contains = function(key) { return typeof (this._hash[key]) != "undefined"; }
    this.clear = function() { for (var k in this._hash) { delete this._hash[k]; } }

    /** hashTable 2 json */
    this.toJson = function() {
        var str = "";
        for (var attr in this._hash) {
            str += ",\"" + attr + "\":\"" + this._hash[attr].replace("\"", "").replace("'", "").replace(":", "").replace(",", "") + "\"";
        }
        if (str.length > 0) { str = str.substr(1, str.length); }
        return "{" + str + "}";
    };

    this.toArrayKey = function() {
        var str = "";
        for (var attr in this._hash) {
            str += "," + attr;
        }
        if (str.length > 0) { str = str.substr(1, str.length); }
        return str;
    };
}
