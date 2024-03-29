
function ComboTableRow(elem, rowIndex) {
    var elem = GetElem(elem); if (!elem) return; if (elem.rows.length - 1 < rowIndex) return;
    var cells = elem.rows[rowIndex].cells;
    var prevCell = cells[0];
    for (var i = 1; i < cells.length; i++) {
        if (prevCell.innerText == cells[i].innerText) {
            prevCell.colSpan = prevCell.colSpan + 1;
            cells[i].style.display = "none";
        }
        else {
            prevCell = cells[i];
        }
    }
}
function ComboTableCell(elem, rowIndex, cellIndex) {
    var elem = GetElem(elem); if (!elem) return;
    var rows = elem.rows; if (rows.length - 1 < rowIndex) return;
    var prevCell = rows[rowIndex].cells[cellIndex]; if (prevCell == null) return;
    rows[1].cells[cellIndex].className = "gd_combcell";
    for (var i = rowIndex + 1; i < elem.rows.length; i++) {
        rows[i].cells[cellIndex].className = "gd_combcell";
        if (prevCell.innerText == rows[i].cells[cellIndex].innerText) {
            prevCell.rowSpan = prevCell.rowSpan + 1;
            rows[i].cells[cellIndex].style.display = "none";
        }
        else {
            prevCell = rows[i].cells[cellIndex];
        }
    }
}


////////////////////////////////////////////////////////////////////////////////////////// Jx Request

function jxreq(url, postInfo, callBack, infoToCallBack) {
    this.url = url;
    this.postInfo = postInfo;
    this.callBack = callBack;
    this.infoToCallBack = infoToCallBack;
    var xmlhttp = MakeHttpRequest();

    this.load = function() {
        // 异步请求(返回XMLStr)
        if (this.url.indexOf(".xml") == (this.url.length - 4)) {
            return LoadDOMXmlFile();
        }
        var back = this.callBack;
        var info = this.infoToCallBack;
        xmlhttp.open("POST", this.url, true);
        xmlhttp.setRequestHeader("IsAjaxRequest", "true");
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) { back(xmlhttp.responseText, info, true); }
        };
        if (IsDOM(this.postInfo)) this.postInfo = this.postInfo.xml;
        xmlhttp.send(this.postInfo);
        //提示显示显示在当前页面的右上角 edit by qiubaosheng 2011-11-3
        if (infoToCallBack == null) return;
        var ajaxMsg = this.infoToCallBack[2];
        var divAjaxInfo = document.getElementById(ajaxMsg);
        if (divAjaxInfo == null) return;
        var srcolltop = document.documentElement.scrollTop;
        srcolltop = srcolltop == 0 ? 25 : srcolltop;
        divAjaxInfo.style.top = srcolltop;
        //end edit
    };
    this.req = function() {
        // 立即请求(返回XMLStr)
        if (this.url.indexOf(".xml") == (this.url.length - 4)) {
            return LoadDOMXmlFile();
        }
        xmlhttp.open("POST", this.url, false);
        xmlhttp.setRequestHeader("IsAjaxRequest", "true");
        if (IsDOM(this.postInfo)) this.postInfo = this.postInfo.xml;
        xmlhttp.send(this.postInfo);
        return xmlhttp.responseText;
    };
    this.loadXmlFile = function() {
        // 调用LoadDOMXmlFile方法加载XML文件(返回DOM)
        return LoadDOMXmlFile();
    };

    return this;
}

