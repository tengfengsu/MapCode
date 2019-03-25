//******************************************************************************
/*对外接口
*测试平台：http://120.76.148.9/TestGis/Map/GIS.html
*(1) SetMapCurrPostion(double lon,double lat,int zoom);  通过经纬度定位当前地图中心点；zoom缩放比例 1～18
*(2) LoadData(string xmlstr);   通过xml字符串加载对象到地图中， 
*(3) StartTimer(int millisecond,string param); 设置一个自动对外调用定时器，millisecond 间隔，毫秒；param 参数（不参与计算）
*(4) StopTimer 停止一个定时器；必须停止前一个，才能重新启动一个新的定时器；
*(5) UpdateStatus(string xmlstr) 通过xml字符串更新指定点的状态， 20170328
*(6) ClearData()    清空数据    2170328

附：当前可测试的xml文件 
*/
//******************************************************************************
// 初始中心位置
var lon = 113.32;
var lat = 23.13;
//经纬度偏移调整值
var offsetlon = 0.00;
var offsetlat = 0.00;
//内部对象
var xmlDoc = '';
//初始化
function Init(_currZoom, _lon, _lat, path, _numZoomLevels, showoverview, model, mapSource) {
    gis._map = null;
    //设置地图图源
    if (mapSource && GetInt(mapSource, -1) > 0 && GetInt(mapSource, -1) < 4) { gis._mapSource = mapSource }
    var myshowoverview = true;
    if (!_numZoomLevels) { gis._numZoomLevels = _numZoomLevels; }
    if (!_lon) { lon = _lon; }
    if (!_lat) { lat = _lat; }
    if (!_currZoom) { _currZoom = 10; }
    //alert(_currZoom + "," + _lon + "," + _lat + "," + _numZoomLevels); 
    //加载=卫星图时：鹰眼去掉
    if (showoverview && showoverview == "1") { myshowoverview = false; }
    if (!path) { path = ""; }//c:\\
    gis.Load(null, _currZoom, path, myshowoverview, GetInt(model, 0)); //C:\maptilev 
    //设置屏幕中心 经纬度
    SetMapCurrPostion(lon + offsetlon, lat + offsetlat, _currZoom);
    //设置基础Layer
    layerBase = gis.AddLayer(null, new function () { this.isSupportSelect = false; });
    //layerPolygon = gis.AddLayer(null, new function () { this.isSupportSelect = false; });
    //SetLayerActivate(layerBase);
    //创建测量对象层
    gis.CreateMeasurControls(layerBase, function (v) { }, function (v) { });
}

//设置缩放控件最大图层范围，图层从最底层1开始，最大值为18,设置完成后需调用Init重新初始化
function SetMaxZoomNum(_numZoomLevels) {
    gis._numZoomLevels = _numZoomLevels;
}


//屏幕坐标转换为地图坐标 return "经度，纬度" 如："113.34,22.43"
function GetMapCoordFromScreenCoord(x, y) {
    var displaylonlat = gis._map.getLonLatFromPixel(new OpenLayers.Pixel(x, y));
    var lonlat = GetLonlatByDisplayLonlat(displaylonlat.lon, displaylonlat.lat);
    if (gis._mapSource == 2) { //处理百度坐标偏移
        lonlat = GPS.bd_decrypt(lonlat.lat, lonlat.lon);
    }
    return lonlat.lon + "," + lonlat.lat;
}

//地图坐标转换为屏幕坐标,return "X坐标，Y坐标" 如："880,432"
function GetScreenCoordFromMapCoord(lon, lat) {
    if (gis._mapSource == 2) {//处理百度坐标偏移
        var bdlonlat = GPS.bd_decrypt(lat, lon);
        lon = bdlonlat.lon;
        lat = bdlonlat.lat;
    }
    var extent = gis._map.getExtent();
    var lonlat = GetDisplayLonlat(lon, lat);
    var size = gis._map.size;
    var x = parseInt(size.w * (lonlat.lon - extent.left) / (extent.right - extent.left));
    var y = parseInt(size.h * (lonlat.lat - extent.top) / (extent.bottom - extent.top));
    return x + "," + y;
}

