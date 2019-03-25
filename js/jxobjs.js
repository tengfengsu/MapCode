
/* -------------------------------------------------------------------- */
/* jx request AJAX请求                                                  */
/* -------------------------------------------------------------------- */
function jxreq(url, postInfo, callBack, infoToCallBack) {
    this.url = url;
    this.postInfo = postInfo;
    this.callBack = callBack;
    this.infoToCallBack = infoToCallBack;
    var xmlhttp = jxx.makeHttpRequest();

    this.onReqStart = function() {
        // 请求开始 一般情况下被重写
        window.status = "正在请求数据...";
    };
    this.onReqEnd = function() {
        // 请求结束 一般情况下被重写
        window.status = "";
    };
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

/* -------------------------------------------------------------------- */
/* jx data XML数据,内置AJAX请求对象及相关操作                           */
/* -------------------------------------------------------------------- */
var g_jxdatas = [];

function jxdata(reqUrl, reqPostInfo, reqCallBack, reqInfoToCallBack) {
    this.data = null;
    this.dataType = "xml";
    this.dataReady = false;
    this.reqObj = new jxreq(reqUrl, reqPostInfo, reqCallBack, reqInfoToCallBack);
    
    this.load = function(subDataName, addDataName) {
        // 提交AJAX DATA请求
        var info = [this.reqObj.callBack, this.reqObj.infoToCallBack, subDataName, addDataName];
        this.reqObj.callBack = g_jxdatas[idx_in_datas].onReqCallBack;
        this.reqObj.load();
    };
    this.onReqCallBack = function(ret, info) {
        // 请求返回
        g_jxdatas[idx_in_datas].setData(ret, info[2], info[3]);
        if (IsFunction(info[0])) info[0](ret, info[1]);
    };

    // 将对象置于全局对象数据,并返回引用
    var idx_in_datas = g_jxdatas.push(this) - 1;
    return g_jxdatas[idx_in_datas];
}

jxdata.prototype = {
    isValidXml: function() {
        // 验证是否是有效的XML,如果有效则设置XPATH可用
        if (this.dataType != "xml" || !this.dataReady || !asDOM(this.data) || this.data.parseError.errorCode != 0)
            return false;
        this.data.setProperty("SelectionLanguage", "XPath"); return true;
    },
    getData: function() {
        // 获取数据
        return this.data;
    },
    loadPageXml: function(elem) {
        // 依据页面中初始化加载的XML来填充jxdata
        elem = jx.getElem(elem); if (!elem) return false;
        this.data = jxx.loadDOMXmlStr(elem.innerHTML);
        this.dataType = "xml"; this.dataReady = true;
    },
    loadXmlStr: function(xmlStr) {
        // 依据一个XML字符串来填充jxdata
        this.data = jxx.loadDOMXmlStr(xmlStr);
        this.dataType = "xml"; this.dataReady = true;
    },
    setData: function(src, subDataName, addDataName) {
        // 新增或修改数据(或数据块)
        if (this.dataType == "xml") {
            src = (asDOM(src)) ? src : jxx.loadDOMXmlStr(src);
            if(!addDataName) addDataName = subDataName;
            if (subDataName && this.isValidXml()) {
                newNode = src.selectSingleNode("/root/" + addDataName);
                oldNode = this.data.selectSingleNode("/root/" + subDataName);
                jxx.setNodeEx(newNode, oldNode);
            }
            else {
                this.data = src;
            }
        }
        this.dataReady = true;
    },
    getSubData: function(dataName) {
        // 获取子数据
        if (!asStr(dataName)) return null; if (!this.isValidXml()) return null;
        return this.data.documentElement.selectSingleNode("/root/" + dataName);
    },
    setSubData: function(dataName) {
        // 新增(或确认存在)子数据
        if (!asStr(dataName)) return null; if (!this.isValidXml()) return null;
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
        // 获取子数据的基本信息:页码,每页行数,总记录数,排序串
        if (!asStr(dataName)) return null; if (!this.isValidXml()) return null;
        var infoNodes = this.data.documentElement.selectNodes("/root/" + dataName + "/dataInfo/*"); if (!infoNodes) return null;
        if (infoNodes.length < 4) return null; var ret = {};
        ret.pageIndex = infoNodes[0].text; ret.pageSize = infoNodes[1].text;
        ret.recordCount = infoNodes[2].text; ret.orderStr = infoNodes[3].text;
        return ret;
    },
    getItem: function(dataName, itemPos) {
        if (!asStr(dataName)) return null; if (!this.isValidXml()) return null;
        itemPos = jx.getInt(itemPos, 0);
        return this.data.documentElement.selectSingleNode("/root/" + dataName + "/items/item[position()=" + itemPos + "]");
    },
    addItem: function(dataName, itemPos) {
        var pnode = this.getSubData(dataName); if (!pnode) return null;
        pnode = pnode.selectSingleNode("items"); if (!pnode) return null;
        if (itemPos>0 && itemPos<=pnode.childNodes.length) {
            var refItem = pnode.childNodes[itemPos]; 
            return pnode.insertBefore(this.data.createNode(1, "item", ""), refItem);
        }
        else {
            return pnode.appendChild(this.data.createNode(1, "item", ""));
        }
    },
    delItem: function(dataName, itemPos) {
        var pnode = this.getSubData(dataName); if (!pnode) return null;
        pnode = pnode.selectSingleNode("items"); if (!pnode) return null;
        if (itemPos>0 && itemPos<=pnode.childNodes.length) {
            var refItem = pnode.childNodes[itemPos]; 
            pnode.removeChild(refItem);
            return true;
        }
        return false;
    },
    addItemNode: function(dataName, itemPos, nodeName, nodeValue) {

    },
    delItemNode: function(dataName, itemPos, nodeName, nodeValue) {

    },
    getItemNodeValue: function(dataName, itemPos, nodeName) {

    },
    setItemNodeValue: function(dataName, itemPos, nodeName, nodeValue) {

    },
    addSubXmlCol: function(dataName, colName, formatStr, isEval) {
        colName = jx.getStr(colName, null); formatStr = jx.getStr(formatStr, null);
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
    }
}


/* ******************************************************************** */
/* 以上程序未验证正确性，以下程序未与jxbase匹配                         */
/* ******************************************************************** */



/* -------------------------------------------------------------------- */
/* jx grid 数据表格                                                     */
/* -------------------------------------------------------------------- */
var g_jxgrids = [];
var g_jxgrid_xslUrl = "/krswebui/js/grid.xsl";
var g_jxgrid_xslDOM = null;

function jxgrid(contrElem, dataObj, fmtSrc, gridId, dataName) {
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
        var contr = jx.getElem(this.contrElem); if (!contr) return;
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
        if (!this.onAllready!=null) { this.onAllready(); }
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

/* -------------------------------------------------------------------- */
/* jx grid 数据表格的格式                                               */
/* -------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------- */
/* jx grid 分页控件                                                     */
/* -------------------------------------------------------------------- */
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
            '共<span>{2}</span>条记录,分<span>{3}</span>页显示,每页显示:';
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
    }
}