//aryElems 按钮对象名称，disabled 是否灰置
function SetBtnDisabledStatus(aryElems, disabled) {
    if (aryElems == null || aryElems == undefined)
        return;
    for (var i = 0; i < aryElems.length; i++) {
        var tmp = document.getElementById(aryElems[i]);
        if (tmp == null) continue;
        if (tmp.className.indexOf("btn") > 0) continue;
        if (tmp.disabled != disabled) {
            tmp.disabled = disabled;
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////// Jx Data

var g_jxdatas = [];

function jxdata(reqUrl, reqPostInfo, reqCallBack, reqInfoToCallBack) {
    this.data = null;
    this.dataType = "xml";
    this.dataReady = false;
    this.reqUrl = reqUrl;
    this.reqPostInfo = reqPostInfo;
    this.reqCallBack = reqCallBack;
    this.reqInfoToCallBack = reqInfoToCallBack;
    this.msgLoading = "正在请求数据...";
    this.aryBtnDisabled = [];

    this.reqLoad = function(subDataName, addDataName) {
        var ajaxMsg = ShowAjax(this.msgLoading);
        SetBtnDisabledStatus(this.aryBtnDisabled, true);
        var back = g_jxdatas[idx_in_datas].onReqCallBack;
        var info = [this.reqCallBack, this.reqInfoToCallBack, ajaxMsg, subDataName, addDataName, this.aryBtnDisabled];
        var jr = new jxreq(this.reqUrl, this.reqPostInfo, back, info);
        jr.load();
    };
    this.getReq = function() {
        var jr = new jxreq(this.reqUrl, this.reqPostInfo);
        g_jxdatas[idx_in_datas].setData(jr.req());
    };
    this.onReqCallBack = function(ret, info) {
        if (ret == "nologin") {
            ////ShowDlg("iframe","请您重新登录","/krswebui/LoginSmall.aspx",["230","150"]);
            //ret = "登录超时";
            window.location.replace("/krswebui/errpage.aspx?type=-3&msg=未登录或登录己超时");
            return;
        }
        g_jxdatas[idx_in_datas].setData(ret, info[3], info[4]);
        CloseAjax(info[2]);
        SetBtnDisabledStatus(info[5], false);
        if (IsFunction(info[0])) info[0](ret, info[1]);
    };

    // 将对象置于全局对象数据,并返回引用
    var idx_in_datas = g_jxdatas.push(this) - 1;
    return g_jxdatas[idx_in_datas];
}



jxdata.prototype = {
    isValidXml: function() {
        if (this.dataType != "xml" || !this.dataReady || !IsDOM(this.data) || this.data.parseError.errorCode != 0)
            return false;
        this.data.setProperty("SelectionLanguage", "XPath"); return true;
    },
    getData: function() {
        return this.data;
    },
    loadPageXml: function(elem) {
        elem = GetElem(elem); if (!elem) return false;
        this.data = LoadDOMXmlStr(elem.innerHTML);
        this.dataType = "xml"; this.dataReady = true;
    },
    setData: function(src, subDataName, addDataName) {
        if (this.dataType == "xml") {
            src = (IsDOM(src)) ? src : LoadDOMXmlStr(src);
            if (subDataName && this.isValidXml()) {
                newNode = src.selectSingleNode("/root/" + subDataName); if (!newNode) return;
                oldNode = this.data.selectSingleNode("/root/" + subDataName);
                parNode = this.data.selectSingleNode("/root");
                if (oldNode) parNode.removeChild(oldNode);
                parNode.appendChild(newNode);
            }
            else {
                this.data = src;
            }
        }
        this.dataReady = true;
    },
    getSubData: function(dataName) {
        if (!this.isValidXml()) return null;
        if (!IsStr(dataName)) return null;
        return this.data.documentElement.selectSingleNode("/root/" + dataName);
    },
    setSubData: function(dataName) {
        if (!this.isValidXml()) return null; if (!IsStr(dataName)) return null;
        var root = this.data.documentElement.selectSingleNode("/root"); if (!root) return null;
        var dat = root.selectSingleNode(dataName);
        if (dat == null) { dat = root.appendChild(this.data.createNode(1, dataName, "")); }
        if (dat) {
            var items = dat.selectSingleNode("items");
            if (items == null) { items = dat.appendChild(this.data.createNode(1, "items", "")); }
        }
        return dat;
    },
    getSubDataInfo: function(dataName) {
        if (!this.isValidXml()) return null;
        if (!IsStr(dataName)) return null;
        var infoNodes = this.data.documentElement.selectNodes("/root/" + dataName + "/dataInfo/*"); if (!infoNodes) return null;
        if (infoNodes.length < 4) return null; var ret = {};
        ret.pageIndex = infoNodes[0].text; ret.pageSize = infoNodes[1].text;
        ret.recordCount = infoNodes[2].text; ret.orderStr = infoNodes[3].text;
        return ret;
    },
    getItem: function(dataName, itemPos) {
        if (!this.isValidXml()) return null; if (!IsStr(dataName)) return null;
        itemPos = GetInt(itemPos, 0);
        return this.data.documentElement.selectSingleNode("/root/" + dataName + "/items/item[position()=" + itemPos + "]");
    },
    delItem: function(dataName, itemPos) {

    },
    addItem: function(dataName, itemPos) {
        var pnode = this.getSubData(dataName);
        if (!pnode) return null;
        pnode = pnode.selectSingleNode("items");
        return pnode.appendChild(this.data.createNode(1, "item", ""));
    },
    delItemNode: function(dataName, itemPos, nodeName, nodeValue) {

    },
    addItemNode: function(dataName, itemPos, nodeName, nodeValue) {

    },
    getItemNodeValue: function(dataName, itemPos, nodeName) {

    },
    setItemNodeValue: function(dataName, itemPos, nodeName, nodeValue) {

    },
    addSubXmlCol: function(dataName, colName, formatStr, isEval) {
        colName = GetStr(colName, null); formatStr = GetStr(formatStr, null);
        if (!colName || !formatStr) return false;
        if (!this.isValidXml()) return;
        var nodes = this.data.documentElement.selectNodes("/root/" + dataName + "//items/item");
        var re = /\{[^\{\}]*\}/g; var arr = formatStr.match(re); var col;
        var val = ""; var nodeVal = ""; var newStr = "";
        for (var i = 0; i < nodes.length; i++) {
            newStr = formatStr;
            for (var j = 0; j < arr.length; j++) {
                val = arr[j];
                nodeVal = nodes[i].selectSingleNode(val.substr(1, val.length - 2));
                if (nodeVal) nodeVal = nodeVal.text;
                newStr = newStr.replaceAll(val, nodeVal);
            }
            col = nodes[i].appendChild(this.data.createNode(1, colName, ""));
            col.text = isEval ? eval(newStr) : newStr;
        }
    },

    // 扩展应用
    fillToSelect: function(elem, dataName, valueField, textField) {
        if (!this.isValidXml()) return;
        elem = GetElem(elem); if (!elem) return; elem.options.length = 0;
        valueField = GetStr(valueField, null); textField = GetStr(textField, null);
        if (!valueField || !textField) return;
        var nodes = this.data.documentElement.selectNodes("/root/" + dataName + "//items/item");
        var nodeValue; var nodeText;
        try {
            for (var i = nodes.length - 1; i > -1; i--) {
                nodeValue = nodes[i].selectSingleNode(valueField).text;
                nodeText = nodes[i].selectSingleNode(textField).text;
                SetSelectItem(elem, nodeValue, nodeText, 0, false);
            }
        } catch (e) { }
    },
    // 扩展应用
    addToSelect: function(elem, dataName, valueField, textField) {
        if (!this.isValidXml()) return;
        elem = GetElem(elem); if (!elem) return;
        valueField = GetStr(valueField, null); textField = GetStr(textField, null);
        if (!valueField || !textField) return;
        var nodes = this.data.documentElement.selectNodes("/root/" + dataName + "//items/item");
        var nodeValue; var nodeText;
        try {
            for (var i = nodes.length - 1; i > -1; i--) {
                nodeValue = nodes[i].selectSingleNode(valueField).text;
                nodeText = nodes[i].selectSingleNode(textField).text;
                AddSelectItem(elem, nodeValue, nodeText, -1, false);
            }
        } catch (e) { }
    },
    // 扩展应用
    addToSelectAsc: function(elem, dataName, valueField, textField) {
        if (!this.isValidXml()) return;
        elem = GetElem(elem); if (!elem) return;
        valueField = GetStr(valueField, null); textField = GetStr(textField, null);
        if (!valueField || !textField) return;
        var nodes = this.data.documentElement.selectNodes("/root/" + dataName + "//items/item");
        var nodeValue; var nodeText;
        try {
            for (var i = 0; i < nodes.length; i++) {
                nodeValue = nodes[i].selectSingleNode(valueField).text;
                nodeText = nodes[i].selectSingleNode(textField).text;
                AddSelectItem(elem, nodeValue, nodeText, -1, false);
            }
        } catch (e) { }
    }
}

////////////////////////////////////////////////////////////////////////////////////////// Jx Grid

var g_jxgrids = [];
var g_jxgrid_xslUrl = "/krswebui/js/grid.xsl";
var g_jxgrid_xslDOM = null;

function jxgrid(contrElem, dataObj, fmtSrc, gridId, dataName) {
    // GRID 相关
    this.contrElem = contrElem;     // GRID容器或容器ID
    this.dataObj = dataObj;         // GRID数据(JxData)对象
    this.fmtSrc = fmtSrc;           // GRID格式源(URL或XML元素的ID)
    this.gridId = gridId;           // 引用格式源XmlDOM中的某一个子格式
    this.dataName = dataName;
    this.fmtObj = null;
    this.pagerObj = null;
    this.pageSizeArr = [10, 20, 30, 50, 100];
    this.onAllready = null;

    // 将对象置于全局对象数据,并返回引用
    this.idx_in_grids = g_jxgrids.push(this) - 1;
    return g_jxgrids[this.idx_in_grids];
}
jxgrid.prototype = {
    load: function() {
        var contr = GetElem(this.contrElem); if (!contr) return;
        var html = this.getHtml(); if (html == null) html = "转换为HTML时失败!";
        contr.innerHTML = html; var dataInfo = this.dataObj.getSubDataInfo(this.dataName); if (!dataInfo) return;
        this.pagerObj = new jxpager(this.gridId + "$pager", dataInfo.pageIndex, dataInfo.pageSize,
            dataInfo.recordCount, "g_jxgrids[" + this.idx_in_grids + "].onGridPager();", this.pageSizeArr);
        this.pagerObj.load(); return;
    },
    reload: function() {
        this.fmtObj.reload();
        this.load();
    },
    getCell: function(srcElem) {
        return GetElemUP(srcElem, "name", "grid_td");
    },
    getRow: function(srcElem) {
        return GetElemUP(srcElem, "name", "grid_tr");
    },
    getRowInfo: function(srcElem) {
        srcElem = this.getRow(srcElem);
        var grid = GetElemUP(srcElem, "name", "grid"); if (!IsElem(grid)) return null;
        var dataName = grid.getAttribute("dataName"); if (!dataName) return null;
        var iPos = srcElem.getAttribute("datapos");
        return this.dataObj.getItem(dataName, iPos);
    },
    getPageIndex: function() {
        if (!this.pagerObj) return -1;
        return this.pagerObj.pageIndex;
    },
    getPageSize: function() {
        if (!this.pagerObj) return -1;
        return this.pagerObj.pageSize;
    },
    getOrderBy: function() {
        return GetElemValue(this.gridId + "$orderby");
    },
    setPageIndex: function(_pageIndex) {
        if (this.pagerObj)
            this.pagerObj.pageIndex = _pageIndex;
    },
    onGridOrder: function(dataField) {
        SetElemValue(this.gridId + "$orderby", dataField)
        this.onGridChanged();
    },
    onGridPager: function(pageIndex, pageSize) {
        this.onGridChanged();
    },
    onGridChanged: function() {
        alert("重写jxgrid.onGridChanged方法可实现重新请求数据.\n\nthis.getOrderBy:\t" +
            this.getOrderBy() + "\nthis.getPageIndex:\t" +
            this.getPageIndex() + "\nthis.getPageSize:\t" + this.getPageSize());
    },

    // 辅助方法
    // 此类方法一般不会被程序员直接调用
    loadFmt: function(src) {
        if (arguments.length == 1) {
            this.fmtSrc = src;
        }
        if (IsStr(this.fmtSrc)) { this.fmtObj = new jxgridfmt(this.fmtSrc); }
    },
    ensureFmt: function() {
        if (this.fmtObj == null) { this.loadFmt(); return; } else { return; }
    },
    getSubFmt: function(subId) {
        return this.fmtObj.getSubFmt(subId);
    },
    getFmtAttr: function(nodeId, attrName) {
        return this.fmtObj.getSugetFmtAttrbFmt(nodeId, attrName);
    },
    setFmtAttr: function(nodeId, attrName, attrVal) {
        return this.fmtObj.setFmtAttr(nodeId, attrName, attrVal);
    },
    addFmtNode: function(nodeId, addPos, parentNodeId, nodeTag) {
        return this.fmtObj.addFmtNode(nodeId, addPos, parentNodeId, nodeTag);
    },
    delFmtNode: function(nodeId) {
        return this.fmtObj.delFmtNode(nodeId);
    },
    getHtml: function() {
        this.ensureFmt();
        if (this.dataObj == null || this.fmtObj == null) return null;
        if (IsFunction(this.onAllready)) { this.onAllready(); }
        var dataxml = this.dataObj.getData(); var fmtxml = this.fmtObj;
        if (fmtxml.fmtXml) {
            if (IsStr(this.gridId)) { fmtxml = this.getSubFmt(this.gridId); }
            else { fmtxml = fmtxml.fmtXml; }
        } else { return; } if (fmtxml == null) return;
        if (IsStr(dataxml)) { dataxml = this.getValidDataXml(dataxml); }
        var node = fmtxml.selectNodes("//gridfmt")[0];
        node.setAttribute("GridObjName", "g_jxgrids[" + this.idx_in_grids + "]");
        node.setAttribute("DataName", this.dataName);
        try {
            var ret = LoadDOMXmlStr(fmtxml.transformNode(this.getGridXsl()));
            if (ret.parseError.errorCode != 0) { alert(ret.parseError.reason); return null; }
            ret = dataxml.transformNode(ret); return ret;
        } catch (e) { return null; }
    },
    getValidDataXml: function(dataXml) {
        if (typeof (dataXml) == "string") dataXml = LoadDOMXmlStr(dataXml);
        if (!dataXml || !dataXml.xml) dataXml = LoadDOMXmlStr("<root/>");
        return dataXml;
    },
    getGridXsl: function() {
        if (g_jxgrid_xslDOM) { return g_jxgrid_xslDOM; } g_jxgrid_xslDOM = LoadDOMXmlFile(g_jxgrid_xslUrl);
        if (g_jxgrid_xslDOM == null || g_jxgrid_xslDOM.parseError.errorCode != 0) { alert("Grid Xsl 获取失败."); return null; }
        return g_jxgrid_xslDOM;
    }
}

// -----------------------------------------------
// Jx Grid Fmt Obj
// -----------------------------------------------

var g_jxgridfmtSrcs = [];
var g_jxgridfmts = [];

function jxgridfmt(fmtSrc) {
    this.fmtSrc = fmtSrc;
    this.fmtXml = null;

    // this.fmtXml
    var idx = g_jxgridfmtSrcs.indexOf(this.fmtSrc);
    if (idx < 0) {
        if (typeof (this.fmtSrc) != "object") {
            this.fmtSrc = GetStr(this.fmtSrc, null); if (!this.fmtSrc) return null;
            if (this.fmtSrc.indexOf(".") > 0) { this.fmtXml = LoadDOMXmlFile(this.fmtSrc); }
            else if (this.fmtSrc.indexOf("<") > -1) { this.fmtXml = LoadDOMXmlStr(this.fmtSrc); }
            else { var fmtElem = GetElem(this.fmtSrc); if (!fmtElem) { return null; } this.fmtXml = LoadDOMXmlStr(fmtElem.innerHTML); }
        }
        else { this.fmtXml = this.fmtSrc; }
        if (this.fmtXml == null || this.fmtXml.parseError.errorCode != 0) { this.fmtXml = null; }
    }
    else { return g_jxgridfmts[idx]; }

    // 将对象置于全局对象数据,并返回引用
    this.idx_in_jxgridfmtSrcs = g_jxgridfmtSrcs.push(this.fmtSrc) - 1;
    g_jxgridfmts[this.idx_in_jxgridfmtSrcs] = this;
    return g_jxgridfmts[this.idx_in_jxgridfmts];
}

jxgridfmt.prototype = {
    reload: function() {
        if (typeof (this.fmtSrc) != "object") {
            this.fmtSrc = GetStr(this.fmtSrc, null); if (!this.fmtSrc) return null;
            if (this.fmtSrc.indexOf(".") > 0) { this.fmtXml = LoadDOMXmlFile(this.fmtSrc); }
            else if (this.fmtSrc.indexOf("<") > -1) { this.fmtXml = LoadDOMXmlStr(this.fmtSrc); }
            else { var fmtElem = GetElem(this.fmtSrc); if (!fmtElem) { return null; } this.fmtXml = LoadDOMXmlStr(fmtElem.innerHTML); }
        }
        else { this.fmtXml = this.fmtSrc; }
        if (this.fmtXml == null || this.fmtXml.parseError.errorCode != 0) { this.fmtXml = null; }
    },
    getSubFmt: function(subId) {
        if (this.fmtXml == null) return null;
        var subFmt = this.fmtXml.cloneNode(true);
        var par = subFmt.documentElement.selectSingleNode("/root");
        var grids = subFmt.documentElement.selectNodes("/root/gridfmt");
        for (i = 0; i < grids.length; i++) {
            if (grids[i].getAttribute("id") != subId) { par.removeChild(grids[i]); }
        }
        return subFmt;
    },
    getFmtAttr: function(nodeId, attrName) {
        if (this.fmtXml == null) return null;
        var root = this.fmtXml.documentElement.selectSingleNode("//*[@id='" + nodeId + "']");
        if (!root) { return null; }
        switch (attrName) {
            case "DataTemplate": var r = root.selectSingleNode("DataTemplate");
                if (!r) { return null; } return r.text; break;
            case "HeaderTemplate": var r = root.selectSingleNode("HeaderTemplate");
                if (!r) { return null; } return r.text; break;
            default: return root.getAttribute("attrName"); break;
        }
    },
    setFmtAttr: function(nodeId, attrName, attrVal) {
        if (this.fmtXml == null) return false;
        var root = this.fmtXml.documentElement.selectSingleNode("//*[@id='" + nodeId + "']");
        if (!root) { return false; }
        switch (attrName) {
            case "DataTemplate": var r = root.selectSingleNode("DataTemplate");
                if (!r) { return false; }
                var dtNode = this.fmtXml.createCDATASection(attrVal);
                r.text = "";
                r.appendChild(dtNode); return true; break;
            case "HeaderTemplate": var r = root.selectSingleNode("HeaderTemplate");
                if (!r) { return false; } var dtNode = this.fmtXml.createCDATASection(attrVal);
                r.appendChild(dtNode); return true; break;
            default: root.setAttribute(attrName, attrVal); return true; break;
        }
    },
    addFmtNode: function(nodeId, addPos, parentNodeId, nodeTag) {
        if (this.fmtXml == null) return null;
        var parNode = this.fmtXml.documentElement.selectSingleNode("//*[@id='" + parentNodeId + "']");
        if (!parNode) { return null; }
        if (nodeTag) { var n = this.fmtXml.createNode(1, nodeTag, ""); }
        else { var n = this.fmtXml.createNode(1, "Column", ""); }
        var node = parNode.insertBefore(n, parNode.childNodes[addPos]);
        node.setAttribute("id", nodeId);
        return node;
    },
    delFmtNode: function(nodeId) {
        if (this.fmtXml == null) return true;
        var root = this.fmtXml.documentElement.selectSingleNode("//*[@id='" + nodeId + "']");
        if (!root) { return true; } root.parentNode.removeChild(root); return true;
    }
}


////////////////////////////////////////////////////////////////////////////////////////// Jx Pager

g_jxpagers = [];

function jxpager(toElem, pageIndex, pageSize, recordCount, strOnPageChangedEvent, pageSizeArr) {
    this.toElem = toElem;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.recordCount = recordCount;
    this.strOnPageChangedEvent = strOnPageChangedEvent;
    this.pageSizeArr = (IsArr(pageSizeArr)) ? pageSizeArr : [10, 20, 30, 50, 100];

    // 将对象置于全局对象数据,并返回引用
    this.idx_in_pagers = g_jxpagers.push(this) - 1;
    return g_jxpagers[this.idx_in_pagers];
}
jxpager.prototype = {
    isReady: function() {
        this.toElem = GetElem(this.toElem); if (!this.toElem) return false;
        return true;
    },
    load: function() {
        if (!this.isReady()) return false;
        this.pageIndex = GetNum(this.pageIndex, 1);
        this.pageSize = GetNum(this.pageSize, 20);
        this.recordCount = GetNum(this.recordCount, 0);
        var pageCount = Math.ceil(this.recordCount / this.pageSize);

        var pages = '<div class="sp_box" onclick="if(g_jxpagers[' + this.idx_in_pagers + '].onPageBeforeChanged()){' + this.strOnPageChangedEvent + '}">';
        if (this.pageIndex > 3) pages += '<div class="sp_pg">1</div>';
        if (this.pageIndex > 4) pages += '<div class="sp_no">...</div>';
        for (var i = ((this.pageIndex < 4) ? 1 : (this.pageIndex - 2)); i < (this.pageIndex + 3) && i <= pageCount; i++) {
            if (i == this.pageIndex) pages += '<div class="sp_cu">' + i + '</div>';
            else pages += '<div class="sp_pg">' + i + '</div>';
        }
        if (this.pageIndex < pageCount - 3) pages += '<div class="sp_no">...</div>';
        if (this.pageIndex < pageCount - 2) pages += '<div class="sp_pg">' + pageCount + '</div>';
        pages += '</div>';

        var html = '<table cellpadding="0" cellspace="0" class="sp"><tr><td>' +
            '<input type="hidden" id="pager_index" value="{0}" /><input type="hidden" id="pager_size" value="{1}" />' +
            '共<span>{2}</span><span id="spn_flag">条</span>记录,分<span>{3}</span>页显示,每页显示:';
        if (!IsArr(this.pageSizeArr) || this.pageSizeArr.length < 1) html += '<span>{1}<span>';
        else {
            html += '<select class="sp_slt" onchange="g_jxpagers[' + this.idx_in_pagers + '].onPageBeforeChanged(true);' + this.strOnPageChangedEvent + '">';
            for (var i = 0; i < this.pageSizeArr.length; i++) {
                html += '<option value="' + this.pageSizeArr[i] + '" ' + ((this.pageSizeArr[i] == this.pageSize) ? 'selected' : '') + '>' + this.pageSizeArr[i] + '</option>';
            }
            html += '</select>';
        }
        html += '</td><td>' + pages + '</td></tr></table>';

        html = html.format(this.pageIndex, this.pageSize, this.recordCount, pageCount);
        this.toElem.innerHTML = html;
    },
    onPageBeforeChanged: function(isSize) {
        var elem = event.srcElement;
        if (isSize) {
            this.pageSize = elem.value;
        }
        else {
            switch (elem.className) {
                case "sp_box": case "sp_no": case "sp_cu": return false; break;
                default: this.pageIndex = GetInt(elem.innerText, -1); break;
            }
            return true;
        }
        this.pageIndex = 1;
    }
}
//========================================================================================jxpagerSingle

function jxpagerSingle(toElem, pageIndex, pageSize, recordCount, strOnPageChangedEvent, pageSizeArr, model) {
    this.toElem = toElem;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.recordCount = recordCount;
    this.strOnPageChangedEvent = strOnPageChangedEvent;
    this.pageSizeArr = (IsArr(pageSizeArr)) ? pageSizeArr : [6, 8, 10, 20, 30, 50, 100];
    this.model = model;

    // 将对象置于全局对象数据,并返回引用
    this.idx_in_pagers = g_jxpagers.push(this) - 1;
    return g_jxpagers[this.idx_in_pagers];
}
jxpagerSingle.prototype = {
    isReady: function() {
        this.toElem = GetElem(this.toElem); if (!this.toElem) return false;
        return true;
    },
    load: function() {
        if (!this.isReady()) return false;
        this.pageIndex = GetNum(this.pageIndex, 1);
        this.pageSize = GetNum(this.pageSize, 10);
        this.recordCount = GetNum(this.recordCount, 0);
        this.pageCount = Math.ceil(this.recordCount / this.pageSize);
        var pages = '<div class="sp_box1" onclick="if(g_jxpagers[' + this.idx_in_pagers + '].onPageBeforeChanged()){' + this.strOnPageChangedEvent + '}">';
        pages += "<div title='首页' class=";
        pages += this.pageIndex == 1 ? "sp_start_cu" : "sp_start";
        pages += ">首</div>";
        pages += "<div title='上一页' class=";
        pages += this.pageIndex == 1 ? "sp_pr_cu" : "sp_pr";
        pages += ">上</div>";
        pages += "<div title='下一页' class=";
        pages += this.pageIndex == this.pageCount ? "sp_nx_cu" : "sp_nx";
        pages += ">下</div>";
        pages += "<div title='尾页' class=";
        pages += this.pageIndex == this.pageCount ? "sp_end_cu" : "sp_end";
        pages += ">尾</div>";
        pages += '</div>';
        var html = '';
        if (this.model == "1") {
            html += '<table cellpadding="0" cellspace="0" style="height:60px" class="sp"><td width=30% align="left">共<span>{0}条</span></td><td width=70% align="left">' + pages + '</td><tr>';
            html += '<td colspan="2"  align="left">' +
            '<input type="hidden" id="pager_index" value="{1}" /><input type="hidden" id="pager_size" value="{2}" />' +
            '每页：';
            if (!IsArr(this.pageSizeArr) || this.pageSizeArr.length < 1) html += '<span>{1}<span>条';
            else {
                html += '<select class="sp_slt" onchange="g_jxpagers[' + this.idx_in_pagers + '].onPageBeforeChanged(true);' + this.strOnPageChangedEvent + '">';

                for (var i = 0; i < this.pageSizeArr.length; i++) {
                    html += '<option value="' + this.pageSizeArr[i] + '" ' + ((this.pageSizeArr[i] == this.pageSize) ? 'selected' : '') + '>' + this.pageSizeArr[i] + '</option>';
                }
                html += '</select>，第<input type="text" id ="' + this.toElem.id + '_ipt_index" onkeydown ="" class="sp_txt" value ="{1}"/>/{3}页';
                html += "<a herf='javascript:void(0);' style='cursor:hand;' onclick ='g_jxpagers[" + this.idx_in_pagers + "].onPageBeforeChanged(false);" + this.strOnPageChangedEvent + "' >跳转</a>"
            }
            html += '</td></tr></table>';
            html = html.format(this.recordCount, this.pageIndex, this.pageSize, this.pageCount);
        }
        else {
            html = '<table cellpadding="0" cellspace="0" class="sp"><tr><td width=30% align="left">共<span>{0}</span><span id="spn_flag">条</span>记录</td><td width=40% align="center">' + pages + '</td>';
            html += '<td width=30% align="right">' +
            '<input type="hidden" id="pager_index" value="{1}" /><input type="hidden" id="pager_size" value="{2}" />' +
            '每页：';
            if (!IsArr(this.pageSizeArr) || this.pageSizeArr.length < 1) html += '<span>{1}<span>条';
            else {
                html += '<select class="sp_slt" onchange="g_jxpagers[' + this.idx_in_pagers + '].onPageBeforeChanged(true);' + this.strOnPageChangedEvent + '">';

                for (var i = 0; i < this.pageSizeArr.length; i++) {
                    html += '<option value="' + this.pageSizeArr[i] + '" ' + ((this.pageSizeArr[i] == this.pageSize) ? 'selected' : '') + '>' + this.pageSizeArr[i] + '</option>';
                }
                html += '</select>，共<span>{3}</span>页，第<input type="text" id ="' + this.toElem.id + '_ipt_index" onkeydown ="" class="sp_txt" value ="{1}"/>页';
                html += "<a herf='javascript:void(0);' style='cursor:hand;' onclick ='g_jxpagers[" + this.idx_in_pagers + "].onPageBeforeChanged(false);" + this.strOnPageChangedEvent + "' >跳转</a>"
            }
            html += '</td></tr></table>';
            html = html.format(this.recordCount, this.pageIndex, this.pageSize, this.pageCount);
        }
        this.toElem.innerHTML = html;
    },
    onPageBeforeChanged: function(isSize) {
        var elem = event.srcElement;
        if (isSize) {
            this.pageSize = elem.value;
        }
        else {
            switch (elem.className) {
                case "sp_box": case "sp_box1": case "sp_no": case "sp_cu": case "sp_start_cu": case "sp_pr_cu": case "sp_nx_cu": case "sp_end_cu": return false; break;
                case "sp_pr":
                    if (this.pageIndex > 1) {
                        this.pageIndex = this.pageIndex - 1;
                    }
                    break;
                case "sp_nx":
                    if (this.pageIndex < GetInt(this.pageCount, -1)) {
                        this.pageIndex = this.pageIndex + 1;
                    }
                    break;

                case "sp_start": return this.pageIndex = 1; break;
                case "sp_end": return this.pageIndex = GetInt(this.pageCount, -1); break;
                default:
                    this.pageIndex = GetInt(GetElemValue(this.toElem.id + '_ipt_index'), -1);
                    if (this.pageIndex > this.pageCount)
                        this.pageIndex = this.pageCount;
                    break;
            }
            return true;
        }
        this.pageIndex = 1;
    }
}

////////////////////////////////////////////////////////////////////////////////////////// 界面通用方法

function OpenFrm(frameId, frameUrl) {
    // 打开(或新开)框架窗口
    top.OpenFrame(frameId, frameUrl, this.window);
}
function CloseFrm(frameId) {
    // 关闭指定框架窗口,frameId为空时关闭当前窗口
    top.CloseFrame(frameId);
}
function SetFrmTitle(frm_title) {
    // 设置当前框架窗口的标题
    top.SetFrameTitle(window.name, frm_title);
}
function SetNav(title, desc) {
    // 输出一个导航条 <div class="nav_help" title="帮助" onclick="OpenFrm(\'_blank\',\'http://localhost/krswebui/help/\');"></div>
    var html = '<div class="nav"><div class="nav_title">' + title + '</div><div class="nav_desc">' + desc + '</div></div>';
    if (this.frameElement && this.frameElement.className == "main_frm") {
        top.SetFrame(window.name, title, desc);
    }
    Wrt(html);
}

function SetPager(toElem, pageIndex, pageSize, recordCount, onPagerClickEvent) {
    // 将一个翻页条置入指定位置。
    toElem = GetElem(toElem); if (!toElem) return false;
}
function OnPagerClick() {
    var elem = event.srcElement;
    switch (elem.className) {
        case "sp_box": case "sp_no": case "sp_cu": break;
        default: OnSpChanged(src, "index", elem.innerText); break;
    }
}

////////////////////////////////////////////////////////////////////////////////////////// Body.Onclick & ESC

// BODY.ONCLICK事件时发生
var m_currPopup = [];
var m_currPopupEvent = [];
document.onclick = function() {
    var popElemId;
    var srcElem = event.srcElement;
    for (var i = m_currPopup.length - 1; i > -1; i--) {
        popElemId = m_currPopup[i];
        while (srcElem && srcElem.id != popElemId) {
            srcElem = srcElem.parentElement;
            if (!srcElem) break;
        }
        if (!srcElem || srcElem.id != popElemId) {
            SetDisplay(popElemId, "none");
            m_currPopup.pop();
            try { eval(m_currPopupEvent[m_currPopupEvent.length - 1]); } catch (e) { }
            m_currPopupEvent.pop();
        }
    }
};
function AddPopupItem(elemId, evt) {
    window.setTimeout("m_currPopup.push('" + elemId + "');", 30);
    m_currPopupEvent.push(evt);
}
function RemovePopupItem(elemId) {
    while (m_currPopup.indexOf(elemId) > -1) {
        m_currPopupEvent.splice(m_currPopup.indexOf(elemId), 1);
        m_currPopup.splice(m_currPopup.indexOf(elemId), 1);
    }
}

// 用户点击ESC键事件 --取消按钮事件
var m_escEvents1 = [];
document.onkeydown = function() {
    if (event.keyCode == 27) {
        for (var i = 0; i < m_escEvents1.length; i++) {
            setTimeout(m_escEvents1[i], 0);
        }
        m_escEvents1 = [];
    }
    //退格键
    if (event.keyCode == 8) {
        if (event.srcElement.tagName.toLowerCase() != "input"
           && event.srcElement.tagName.toLowerCase() != "textarea")
            event.returnValue = false;
    }
}
function AddEscEvent(eventStr) {
    //RemoveEscEvent(eventStr);
    //m_escEvents1.push(eventStr);
}
function RemoveEscEvent(eventStr) {
    //    while (m_escEvents1.indexOf(eventStr) > -1) {
    //        m_escEvents1.splice(m_escEvents1.indexOf(eventStr), 1);
    //    }
}

////////////////////////////////////////////////////////////////////////////////////////// 布局美化 Edge3 & Sub3

// Edge边角HTML化{0}=ID,{1}=样式表,{2}=Style串,{3}=onmouseover事件,{4}=onmouseout事件,{5}=onclick事件,{6}=内部文字或HTML
var m_e03_html = '<table cellspacing="0" id="{0}" class="{1}" style="{2}" onmouseover="{3}" onmouseout="{4}" onclick="{5}">' +
    '<tr><td class="e03l"><div class="none" /></td><td class="e03m"><div id="{0}__cm">{6}</div></td>' +
    '<td class="e03r"><div class="none" /></td></tr></table>';

// 3列条HTML{1}=ID,{0}=样式表,{2}=主操作区,{3}=扩展区,{4}=副操作区)
var m_s03_html = '<table cellspacing="0" id="{0}" class="{1}"><tr><td class="s03_c1">{2}</td>' +
    '<td class="s03_c2">{3}</td><td class="s03_c3">{4}</td></tr></table>';

function GetE03(id, classname, style, onmouseover, onmouseout, onclick, innerhtml) {
    id = (!IsStr(id)) ? GetRd() : id;
    classname = (!IsStr(classname)) ? "e03" : classname;
    style = (!style || typeof (style) != "string") ? "" : style;
    onmouseover = (!IsStr(onmouseover)) ? "javascript:void(0);" : onmouseover;
    onmouseout = (!IsStr(onmouseout)) ? "javascript:void(0);" : onmouseout;
    onclick = (!IsStr(onclick)) ? "javascript:void(0);" : onclick;
    innerhtml = (!IsStr(innerhtml)) ? "" : innerhtml;
    return m_e03_html.format(id, classname, style, onmouseover, onmouseout, onclick, innerhtml);
}
function GetS03(id, classname, innerhtml, html2, html3) {
    id = (!IsStr(id)) ? GetRd() : id;
    classname = (!IsStr(classname)) ? "s03" : classname;
    innerhtml = (!IsStr(innerhtml)) ? "" : innerhtml;
    html2 = (!IsStr(html2)) ? "" : html2;
    html3 = (!IsStr(html3)) ? "" : html3;
    return m_s03_html.format(id, classname, innerhtml, html2, html3);
}

////////////////////////////////////////////////////////////////////////////////////////// Combo - ComboBox
// 说明:    应用ComboBox控件,首页应该在页面中申明一个具有id标识的Select,
//          且ComboApplied不等于"true". 在window.onload时,调用方法:SetCombo()
//          Combo的生成将以异步方式实现. 如果无需异步方式,可调用方法:SetComboEx()
function SetCombo() {
    window.setTimeout("SetComboEx();", 0);
}
function SetComboEx() {
    var combos = GetElemsByClassName("combo", document.documentElement);
    var nLen = combos.length;
    for (var i = 0; i < nLen; i++) {
        var e = combos[i];
        if (!e.id) e.id = "SetCombo_" + GetRd();
        if (e.getAttribute("ComboApplied") == "true") continue;
        e.setAttribute("ComboApplied", "true");
        // Objects
        var box = document.createElement("span");
        var ipt = document.createElement("input");
        var sbox = document.createElement("span");
        ipt.id = "combo_ipt__" + e.id;
        box.className = "combo_box";
        ipt.className = "combo_ipt";
        sbox.className = "combo_sbox";
        // Style
        var styleInfo = GetStyleInfo(e);
        ipt.style.width = styleInfo.width - styleInfo.height - 3 + "px";
        sbox.style.marginLeft = "-" + (styleInfo.width - styleInfo.height + 3) + "px";
        sbox.style.clip = "rect(" + 0 + "px " + styleInfo.width + "px " + (styleInfo.height + 1) + "px " + (styleInfo.width - styleInfo.height) + "px)";
        // Layout
        e.insertAdjacentElement("beforeBegin", box);
        box.insertAdjacentElement("afterBegin", sbox);
        sbox.insertAdjacentElement("afterBegin", e);
        box.insertAdjacentElement("afterBegin", ipt);
        // Events & Value
        var eEvent = e.onpropertychange; e.onpropertychange = null;
        if (e.options.length > 0)
            ipt.value = e.options[e.selectedIndex].text;
        //e.attachEvent("onpropertychange", eEvent);
        e.attachEvent("onpropertychange", PropChangeOnCombo);
        ipt.attachEvent("onchange", PropChangeOnIpt);
    }
}
function PropChangeOnCombo(o) {
    if (o.propertyName != "value") return;
    if (o.srcElement.selectedIndex > -1)
        SetElemValue("combo_ipt__" + o.srcElement.id, o.srcElement.options[o.srcElement.selectedIndex].text);
}
function PropChangeOnIpt(o) {
    var val = o.srcElement.value;
    var e = o.srcElement.id.toArray("__")[1];
    SetSelectItem(e, val, val, -1, true);
    GetElem(e).fireEvent("onchange");
}
function SetComboValue(elemId, val) {
    SetSelectItem(elemId, val, val, -1, true);
}
function GetComboValue(elemId) {
    return GetElemValue(elemId);
}

////////////////////////////////////////////////////////////////////////////////////////// Labbar

// Labbar定义
var labbar_classFlag = "lbr";

function LabbarObj(LabbarObjName, contrElemId) {
    // Labbar(标签栏)对象
    if (!LabbarObjName) alert("程序错误: 请传入你为该Labbar对象定义的名称.");
    this.id = LabbarObjName;
    this.Labs = [];
    this.CurrentLabId = null;
    this.ContrElemId = contrElemId;
    this.IsLoaded = false;
    this.ShowDispBtn = true;

    this.DivClickEvent = null;

    this.AddLab = function(labId, blockId, labText, isHidden, strBeforeClickEvent, strAfterClickEvent) {
        if (this.IsLoaded) { alert("程序错误: 己装载的Labbar不能再增加Lab."); return false; }
        if (!labId) { alert("程序错误: 请指定Lab的标识."); return false; }
        if (!strBeforeClickEvent) strBeforeClickEvent = "";
        if (!strAfterClickEvent) strAfterClickEvent = "";
        this.Labs.push({ labId: labId, blockId: blockId, labText: labText, isHidden: isHidden, strBeforeClickEvent: strBeforeClickEvent, strAfterClickEvent: strAfterClickEvent });
        return true;
    };
    this.GetLab = function(labId) {
        if (!labId) labId = this.CurrentLabId;
        var fstEnLab = null;
        for (var i = 0; i < this.Labs.length; i++) {
            if (this.Labs[i].labId == labId) { return this.Labs[i]; }
            else if (!this.Labs[i].isHidden && !fstEnLab) { fstEnLab = this.Labs[i]; }
        }
        if (this.Labs.length > 0) return fstEnLab;
        return null;
    };
    this.SetLab = function(labId, blockId, labText, isHidden) {
        var labObj = this.GetLab(labId);
        if (!labObj) return false;
        if (blockId) labObj.blockId = blockId;
        if (labText) labObj.labText = labText;
        if (isHidden == true || isHidden == false) labObj.isHidden = isHidden;
        if (this.IsLoaded) {
            var labElem = GetElem(labObj.labId);
            var labElemMain = GetElem(labObj.labId + "__cm")
            if (!labElem || !labElemMain) return false;
            if (isHidden == true) labElem.style.display = "none"; else if (isHidden == false) labElem.style.display = "block";
            if (labText) labElemMain.innerHTML = labText;
        }
    };

    this.Load = function(isReturnHtml) {
        var labObj = this.GetLab(); if (!labObj) return;
        this.CurrentLabId = labObj.labId;
        var strOnClick = "javascript:{0}.Open('{1}');";
        var strOnClickTemp = "";
        var strOnMOver = "javascript:void(0);";
        var strOnMOut = "javascript:void(0);";
        var classFlagTemp = "";
        var styleCode = "display:{0};";
        var styleCodeTemp = "";
        var labHtml = "";
        var dispHtml = (this.ShowDispBtn) ? '<div id="' + this.id + '__disp" class="' + labbar_classFlag + '_none" title="隐藏区块内容" onclick="javascript:' + this.id + '.Disp();"></div>' : "";
        var html = "";
        for (var i = 0; i < this.Labs.length; i++) {
            strOnClickTemp = strOnClick.format(this.id, this.Labs[i].labId);
            classFlag = labbar_classFlag + ((this.Labs[i].labId == this.CurrentLabId) ? "_on" : "_no");
            styleCodeTemp = (this.Labs[i].isHidden) ? styleCode.format("none") : styleCode.format("block");
            html += GetE03(this.Labs[i].labId, classFlag, styleCodeTemp, strOnMOver, strOnMOut, strOnClickTemp, this.Labs[i].labText);
        }
        html = GetS03('', 'lbr_s', html, '', dispHtml);
        //lab增加id by qiubaosheng
        html = GetE03(LabbarObjName + "_" + this.CurrentLabId, labbar_classFlag, "", "javascript:void(0);", "javascript:void(0);", "javascript:void(0);", html);

        if (this.ContrElemId && !isReturnHtml) { var e = GetElem(this.ContrElemId); if (e) e.innerHTML = html; this.IsLoaded = true; }
        else if (!isReturnHtml) { Wrt(html); this.IsLoaded = true; }
        else { return html; }
    };


    this.temp = function() {
        document.getElementById("l1_cm").value = "基本原理";
    }
    this.Open = function(labId) {
        var labObj = this.GetLab(labId);
        if (!labObj) return false;
        if (labObj.strBeforeClickEvent) try { eval(labObj.strBeforeClickEvent); } catch (e) { }
        if (labObj.blockId) {
            var oldLabObj = this.GetLab(this.CurrentLabId);
            if (this.CurrentLabId == labObj.labId) {//edit by qbs 20121203 区域块为当前块时不需要隐藏再显示
                SetDisplay(labObj.blockId, "block"); SetClass(labObj.labId, labbar_classFlag + "_on");
                return true;
            }
            if (oldLabObj) { if (oldLabObj.blockId) SetDisplay(oldLabObj.blockId, "none"); SetClass(oldLabObj.labId, labbar_classFlag + "_no"); }
            SetDisplay(labObj.blockId, "block"); SetClass(labObj.labId, labbar_classFlag + "_on");
            this.CurrentLabId = labObj.labId;
        }
        if (labObj.strAfterClickEvent) try { eval(labObj.strAfterClickEvent); } catch (e) { }
        //edit by qbs 20130929 注册点击事件
        if (this.DivClickEvent != null) { this.DivClickEvent(labId); }
        return true;
    };
    this.Close = function(labId) {
        var labObj = this.GetLab(labId);
        if (!labObj) return false;
        if (labObj.blockId) {
            SetDisplay(labObj.blockId, "none");
        }
        return true;
    };
    this.Disp = function() {
        var labObj = this.GetLab(this.CurrentLabId);
        if (!labObj) return false;
        if (labObj.blockId) SetDisplay(labObj.blockId);
        if (GetElem(labObj.blockId).style.display == "block") {
            SetClass(this.id + "__disp", labbar_classFlag + "_none");
        }
        else {
            SetClass(this.id + "__disp", labbar_classFlag + "_block");
        }
    };
}

////////////////////////////////////////////////////////////////////////////////////////// 对话框与提示框

var m_dlgTimeoutInstance = "";

function InitDlg(layerFlag) {
    if (GetElem("g_dlg__" + layerFlag)) return;
    layer = GetNum(layerFlag, 0);
    var html = '<iframe id="g_mask__{0}" class="mask" style="z-index:{1};" frameborder="0"></iframe><div id="g_dlg__{0}" class="dlg" style="z-index:{1};top:150px; left:150px;"><a id="g_dlg_fh__{0}" href="#"></a>';
    html += '<table class="dlg_b dlg_ifm" cellspacing="0" cellpadding="0"><tr id="g_dlg_hd__{0}"><td><table class="dlg_hd" cellspacing="0" cellpadding="0"><tr>';
    html += '<td class="dlg_hdl" onmousedown="DragMDown(\'g_dlg__{0}\',[\'g_dlg_bdb__{0}\',\'g_dlg_bdi__{0}\'])"><div></div></td><td id="g_dlg_hdt__{0}" class="dlg_hdt" onmousedown="DragMDown(\'g_dlg__{0}\',[\'g_dlg_bdb__{0}\',\'g_dlg_bdi__{0}\'])"></td><td><div id="g_dlg_hdc__{0}" class="dlg_hdc"></div></td><td class="dlg_hdr"><div></div></td></tr>';
    html += '</table></td></tr><tr><td id="g_dlg_bd__{0}" class="dlg_bd"><table id="g_dlg_bdb__{0}" cellspacing="0" cellpadding="0" class="dlg_bdb"><tr><td id="g_dlg_bdt__{0}"></td></tr></table>';
    html += '<iframe id="g_dlg_bdi__{0}" class="dlg_dbi" style="display:none;" frameborder="0" src="about:blank"></iframe></td></tr><tr id="g_dlg_op__{0}"><td id="g_dlg_opb__{0}" class="dlg_op"></td></tr></table></div>';
    html = html.format(layerFlag, (layer + 1000));
    document.body.insertAdjacentHTML("afterBegin", html);
}
function CloseDlg(layerFlag) {
    window.clearTimeout(m_dlgTimeoutInstance);
    layerFlag = GetStr(layerFlag, "0");
    ClearMask(layerFlag);
    var dlg = GetElem("g_dlg__" + layerFlag);
    var cont = GetElem("g_dlg_bdt__" + layerFlag);
    var ifrm = GetElem("g_dlg_bdi__" + layerFlag);
    if (!dlg) return;
    var elem = dlg.getAttribute("byelem");
    if (elem) {
        elem = GetElem(elem);
        if (elem) elem.insertAdjacentElement("afterBegin", cont.childNodes[0]);
    }
    ifrm.src = "about:blank";
    dlg.removeAttribute("byelem");
    SetDisplay(dlg, "none");
}
function OnDlgCloseBtn(event) {
    window.setTimeout(event, 0);
}
function ClearMask(layerFlag) {
    SetDisplay("g_mask__" + layerFlag, "none");
}
function ShowMask(elem, layerFlag) {
    var mask = GetElem("g_mask__" + layerFlag);
    var elem = GetElem(elem);
    var styleInfo = null;
    if (typeof (elem) == "object" && elem != null) { styleInfo = GetStyleInfo(elem); }
    else { styleInfo = GetStyleInfo(document.body); }
    mask.style.width = styleInfo.scrollWidth + "px";
    mask.style.height = styleInfo.scrollHeight + "px";
    mask.style.top = styleInfo.top + "px";
    mask.style.left = styleInfo.left + "px";
    SetDisplay(mask, "block");
}
function ShowDlg(sType, sTitle, sCont, showProp, showBtns, clearDlgTime, layerFlag) {
    // 显示对话框
    // sType: 对话框类型 
    //      (iframe=显示一个iframe在对话框中,sCont应为url,并将该url加载到iframe)
    //      (byelem=内容来自本页面的一个元素,对话框将把该元素的内部元素加入到对话框)
    //      (info/ask/alert/none=消息的类型:分别显示i/?/!等图标,none表示不显示图标)
    //      (在类型后加上"-0"表示不显示MASK)
    // sTitle: 对话框的标题 (null或""表示默认/"no"表示不显示/...)
    // sCont: 内容
    // showProp: 显示属性,可以为空表示默认.格式:[width,height[,postion]]
    //      (postion:可以为空,表示默认的居中,也可以为某个控件的ID,程序将使对话框靠近该控件)
    // showBtns: 按钮组,空或""表示不显示,格式如:[[0/1:"alert('close?')"],["ok","alert('ok')"],["no"]]
    //      (格式中第一个元素表示标题栏的关闭按钮是否禁用,0=正常,1=禁用)
    // clearDlgTime: 自动关闭对话框的秒钟数，0为不自动关闭
    // layerFlag: 分层对话框标识(默认为0,可数字化变量将作为对话框的z-index,程序处理+1000)
    layerFlag = GetStr(layerFlag, "0"); InitDlg(layerFlag);
    var dlg = GetElem("g_dlg__" + layerFlag); if (dlg.style.display == "block") CloseDlg(layerFlag);
    sType = GetStr(sType, "info"); var sTypeEx = "1"; if (sType.indexOf("-") > 0) { sType = sType.toArray("-"); sTypeEx = sType.getValue(1); sType = sType.getValue(0); }
    sTitle = (sTitle == "" || !sTitle) ? "温馨提示" : sTitle;
    sCont = (!sCont) ? "请确认操作？" : sCont;
    if (!(typeof (showProp) == "object" && showProp != null && showProp.length > 1)) { showProp = [300, 160]; }
    var width = (showProp[0] < 100) ? 100 : showProp[0];
    var height = (showProp[1] < 30) ? 30 : showProp[1];
    var pos = GetStr(showProp.getValue(2), "");
    if (typeof (showBtns) != "object" || showBtns.length < 1) showBtns = [[0, 'CloseDlg("' + layerFlag + '")']];
    if (showBtns[0].length < 2) showBtns[0].push("CloseDlg('" + layerFlag + "')");
    if (!showBtns[0][1]) showBtns[0][1] = "CloseDlg('" + layerFlag + "')";
    clearDlgTime = (parseInt(clearDlgTime) < 0 || isNaN(parseInt(clearDlgTime))) ? 0 : parseInt(clearDlgTime);
    var styleInfo = GetStyleInfo(document.documentElement);
    width = (width > styleInfo.screenWidth - 100) ? (styleInfo.screenWidth - 100) : (width);
    height = (height > styleInfo.screenHeight - 100) ? (styleInfo.screenHeight - 100) : (height);
    // elems & reset
    var hd = GetElem("g_dlg_hd__" + layerFlag); var hdt = GetElem("g_dlg_hdt__" + layerFlag); var hdc = GetElem("g_dlg_hdc__" + layerFlag);
    var bd = GetElem("g_dlg_bd__" + layerFlag); var bdb = GetElem("g_dlg_bdb__" + layerFlag); var bdt = GetElem("g_dlg_bdt__" + layerFlag);
    var bdi = GetElem("g_dlg_bdi__" + layerFlag); var op = GetElem("g_dlg_op__" + layerFlag); var opb = GetElem("g_dlg_opb__" + layerFlag);
    SetClass(dlg, "dlg"); SetDisplay(hd, "block"); hdt.innerHTML = ""; SetDisplay(hdc, "block");
    SetDisplay(bdb, "block"); bdt.innerHTML = ""; SetDisplay(bdi, "none"); bdi.src = "about:blank";
    SetDisplay(op, "block"); opb.innerHTML = "";
    // sType & sCont & sTitle & showBtns
    AppClass(dlg, "dlg_type_" + sType);
    switch (sType) {
        case "iframe": SetDisplay(bdb, "none"); SetDisplay(bdi, "block");
            sCont = (sCont.indexOf("?") > 0) ? sCont + "&" : sCont + "?"; sCont += "rdn=" + GetRd(); bdi.src = sCont; break;
        case "byelem": dlg.setAttribute("byelem", sCont); var elem = GetElem(sCont); if (elem) bdt.appendChild(elem.childNodes[0]); break;
        default: bdt.innerHTML = sCont; break;
    }
    if (sTitle == "no") { SetDisplay(hd, "none"); } else { SetDisplay(hd, "block"); hdt.innerHTML = sTitle; }
    if (showBtns[0][0] + "" == "1") { SetDisplay(hdc, "none"); }
    else { AddEscEvent(showBtns[0][1]); hdc.onclick = function() { OnDlgCloseBtn(showBtns[0][1]); }; }
    if (showBtns.length > 1) {
        var btnsHtml = "";
        for (var i = 1; i < showBtns.length; i++) {
            if (showBtns[i].length > 1) {
                btnsHtml += "<input type=\"button\" value=\"" + showBtns[i][0] + "\" class=\"btn\" onclick=\"" + showBtns[i][1] + "\"/>";
            }
        }
        opb.innerHTML = btnsHtml;
    }
    else { op.style.display = "none"; }
    // width & height & position & mask & show
    bdb.style.width = width + "px"; bdb.style.height = height + "px";
    bdi.style.width = width + "px"; bdi.style.height = height + "px";
    dlg.style.visibility = "hidden";
    SetDisplay(dlg, "block");
    if (pos.length > 0) {
        var elem = GetElem(pos);
        if (elem) {
            styleInfo = GetStyleInfo(elem);
            if (styleInfo) { dlg.style.left = styleInfo.left; dlg.style.top = styleInfo.bottom; }
        }
    }
    else {
        styleInfo = GetStyleInfo(dlg); width = (styleInfo.width > 0) ? styleInfo.width : width; height = (styleInfo.height > 0) ? styleInfo.height : height;
        var pleft = (styleInfo.screenWidth - width) / 2 + styleInfo.scrollLeft; if (pleft < 0) pleft = 100;
        var ptop = (styleInfo.screenHeight - height) / 2 + styleInfo.scrollTop; if (ptop < 0) ptop = 100;
        dlg.style.left = pleft + "px"; dlg.style.top = ptop + "px";
    }
    if (sTypeEx == "1") { ShowMask(null, layerFlag); }
    dlg.style.visibility = "visible";
    // focus & clearDlgTime
    if (clearDlgTime > 0) m_dlgTimeoutInstance = window.setTimeout("CloseDlg('" + layerFlag + "')", clearDlgTime * 1000);
    var fh = GetElem("g_dlg_fh__" + layerFlag);
    try { fh.focus(); } catch (e) { }
}
// 显示对话框(byelem方式)
function ShowElem(title, sCont, layerFlag) {
    ShowDlg("byelem", title, sCont, null, null, 0, layerFlag);
}
// 显示警告框 该方法将替代alert方法使用
function ShowAlert(sCont, event, layerFlag) {
    layerFlag = GetStr(layerFlag, "0");
    if (!event) event = "CloseDlg('" + layerFlag + "')";
    ShowDlg("alert", "", sCont, null, [[0, event], ["确定", event]], 0, layerFlag);
}
// 显示确认框 该方法将替代confirm方法使用
function ShowConfirm(sCont, eventOk, eventCancel, layerFlag) {
    if (!eventOk) eventOk = null;
    if (!eventCancel) eventCancel = null;
    ShowDlg("ask", "", sCont, null, [[0, eventCancel], ["确认", eventOk], ["取消", eventCancel]], 0, layerFlag);
}
// 显示等待提示 用户不能控制该提示 直到程序关闭该提示
function ShowWait(sCont, layerFlag) {
    ShowDlg("wait", "no", sCont, null, [[1]], 0, layerFlag);
}
// 显示AJAX请求与结束状态
function ShowAjax(info) {
    var myId = "dlg_ajax__" + GetRd();
    var html = '<div id="' + myId + '" class="dlg_ajax"><div>' + info + '</div></div>';
    document.body.insertAdjacentHTML("afterBegin", html);
    return myId;
}
// 显示AJAX请求与结束状态
function CloseAjax(myId) {
    var elem = GetElem(myId); if (!elem) return;
    elem.parentElement.removeChild(elem);
}

////////////////////////////////////////////////////////////////////////////////////////// 对象拖拽
var m_drag_objMove = null;
var m_drag_hidMoves = [];
var m_drag_pX = 0;
var m_drag_pY = 0;

function DragMDown(objMoveId, hidOnMoves) {
    var hitpoint = event.srcElement;
    if (hitpoint.tagName == "INPUT" || hitpoint.tagName == "TEXTAREA" || hitpoint.tagName == "SELECT") {
        m_drag_objMove = null; return;
    }

    document.attachEvent("onmouseup", DragMUp);
    document.attachEvent("onmousemove", DragMMove);
    document.attachEvent("onselectstart", DragMSelectStart);
    m_drag_objMove = document.getElementById(objMoveId);
    m_drag_objMove.style.cursor = "move";
    m_drag_pX = event.x - m_drag_objMove.style.pixelLeft;
    m_drag_pY = event.y - m_drag_objMove.style.pixelTop;
    /*
    var elem = null;
    for(var i=0; i<hidOnMoves.length; i++)
    {
    elem = document.getElementById(hidOnMoves[i]);
    if(elem)
    {
    m_drag_hidMoves.push(elem);
    elem.style.visibility = "hidden";
    }
    }*/
}
function DragMMove() {

    if (m_drag_objMove != null) {
        m_drag_objMove.style.left = event.x - m_drag_pX;
        m_drag_objMove.style.top = event.y - m_drag_pY;
    }
}
function DragMUp() {
    document.detachEvent("onmouseup", DragMUp);
    document.detachEvent("onmousemove", DragMMove);
    document.detachEvent("onselectstart", DragMSelectStart);

    if (m_drag_objMove != null) {
        m_drag_objMove.style.cursor = "default";
        m_drag_objMove = null;
    }
}
function DragMSelectStart() {
    return false;
}
////////////////////////////////////////////////////////
function GetGridItems(gridId) {
    var ret = [];
    var tb = GetElem(gridId); if (!tb) return ret;
    var items = tb.rows;
    for (var i = 0; i < items.length; i++) {
        if (items[i].name == "grid_tr") {
            var itemArr = [];
            for (var j = 0; j < items[i].childNodes.length; j++)
                if (items[i].childNodes[j].name = "grid_td")
                itemArr.push(items[i].childNodes[j].innerText);
            ret.push(itemArr);
        }
    }
    return ret;
}

// 选择Checkbox
// type:0=不选,1=全选,2=反选,3=根据第一个值反选
function SelectCkb(ckbName, type) {
    var objs = GetElems(ckbName);
    if (!objs) return;

    var cType;
    if (type == 1) cType = true;
    else if (type == 0) cType = false;
    else if (type == 2) cType = 2;
    else cType = (objs[0].checked) ? false : true;

    if (type == 2) {
        for (var i = 0; i < objs.length; i++)
            objs[i].checked = !objs[i].checked;
    }
    else {
        for (var i = 0; i < objs.length; i++)
            objs[i].checked = cType;
    }
}
function SelectCkbByCkb(ckbName, e) {
    e = GetElem(e);
    if (!e || e.tagName != "INPUT" || e.type != "checkbox") return;
    if (e.checked)
        SelectCkb(ckbName, 1);
    else
        SelectCkb(ckbName, 0);
}



//重置
function clearForm(formName) {
    var formObj = document.forms[formName];
    var nodes = getElementsByClass("txt", formObj);
    for (var i = 0; i < nodes.length; i++) {
        var resetVal = nodes[i].getAttribute("resetVal");
        nodes[i].value = resetVal ? resetVal : '';
    }
    nodes = getElementsByClass("slt", formObj);
    for (var i = 0; i < nodes.length; i++) {
        var resetVal = nodes[i].getAttribute("resetVal");
        if (resetVal)
            nodes[i].value = resetVal;
        else
            nodes[i].selectedIndex = 0;
    }
    nodes = getElementsByClass("Wdate", formObj);
    for (var i = 0; i < nodes.length; i++) {
        var resetVal = nodes[i].getAttribute("resetVal");
        nodes[i].value = resetVal ? resetVal : '';
    }
    nodes = getElementsByClass("check", formObj);
    for (var i = 0; i < nodes.length; i++) {
        var resetVal = nodes[i].getAttribute("resetVal");
        nodes[i].checked = resetVal ? resetVal : false;
    }
    nodes = getElementsByClass("rdo", formObj);
    for (var i = 0; i < nodes.length; i++) {
        var resetVal = nodes[i].getAttribute("resetVal");
        nodes[i].checked = resetVal ? resetVal : false;
    }
    nodes = getElementsByClass("combo_box", formObj);
    for (var i = 0; i < nodes.length; i++) {
        var childs = getElementsByClass("combo_ipt", nodes[i]);
        var combos = getElementsByClass("combo", nodes[i]);
        if (childs.length > 0) {
            var resetVal = combos[0].getAttribute("resetVal");
            childs[0].value = resetVal ? resetVal : '';
            combos[0].value = resetVal ? resetVal : '';
        }
    }
    nodes = getElementsByClass("txt_tw", formObj);
    for (var i = 0; i < nodes.length; i++) {
        var resetVal = nodes[i].getAttribute("resetVal");
        nodes[i].value = resetVal ? resetVal : '未定义';
    }
    nodes = getElementsByClass("div", formObj);
    for (var i = 0; i < nodes.length; i++) {
        var resetVal = nodes[i].getAttribute("resetVal");
        nodes[i].innerHTML = resetVal ? resetVal : '';
    }
}
//根据class获取节点
function getElementsByClass(searchClass, node, tag) {
    var classElements = new Array();
    if (node == null)
        node = document;
    if (tag == null)
        tag = '*';
    var els = node.getElementsByTagName(tag);
    var elsLen = els.length;
    var pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");
    for (i = 0, j = 0; i < elsLen; i++) {
        if (pattern.test(els[i].className)) {
            classElements[j] = els[i]; j++;
        }
    }
    return classElements;
}