//得到当前屏幕对角（左上角、右下角）范围, return "左上角经度，左上角纬度、右下角经度，右下角纬度"
function GetViewBounds() {
    var extent = gis._map.getExtent();
    var leftTopLonLat = GetLonlatByDisplayLonlat(extent.left, extent.top);
    var rightBottomLonLat = GetLonlatByDisplayLonlat(extent.right, extent.bottom);
    if (gis._mapSource == 2) {//处理百度坐标偏移
        leftTopLonLat = GPS.bd_decrypt(leftTopLonLat.lat, leftTopLonLat.lon);
        rightBottomLonLat = GPS.bd_decrypt(rightBottomLonLat.lat, rightBottomLonLat.lon);
    }
    return leftTopLonLat.lon + "," + leftTopLonLat.lat + ";" + rightBottomLonLat.lon + "," + rightBottomLonLat.lat;
}

//设置当前窗口范围，参数：左上角经纬度、右下角经纬度
function SetViewBounds(leftTopLon, leftTopLat, rightBottomLon, rightBottomlat) {
    //alert(leftTopLon + "," + leftTopLat + "," + rightBottomLon + "," + rightBottomlat);
    //dMinLong 113.924234, dMaxLong 113.935639, dMinLat 22.540283, dMaxLat 22.546883
    if (gis._mapSource == 2) {//处理百度坐标偏移
        var bdlonlat = GPS.bd_encrypt(leftTopLat, leftTopLon);
        leftTopLon = bdlonlat.lon;
        leftTopLat = bdlonlat.lat;
        bdlonlat = GPS.bd_encrypt(rightBottomlat, rightBottomLon);
        rightBottomLon = bdlonlat.lon;
        rightBottomlat = bdlonlat.lat;
    }
    var leftTopLonLat = GetDisplayLonlat(leftTopLon, leftTopLat);
    var rightBottomLonLat = GetDisplayLonlat(rightBottomLon, rightBottomlat);
    var bounds = new OpenLayers.Bounds(leftTopLonLat.lon, leftTopLonLat.lat, rightBottomLonLat.lon, rightBottomLonLat.lat);
    gis._map.zoomToExtent(bounds, true);
}

//获取中心点经纬度(long , lon)
function GetMapCurPosition() {
    var displaylonlat = gis.GetCenter();
    if (gis._mapSource == 2) {//处理百度坐标偏移
        displaylonlat = GPS.bd_decrypt(displaylonlat.lat, displaylonlat.lon);
    }
    return displaylonlat.lon + "," + displaylonlat.lat;
}


//设置当前中心位置,比例
function SetMapCurrPostion(lon2, lat2, zoom) {
    if (gis._mapSource == 2) {//处理百度坐标偏移
        var bdlonlat = GPS.bd_encrypt(lat2, lon2);
        lon2 = bdlonlat.lon;
        lat2 = bdlonlat.lat;
    }
    gis.SetCenter(lon2 + offsetlon, lat2 + offsetlat, zoom);
}


//获取当前图层层级 return  zoom(zoom:1~18)
function GetZoom() {
    return gis._map.getZoom();
}

//获取当前一个像素代表多少米
function GetScale() {
    var extent = gis._map.getExtent();
    return (extent.right - extent.left) / gis._map.size.h;
}

//设置图层层级，zoom范围：1~18
function SetZoom(zoom) {
    gis._map.zoomTo(zoom);
}

//设置经纬度校正值
function SetOffsetLonLat(lon2, lat2) {
    offsetlon = lon2;
    offsetlat = lat2;
}

//0默认：街道图 1:卫星图 2:卫星+标注图
function GetMapModel() {
    var mapmodel = gis._map.baseLayer.name == "地图" ? 0 : 1;
    return mapmodel += gis._map.layers[2].visibility ? 1 : 0;
}

//设置图源模式
function SetMapModel(model) {
    switch (model) {
        case 0:
            gis._map.setBaseLayer(gis._map.layers[0]);
            gis._map.layers[2].setVisibility(false);
            break;
        case 1:
            gis._map.setBaseLayer(gis._map.layers[1]);
            break;
        case 2:
            gis._map.setBaseLayer(gis._map.layers[1]);
            gis._map.layers[2].setVisibility(true);
            break;
        default: break;
    }
}

/*
 20170318 
6）测距、面积是否需要加上 测距、面积 "0"清空，“1”测距 “2” 测面积
*/


function Set(val) { alert(val); }

function Get() { return "WebMap" };

//清空数据
function ClearData() {
    gis.clusterspoint = [];
    gis.htObject = new Hashtable();
    gis.StrategyCluster();

    for (var j = 0; j < _map.popups.length; j++) {
        gis._map.popups[j].hide();
    }
}

//加载数据
function LoadData(xmlstr) {
    if (xmlstr == undefined || xmlstr == "") { return; }
    //格式化xml 
    xmlDoc = CreateXmlFromString(xmlstr);
    var dataNode = xmlDoc.selectSingleNode("xml");
    //封装对象
    DisplayItem(dataNode);
    //显示
    gis.StrategyCluster();
}

//更新指定点的状态 
function UpdateStatus(xmlstr) {
    if (xmlstr == undefined || xmlstr == "") { return; }
    //格式化xml 
    var xmlDocStatus = CreateXmlFromString(xmlstr);
    var dataNode = xmlDocStatus.selectNodes("xml/station");
    for (var i = 0; i < dataNode.length; i++) {
        var itemNode = dataNode[i];
        var itemid = itemNode.selectSingleNode("id").text;

        //删除该对象
        var point = gis.GetObjectByAttrId(itemid);
        gis.RemoveObj(point.attributes.id);
        //
        var sitepoints = [];
        for (var j = 0; j < gis.clusterspoint.length; j++) {
            var item = gis.clusterspoint[j];
            if (point.attributes.id == item.attributes.id) {
                if (item.popup) item.popup.hide();
                continue;
            }
            sitepoints.push(item);
        }
        gis.clusterspoint = sitepoints;
        //gis.StrategyCluster();
    }
    //封装对象
    DisplayItem(xmlDocStatus.selectSingleNode("xml"));
    //显示
    gis.StrategyCluster();
}

//启动间隔自动运行
var isTimerEnabled = false;
function StartTimer(millisecond, param) {
    if (isTimerEnabled) {
        window.external.ExternalFun4Gis("please close the last one timer process。");
        return;
    }
    isTimerEnabled = true;
    window.setInterval(function () {
        if (isTimerEnabled == false) { return; }
        window.external.ExternalFun4Gis(param);
    }, millisecond);
}

//停止间隔运行程序
function StopTimer() { isTimerEnabled = false; }

//点击对话框
function ItemClick(val) {

    window.external.ExternalFun4Gis(val);
}

//设备的点击按钮事件
function OptionClick(callback, param) {
    //alert(callback + " " + param);
    window.external.ExternalCallBack4Gis(callback, param);
}

//内置函数，外部程序请勿调用
function DisplayItem(dataNode) {
    for (var k = 0; k < dataNode.childNodes.length; k++) {
        var itemNode = dataNode.childNodes[k];
        var itemlon = GetNum(itemNode.selectSingleNode("lon").text, 0);
        var itemlat = GetNum(itemNode.selectSingleNode("lat").text, 0);
        if (lon == 0 || lat == 0) { continue; }
        var itemname = itemNode.selectSingleNode("name").text;
        var itemdesc = itemNode.selectSingleNode("desc").text;
        var itemcolor = itemNode.selectSingleNode("color").text;
        var itemid = itemNode.selectSingleNode("id").text;
        var style = new gis.GisObjectStyle();
        // itemtype == 1 ? "images/hispoint.png" : itemtype == 2 ? "images/point.png" : "images/currpoint.gif";
        style.img1 = "images/mc/" + itemcolor + "2.png";
        style.imgs = "images/station.jpg";
        //多个不同类型聚合时，业务逻辑处理
        //style.imgsExFun = function (feature) {
        //        //当出现某一个类型，直接返回指定图标
        //    for (var i = 0 ; i < feature.cluster.length; i++) {
        //        if (feature.cluster[i].attributes.itemcolor == "green") { return "images/mc/green.png"; }
        //    }

        //    ////计算某个类型个数最多 未测试
        //    //var hsObj = new Hashtable();
        //    //for (var i = 0 ; i < feature.cluster.length; i++) {
        //    //    var tmpkey = feature.cluster[0].attributes.itemtype;
        //    //    if (hsObj.contains(tmpkey) == false) { hsObj.add(tmpkey, 1); }
        //    //    else { hsObj._hash(tmpkey) = GetInt(hsObj._hash(tmpkey), 0) + 1; }
        //    //}
        //    //var keys = hsObj.toArrayKey().split(',');
        //    //var maxCntObj = -1, maxCntKey = '';
        //    //for (var i = 0; i < keys.length; i++) {
        //    //    maxCntObj = GetInt(hsObj._hash[keys[i]], 0) > maxCntObj ? GetInt(hsObj._hash[keys[i]], 0) : maxCntObj;
        //    //}
        //    //for (var i = 0; i < keys.length ; i++) {
        //    //    if (GetInt(hsObj.count(keys[i]), 0) == maxCntObj) { maxCntKey = keys[i]; break; }
        //    //}
        //    //if (maxCntKey) { return "images/point" + maxCntKey + ".png"; } 

        //    return feature.cluster[0].data.imgs;
        //}
        style.graphicWidth = 60;
        style.title = "名称：" + itemname;
        style.label = itemname;
        style.fontColor = itemcolor;
        style.fontSize = "8pt";

        var attr = new gis.GisAttributes();
        attr.type = 'item';
        attr.id = itemid;
        attr.value = itemname;
        attr.lon = itemlon;
        attr.lat = itemlat;
        attr.desc = itemdesc;
        //attr.itemtype = itemtype;
        //id='popup_" + attr.id + "'
        //<a href='javascript:void(0);' onclick=" + "ItemClick(\"" + attr.value + "\")" + " >" + attr.value + "</a>
        var html = "<div style='width:350px;'><div class='bstit' style='height:15px;text-align:center;background-color:#99ccff;'>" + "<div class='bstit_l' style='text-align:center;width:80%;'><font color=" + itemcolor + ">" + attr.value + "</font></div></div>";

        html += "<div style='border-bottom: solid 1px #999999'>"
                    + ("经纬度：" + formatDegree(attr.lon) + "～" + formatDegree(attr.lat) + " ") + "</div>";
        html += "<div style='width:99%'><table style='width:99%'>";
        attr.devices = itemNode.selectNodes("items/item");
        for (var i = 0; i < attr.devices.length; i++) {
            var deviceNode = attr.devices[i];
            //<img src='images/icon_catalog.gif' onclick='test(\"" + deviceNode.getAttribute("id") + "\",this);' />
            html += "<tr><td style='width:10%;'><img src='images/mc/" + attr.devices[i].getAttribute("color") + ".png' style='vertical-align:middle;width:36px;height:36px;'></img><font color=" + attr.devices[i].getAttribute("color") + ">" + attr.devices[i].getAttribute("name") + "</td><td>";
            var options = deviceNode.selectNodes("option");
            //html += "<div id='" + deviceNode.getAttribute("id") + "' style='border:1px solid #ccc; width:99%; display: none;'>"
            for (var j = 0; j < options.length; j++) {
                var optionparam = "<xml>"
                var option = options[j].getAttribute("param").split(',');
                for (var m = 0; m < option.length; m++) { var tmpop = attr.devices[i].getAttribute(option[m]); if (tmpop) { optionparam += "<" + option[m] + ">" + tmpop + "</" + option[m] + ">"; } }
                optionparam += "</xml>";
                html += "<img src='images/mc/" + options[j].getAttribute("img") + "' style='cursor:pointer;vertical-align:middle;margin-left:5px;width:36px;height:36px;' onclick='OptionClick(\"" + options[j].getAttribute("callback") + "\",\"" + optionparam + "\")'></img>" + "<label style='' for=''onmouseout='this.style.color=\"black\";' onmouseover='this.style.color=\"blue\";'>" + options[j].text + "</label>";
            }
            //html += "</div>";
            html += "</td></tr>";
        }
        html += "</table></div>";
        //html += "<div style='border-bottom: solid 1px #999999'>"
        //            + ("描述：" + attr.desc) + "</div>";

        //html += "<div style='text-align:right;'><a href='javascript:void(0);'onclick=" + "alert(message);(1);" + ">操作1</a>&nbsp;&nbsp;<a href='javascript:void(0);'onclick=" + "alert(2);" + ">操作2</a></div>";
        html += "</div>";
        html += "</div>";
        attr._html = html;

        attr.func = function (id) {
            var pointobj = gis.GetObject(id);
            var pointattr = pointobj.attributes;
            gis.SetMessage(id, pointattr._html);
            gis.SetMessageDisplay(id, true);
            pointobj.popup.updateSize();
        };

        if (gis._mapSource == 2) {
            var bdlonlat = GPS.bd_encrypt(itemlat, itemlon);
            itemlon = bdlonlat.lon;
            itemlat = bdlonlat.lat;
        }
        var point = gis.GetPoint(gis.GetGeometyPoint(itemlon, itemlat), style, attr);
        gis.AddtoCluster(point, false);
    }
}

function test(elemid, obj) {
    var div1 = document.getElementById(elemid);
    if (div1.style.display == "block") {
        div1.style.display = "none";
        obj.src = "images/point.png";
    } else {
        div1.style.display = "block";
        obj.src = "images/icon_catalog.gif";
    }
}


var type = 1;//1：异常，2：全部
function SreachItemByParam() {
    type = 1 ? 2 : 1;
    var key = $("#aSearch").text;
    if (!xmlDoc) { return; }
    gis.clusterspoint = [];
    xmlDoc.setProperty("SelectionLanguage", "XPath");

    var dataNode = xmlDoc.selectNodes("xml/station[type = " + type + " and contains(name,'" + key + "') or contains(name,'" + key + "')]");
    //封装对象
    DisplayItem(dataNode);
    //显示
    gis.StrategyCluster();
}


function AddFile(id, name, desc, type, picture) {
    var html = GetElem("div_stinfo").innerHTML;
    var str = "<div style='border-bottom: solid 1px #999999; height: 50px; width: 95%; margin: 2px 5px 2px 5px;' id='dinfo_" + id + "'>" +
              "<div style='float: left; width: 50px; height: 50px; text-align: center; vertical-align: middle'>" +
              "<img title='' alt'' style='width: 100%; height: 100%' src='images/currpoint.gif' /></div>" +
              "<div style='width: auto; height: 20px; text-align: left;'><a href='javascript:void(0);' style='font-size: 9pt;'>" + name + "</a></div>" +
              "<div style='width: auto; height: 28px; text-align: left; font-size: 8pt; word-break: break-all; word-wrap: break-word;'>" + desc + "</div></div>";
    GetElem("div_stinfo").innerHTML = html + str;
}

//测量对象
function SltPolygonType(type) {
    switch (type) {
        case "0":
            //document.getElementById('sltpolygon').value = "0";
            gis.ClearMeasureObj();
            gis.ToggleControl('none');
            break;
        case "1":
            gis.ToggleControl('line');
            break;
        case "2":
            gis.ToggleControl('polygon');
            break;
        default: break;
    }
}

//经纬度格式化
//将度转换成为度分秒
function formatDegree(value) {
    ///<summary>将度转换成为度分秒</summary>  

    value = Math.abs(value);
    var v1 = Math.floor(value);//度  
    var v2 = Math.floor((value - v1) * 60);//分  
    var v3 = Math.round((value - v1) * 3600 % 60);//秒  
    return v1 + '°' + v2 + '\'' + v3 + '"';
}

//度分秒转换成为度
function DegreeConvertBack(value) { ///<summary>度分秒转换成为度</summary>  
    var du = value.split("°")[0];
    var fen = value.split("°")[1].split("'")[0];
    var miao = value.split("°")[1].split("'")[1].split('"')[0];

    return Math.abs(du) + "." + (Math.abs(fen) / 60 + Math.abs(miao) / 3600);
}