/// <reference path="../OpenLayers/OpenLayers.js" />
var GisObj = function (divName) {
    this.userid = null;
    this.htObject = new Hashtable();
    this.htObjClickMenu = new Hashtable();
    this.clusters;
    this.clusterspoint = [];
    this.points = [];
    this.markersLayer;
    this.switcherLayer;
    this.selectFeatureControl;
    this._map = null;
    this._divName = divName;
    this._measureControls = null;
    this._htfeatures = new Hashtable();
    this._zoom = 8;
    this._styleMap = null;
    this._strategy;
    this._distance = 16;
    this._threshold = 2;
    this._url = "http://p0.map.soso.com/";
    this._numZoomLevels = 19;

    //******************************外部调用函数*************************************
    //第1类：创建地图、装载地图---------------------------------------
    //加载地图
    //options 遵循openLayers 格式
    this.Load = function (options, zoom, url, showOverview) {
        _Init(options, (zoom == null ? this._zoom : zoom), url, showOverview);
    }

    //设置地图中心点 lon 经度 lat 纬度,等级
    this.SetCenter = function (lon, lat, zoom) {
        if (!zoom) { zoom = _map.getZoom(); }
        _map.setCenter(this.GetDisplayLonlat(lon, lat), zoom);
    }

    //第2类：用户层管理-----------------------------------------------
    //添加层
    /*
    layerid                 层名称
    option                  信息
    info                    内容
    info.isSupportSelect    该层内的对象是否支持选中、取消选中功能
    */
    this.AddLayer = function (option, info) {
        var layerid = "layer_" + GetRandomNum();
        var layer = new OpenLayers.Layer.Vector(layerid, {
            styleMap: new OpenLayers.StyleMap(
    {
        'default': {
            fillColor: "#ee9900",
            fillOpacity: 0.6,
            hoverFillColor: "white",
            hoverFillOpacity: 0.8,
            strokeColor: "#ee9900",
            strokeOpacity: 1,
            strokeWidth: 1,
            strokeLinecap: "round",
            strokeDashstyle: "solid",
            hoverStrokeColor: "red",
            hoverStrokeOpacity: 1,
            hoverStrokeWidth: 0.2,
            pointRadius: 3,
            hoverPointRadius: 1,
            hoverPointUnit: "%",
            pointerEvents: "visiblePainted",
            cursor: "inherit",
            fontColor: "#000000",
            labelAlign: "cm",
            labelOutlineColor: "white",
            labelOutlineWidth: 3
        },
        'select': {
            fillColor: "blue",
            fillOpacity: 0.6,
            hoverFillColor: "white",
            hoverFillOpacity: 0.8,
            strokeColor: "blue",
            strokeOpacity: 1,
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeDashstyle: "solid",
            hoverStrokeColor: "red",
            hoverStrokeOpacity: 1,
            hoverStrokeWidth: 0.2,
            pointRadius: 3,
            hoverPointRadius: 1,
            hoverPointUnit: "%",
            pointerEvents: "visiblePainted",
            cursor: "pointer",
            fontColor: "#000000",
            labelAlign: "cm",
            labelOutlineColor: "white",
            labelOutlineWidth: 3

        },
        'temporary': {
            fillColor: "#66cccc",
            fillOpacity: 0.4,
            hoverFillColor: "white",
            hoverFillOpacity: 0.8,
            strokeColor: "#66cccc",
            strokeOpacity: 1,
            strokeLinecap: "round",
            strokeWidth: 2,
            strokeDashstyle: "solid",
            hoverStrokeColor: "red",
            hoverStrokeOpacity: 1,
            hoverStrokeWidth: 0.2,
            pointRadius: 3,
            hoverPointRadius: 1,
            hoverPointUnit: "%",
            pointerEvents: "visiblePainted",
            cursor: "inherit",
            fontColor: "#000000",
            labelAlign: "cm",
            labelOutlineColor: "white",
            labelOutlineWidth: 3

        },
        'delete': {
            display: "none"
        }
    })
        });
        if (info.isSupportSelect) { selectFeatureControl.setLayer(layer); }
        //属性、样式 初始化
        if (info.attributes == null || info.attributes == '') {
            info.attributes = new GisAttributes();
            info.attributes.id = layerid;
        }
        if (info.attributes.id == undefined || info.attributes.id == '')
            info.attributes.id = layerid;
        info.attributes._id = layerid;
        if (info.attributes != undefined) {
            info.attributes._type = "layer";
            layer.attributes = info.attributes;
        }
        if (htObject.contains(layerid) == false) { htObject.add(layerid, layer); }
        else {
            return layerid;
        }
        _map.addLayer(layer);
        return layerid;
    }

    //获取层 返回一个图层名称匹配给定的名称列表，返回一个空数组如果没有找到匹配
    this.GetLayersByName = function (layerName) {
        return _map.getLayersByName(layerName);
    }

    //删除层
    this.RemoveLayer = function (id) {
        var layers = _map.getLayersByName(id);
        for (var i = 0; i < layers.length; i++) {
            //layers[0].destroy();
            this._map.removeLayer(layers[i], true);
        }
    }
    //将层设置为活动状态
    this.SetLayerActivate = function (id) {
        this.selectFeatureControl.setLayer(this.GetLayersByName(id)[0]);
        this.selectFeatureControl.activate();
    }

    //取消层的活动状态
    this.SetLayerDeactivate = function (id) {
        this.selectFeatureControl.setLayer(this.GetLayersByName(id)[0]);
        this.selectFeatureControl.deactivate();
    }

    //第3类：创建对象-------------------------------------------------
    /* 添加Point对象   
    lon                 经度 
    lat                 纬度
    layerid           层对象名称
    info对象   
    info.label          显示文字    
    info.attributes     自定义属性集合(GisAttributes)，可空；保存一些用于辅助区别对象的内容 如：key /type 等。
    info.attributes.beforeselectfunc    选择前回调事件，一般用于替换图标、状态更新，提示当前正在选择该对象
    info.attributes.selectfunc          选中时触发的回调事件
    info.attributes.unselectfunc        取消选中触发的回调事件
    info.style          样式集合(GisObjectStyle)    
    */
    this.AddPoint = function (layerid, lon, lat, info) {
        var pid = "point_" + GetRandomNum();
        var point = GetGeometyPoint(lon, lat);
        if (info.attributes == null || info.attributes == '') {
            info.attributes = new GisAttributes();
            info.attributes.id = pid;
        }
        if (info.attributes.id == undefined || info.attributes.id == '')
            info.attributes.id = pid;
        info.attributes._id = pid;
        if (info.style == null || info.style == '') {
            info.style = new GisObjectStyle(id, info.label);
            info.style.id = pid;
        }
        var feature = new OpenLayers.Feature.Vector(point, info.style);
        feature.id = pid;
        if (info.attributes != undefined) {
            info.attributes._type = "point";
            feature.attributes = info.attributes;
        }
        if (info.style != undefined)
            feature.style = info.style;
        if (info.label != null && info.label != undefined)
            info.style.label = info.label;
        var layer = this.GetLayersByName(layerid)[0];

        //        layer.events.register("click", this, function(evt) {
        //            for (var i = 0; i < layer.features.length; i++) {
        //                if (layer.features[i].geometry.id == evt.srcElement.id) {
        //                    layer.features[i].attributes.func();
        //                    break;
        //                }
        //            }
        //        });

        layer.addFeatures([feature]);
        if (htObject.contains(pid) == false) { htObject.add(pid, feature); }
        return pid;
    }

    /* 添加线
    id
    layerid           层对象名称
    arylonlat           经纬度数组， 如 [[第1个点经度,第1个纬度],[第2个点经度,第2个纬度],....]  4个点可描述一个三变形，类推；
    info对象   
    info.label          显示文字    
    info.isdisplaypoint 是否显示线上的点（point），如 起点等    
    info.pointstylelist info.isdisplaypoint=true，点集合的样式列表，支持定义各个点的样式 如开头绿色，中间蓝色，终点红色等；
    info.pointattrslist info.isdisplaypoint=true，点集合的属性列表
    info.attributes     自定义属性集合(GisAttributes)，可空；保存一些用于辅助区别对象的内容 如：key /type 等。    
    info.attributes.beforeselectfunc    选择前回调事件，一般用于替换图标、状态更新，提示当前正在选择该对象
    info.attributes.selectfunc          选中时触发的回调事件
    info.attributes.unselectfunc        取消选中触发的回调事件
    info.style          样式集合(GisObjectStyle)
    */
    this.AddLine = function (layerid, arylonlat, info) {
        var lid = "line_" + GetRandomNum();
        if (info.isdisplaypoint == null) info.isdisplaypoint = false;
        var pointlist = [];
        //若经纬度 0~180 /0~90则进行转换
        if (arylonlat[0][0] > 0 && arylonlat[0][0] < 180 && arylonlat[0][1] > 0 && arylonlat[0][1] < 90) {
            for (var i = 0; i < arylonlat.length; i++) { pointlist.push(this.GetGeometyPoint(arylonlat[i][0], arylonlat[i][1])); }
        }
        else { pointlist = arylonlat; }
        //属性、样式 初始化
        if (info.attributes == null || info.attributes == '') {
            info.attributes = new GisAttributes();
            info.attributes.id = lid;
        }
        if (info.attributes.id == undefined || info.attributes.id == '')
            info.attributes.id = lid;
        info.attributes._id = lid;
        if (info.style == null || info.style == '') {
            var lineStyle = new GisObjectStyle(lid, "");
            lineStyle.strokeDashstyle = "solid";
            lineStyle.id = lid;
            info.style = lineStyle;
        }
        //线路
        var lineFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(pointlist), info.attributes);
        //属性、样式
        if (info.attributes != undefined) {
            info.attributes._type = "line";
            lineFeature.attributes = info.attributes;
        }
        if (info.style != undefined)
            lineFeature.style = info.style;
        if (info.label != null && info.label != undefined)
            info.style.label = info.label;
        this.GetLayersByName(layerid)[0].addFeatures([lineFeature]);

        if (htObject.contains(lid) == false) { htObject.add(lid, lineFeature); }
        //是否显示 point
        if (info.isdisplaypoint == false) {
            return lid;
        }
        for (var i = 0; i < pointlist.length; i++) {
            var attrs = info.pointattrslist == undefined ? null : info.pointattrslist[i];
            var pcid = GetPoint(pointlist[i], info.pointstylelist[i], attrs);
            var p = htObject.items(pcid);
            if (p == undefined) return;
            this.GetLayersByName(layerid)[0].addFeatures([p]);
        }
        return lid;
    }

    /*
    添加多边型
    arylonlat           经纬度数组， 如 [[第1个点经度,第1个纬度],[第2个点经度,第2个纬度],....]  4个点可描述一个三变形，类推；
    layerid           层名称
    info对象     
    info.label          显示文字    
    info.isdisplaypoint 是否显示四周的点（point），如 起点，中间点等    
    info.pointstylelist info.isdisplaypoint=true，点集合的样式列表，支持定义各个点的样式 如开头绿色，中间蓝色，终点红色等；
    info.pointattrslist info.isdisplaypoint=true，点集合的属性列表
    info.attributes     自定义属性集合(GisAttributes)，可空；保存一些用于辅助区别对象的内容 如：key /type 等。
    info.attributes.beforeselectfunc    选择前回调事件，一般用于替换图标、状态更新，提示当前正在选择该对象
    info.attributes.selectfunc          选中时触发的回调事件
    info.attributes.unselectfunc        取消选中触发的回调事件
    info.style          样式集合(GisObjectStyle)    
    **/
    this.AddPolygon = function (layerid, arylonlat, info) {
        var pyid = "polygon_" + GetRandomNum();
        var pointlist = [];
        //若经纬度 0~180 /0~90则进行转换
        if (arylonlat[0][0] > 0 && arylonlat[0][0] < 180 && arylonlat[0][1] > 0 && arylonlat[0][1] < 90) {
            for (var i = 0; i < arylonlat.length; i++) { pointlist.push(this.GetGeometyPoint(arylonlat[i][0], arylonlat[i][1])); }
        }
        else { pointlist = arylonlat; }
        //属性、样式 初始化
        if (info.attributes == null || info.attributes == '') {
            info.attributes = new GisAttributes();
            info.attributes.id = pyid;
        }
        if (info.attributes.id == undefined || info.attributes.id == '')
            info.attributes.id = pyid;
        info.attributes._id = pyid;
        if (info.style == null || info.style == '') {
            var polygonStyle = new GisObjectStyle(pyid, "");
            polygonStyle.strokeDashstyle = "solid";
            polygonStyle.id = pyid;
            info.style = polygonStyle;
        }
        var polygonFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LinearRing(pointlist));
        //属性、样式
        if (info.attributes != undefined) {
            info.attributes._type = "polygon";
            polygonFeature.attributes = info.attributes;
        }
        if (info.style != undefined)
            polygonFeature.style = info.style;
        if (info.label != null && info.label != undefined)
            info.style.label = info.label;

        this.GetLayersByName(layerid)[0].addFeatures([polygonFeature]);
        if (htObject.contains(pyid) == false) { htObject.add(pyid, polygonFeature); }
        //是否显示 point
        if (info.isdisplaypoint == undefined || info.isdisplaypoint == false) {
            return pyid;
        }
        for (var i = 0; i < pointlist.length; i++) {
            var attrs = info.pointattrslist == undefined ? null : info.pointattrslist[i];
            var pcid = GetPoint(pointlist[i], info.pointstylelist[i], attrs);
            var p = htObject.items(pcid);
            if (p == undefined) return;
            this.GetLayersByName(layerid)[0].addFeatures([p]);
        }
        return pyid;
    }


    //第4类：对象管理-------------------------------------------------
    //根据ID获取对象
    this.GetObject = function (id) {
        var item = htObject.items(id);
        if (item == undefined) return;
        return item;
    }
    //根据ID获取对象
    this.GetObjectByAttrId = function (arrtid) {
        for (var attr in htObject._hash) {
            var item = htObject._hash[attr];
            if (item.attributes == undefined) continue;
            if (item.attributes.id != arrtid) continue;
            return item;
        }
        return null;
    }
    //根据类型point/line/polygon获取对象
    this.GetObjectByType = function (type) {
        var result = [];
        for (var attr in htObject._hash) {
            var item = htObject._hash[attr];
            if (item.attributes == undefined) continue;
            if (item.attributes._type != type) continue;
            result.push(item);
        }
        return result;
    }
    //对象显示/隐藏 支持类型 layer,marker,point,box
    /*
    display boolean    
    */
    this.SetObjectDisplay = function (id, display) {
        var item = htObject.items(id);
        if (item == undefined) return;

        if (typeof (display) != 'boolean') return;
        if (item.CLASS_NAME == "OpenLayers.Feature.Vector") {
            item.style.display = display ? "block" : "none";
            item.layer.redraw();
        }
        else {
            item.display(display);
        }
    }

    //对象移动 支持类型 marker,point
    /*
    id 
    lon 经度 
    lat 纬度    
    isSetMapCenter 移动后的位置作为地图中心点
    */
    this.MoveTo = function (id, lon, lat, isSetMapCenter) {
        var item = htObject.items(id);
        if (item == undefined) return;
        if (typeof (lon) != 'number' || typeof (lat) != 'number') return;
        var lonlat = this.GetDisplayLonlat(lon, lat);
        if (isSetMapCenter) { this.SetCenter(lon, lat); }
        if (item.attributes != null && item.attributes.lon != null) {
            item.attributes.lon = lon;
            item.attributes.lat = lat;
        }

        //point
        if (item.CLASS_NAME == "OpenLayers.Feature.Vector") {
            item.move(lonlat);
            return;
        }
        //marker
        item.lonlat = lonlat;
        //事件位置移动
        if (item.events != undefined && item.events.listeners.click != undefined) {
            var click = item.events.listeners.click[0];
            if (click != undefined)
                click.obj.lonlat = this.GetDisplayLonlat(lon, lat);
        }
        //弹出框位置移动
        for (var i = 0; i < _map.popups.length; i++) {
            if (_map.popups[i].id == id) {
                _map.popups[i].lonlat = this.GetDisplayLonlat(lon, lat); break;
            }
        }
        //移动后重绘
        markersLayer.redraw();
        return item;
    }
    this.IsExistsClusterspoint = function (point) {
        var isExists = false;
        for (var k = 0; k < gis.clusterspoint.length; k++) {
            if (gis.clusterspoint[k].attributes._id == point.attributes._id) { isExists = true; break; }
        }
        return isExists;
    }

    /* 修改Point对象   （不支持附加到另一个layer上）
    lon                 经度 
    lat                 纬度
    layer               层对象   
    info对象   
    info.label          显示文字    
    info.attributes     自定义属性集合(GisAttributes)，可空；保存一些用于辅助区别对象的内容 如：key /type 等。
    info.style          样式集合(GisObjectStyle)     
    */
    this.SetObjInfo = function (id, info) {
        var point = htObject.items(id);
        if (point == undefined) return;
        //属性
        if (info.attributes != undefined)
            point.attributes = info.attributes;
        //样式
        if (info.style != undefined)
            point.style = info.style;
        return point;
    }

    //删除 Point、Marker 对象，一并删除弹出框
    this.RemoveObj = function (id) {
        var item = htObject.items(id);
        if (item == undefined) return;
        for (var i = 0; i < _map.popups.length; i++) {
            if (_map.popups[i].id == id) { _map.removePopup(_map.popups[i]); break; }
        }
        if (item.CLASS_NAME == "OpenLayers.Feature.Vector")
        { item.destroy(); }
        else if (item.CLASS_NAME == "OpenLayers.Marker")
        { markersLayer.removeMarker(marker); }
        htObject.remove(id);
    }

    //第5类：图标操作功能---------------------------------------------
    //添加弹出框内容
    /*
    id
    content     内容         
    */
    this.SetMessage = function (id, content) {
        return this.AddOjbContentMenu(id, content, null, false, false);
    }

    //提示框弹出
    //display      弹出提示框
    this.SetMessageDisplay = function (id, display) {
        var point = htObject.items(id);
        if (point == undefined) return;
        //已存在弹出框，重新显示
        for (var j = 0; j < _map.popups.length; j++) {
            var popup = _map.popups[j];
            if (popup.id == id) {
                if (display) popup.show();
                else popup.hide();
                break;
            }
        }
    }
    //添加链接
    /*
    id 
    memu        菜单 链接方式
    isShow      弹出提示框 
    */
    this.AddMenuItem = function (id, text, callback) {
        var item = GetObject(id);
        var memu = new function () {
            this.value = text;
            this.func = function () {
                callback(item.attributes);
            };
        }
        return AddMenuItem(id, memu, false);
    }
    //第6类：用户操作模式(选点、选矩形区、选圆）------------------------
    /*
    type                1：矩形，2：圆形，3：多边形，4：标记
    handlerCallBack     回调函数
    isAddedDeactivate   只可操作一次（默认），既触发一次自动清空状态
    */
    this.SetSelectMode = function (type, handlerCallBack, isAddedDeactivate) {
        var layers = this.GetLayersByName("_controllayer");
        if (!layers[0]) {
            layer = new OpenLayers.Layer.Vector("_controllayer");
            _map.addLayer(layer);
        }
        var control = null;
        var result = false;
        switch (type) {
            case 1:
                control = new OpenLayers.Control.DrawFeature(layer, OpenLayers.Handler.RegularPolygon, {
                    featureAdded: function (feature) {
                        result = handlerCallBack(feature,
                                        feature.geometry.toString().replace('POLYGON((', '').replace('))', ''),
                                        GetLonlatByDisplayLonlat(feature.geometry.bounds.left, feature.geometry.bounds.bottom),
                                        GetLonlatByDisplayLonlat(feature.geometry.bounds.right, feature.geometry.bounds.top));
                        if (result) { feature.destroy(); }
                        else { _htfeatures.add("slt_rpr_" + GetRandomNum(), feature); }
                        if (isAddedDeactivate == undefined) {
                            control.deactivate();
                            _map.removeControl(control);
                        }
                    },
                    handlerOptions: { sides: 4, irregular: true }
                });
                break;
            case 2:
                control = new OpenLayers.Control.DrawFeature(layer, OpenLayers.Handler.RegularPolygon, {
                    featureAdded: function (feature) {
                        result = handlerCallBack(feature, feature.geometry.toString().replace('POLYGON((', '').replace('))', ''),
                                        GetLonlatByDisplayLonlat(feature.geometry.bounds.left, feature.geometry.bounds.bottom),
                                        GetLonlatByDisplayLonlat(feature.geometry.bounds.right, feature.geometry.bounds.top));
                        if (result) { feature.destroy(); }
                        else { _htfeatures.add("slt_rpc_" + GetRandomNum(), feature); }
                        if (isAddedDeactivate == undefined) {
                            control.deactivate();
                            _map.removeControl(control);
                        }
                    },
                    handlerOptions: { sides: 40, irregular: true }
                });
                break;
            case 3:
                control = new OpenLayers.Control.DrawFeature(layer, OpenLayers.Handler.Polygon, {
                    featureAdded: function (feature) {
                        result = handlerCallBack(feature, feature.geometry.toString().replace('POLYGON((', '').replace('))', ''),
                                        GetLonlatByDisplayLonlat(feature.geometry.bounds.left, feature.geometry.bounds.bottom),
                                        GetLonlatByDisplayLonlat(feature.geometry.bounds.right, feature.geometry.bounds.top));
                        if (result) { feature.destroy(); }
                        else { _htfeatures.add("slt_rp_" + GetRandomNum(), feature); }
                        if (isAddedDeactivate == undefined) {
                            control.deactivate();
                            _map.removeControl(control);
                        }
                    }
                });
                break;
            case 4:
                control = new OpenLayers.Control.DrawFeature(layer, OpenLayers.Handler.Point, {
                    featureAdded: function (feature) {
                        result = handlerCallBack(feature, feature.geometry.toString().replace('POINT(', '').replace(')', ''),
                                        GetLonlatByDisplayLonlat(feature.geometry.bounds.left, feature.geometry.bounds.bottom),
                                        GetLonlatByDisplayLonlat(feature.geometry.bounds.right, feature.geometry.bounds.top));
                        if (result) { feature.destroy(); }
                        else { _htfeatures.add("slt_p_" + GetRandomNum(), feature); }
                        if (isAddedDeactivate == undefined) {
                            control.deactivate();
                            _map.removeControl(control);
                        }
                    }
                });
                break;
            case 5:
                break;
            case 6:
                break;
            default: break;
        }
        control.id = _map.addControl(control);
        control.activate();
        return control;
    }

    //清除 SetSelectMode函数产生的对象 
    this.PolygonClear = function () {
        for (var attr in _htfeatures._hash) {
            _htfeatures._hash[attr].destroy();
        }
        //删除空白control，来自SetSelectMode方法产生的
        for (var i = _map.controls.length - 1; i < _map.controls.length && i >= 0; i--) {
            if (_map.controls[i].CLASS_NAME == "OpenLayers.Control.Measure" || _map.controls[i].CLASS_NAME == "OpenLayers.Control.DrawFeature") {
                _map.removeControl(_map.controls[i]);
            }
        }
        var layers = this.GetLayersByName("_controllayer");
        if (layers[0])
            this._map.removeLayer(layers[0], true);
        //this.switcherLayer.redraw();
        _htfeatures.clear();
    }
    //第7类：聚合功能（只对point对象）---------------------------------
    //添加聚合point
    this.AddtoCluster = function (id, isNowCluster) {
        var item = htObject.items(id);
        if (item == undefined)
            return;
        if (item.CLASS_NAME != "OpenLayers.Feature.Vector")
            return;
        this.clusterspoint.push(item);
        if (isNowCluster)
            this.StrategyCluster();
    }

    //聚合对象[Point 对象]
    /*    
    */
    this.StrategyCluster = function () {

        if (!this.clusters) {
            //画点图层
            this._strategy = new OpenLayers.Strategy.Cluster();
            this.clusters = new OpenLayers.Layer.Vector("Clusters", {
                strategies: [this._strategy],
                styleMap: new OpenLayers.StyleMap(new OpenLayers.Style({
                    fontSize: "${fontSize}",
                    labelAlign: "cm",
                    fontColor: "${fontColor}"
                }, {
                    rules: [
    new OpenLayers.Rule({
        filter: new OpenLayers.Filter.Comparison({      //设置单点时的图标
            type: OpenLayers.Filter.Comparison.EQUAL_TO,
            property: "count",  //获取合并点数
            value: 1
        }),
        symbolizer: {
            label: "${label}",   //获取显示文字
            graphicWidth: "${graphicWidth}",
            labelXOffset: 0,  //设置显示文字的偏移量
            labelYOffset: -20, //设置显示文字的偏移量
            title: "${title}",
            externalGraphic: "${img1}"  //获取显示图标
        }
    }),
    new OpenLayers.Rule({
        // apply this rule if no others apply
        elseFilter: true,
        symbolizer: {
            externalGraphic: "${imgs}",
            graphicWidth: "${graphicWidths}",
            pointRadius: "${radius}",  //计算点半径
            fillColor: "#ffcc66",
            //fillOpacity: 0.8,
            strokeColor: "${strokeColor}",
            strokeWidth: "${strokeWidth}",
            //label: "${count}",  //获取合并点数
            title: "对象数：${count}",
            labelXOffset: 0, //设置显示文字的偏移量
            labelYOffset: -20, //设置显示文字的偏移量
            strokeOpacity: 1
        }
    })
                    ],
                    context: {
                        id: function (feature) { return feature.cluster[0].data.id; },
                        type: function (feature) { return feature.cluster[0].data.type; },
                        key: function (feature) { return feature.cluster[0].data.key; },
                        strokeWidth: function (feature) { return (feature.cluster) ? 2 : 1; },
                        radius: function (feature) {
                            var pix = 2;
                            if (feature.cluster) { pix = Math.min(feature.attributes.count, 7) + 2; }
                            return pix;
                        },
                        count: function (feature) { return feature.attributes.count; },
                        label: function (feature) { return feature.cluster[0].data.label; },
                        title: function (feature) { return feature.cluster[0].data.title; },
                        img1: function (feature) { return feature.cluster[0].data.img1; },
                        imgs: function (feature) { if (typeof (feature.cluster[0].data.imgsExFun) == "function") { return feature.cluster[0].data.imgsExFun(feature); } return feature.cluster[0].data.imgs; },
                        fontSize: function (feature) { return feature.cluster[0].data.fontSize; },
                        fontColor: function (feature) { return feature.cluster[0].data.fontColor; },
                        strokeColor: function (feature) { return feature.cluster[0].data.strokeColor; },
                        graphicWidth: function (feature) { return feature.cluster[0].data.graphicWidth; },
                        graphicWidths: function (feature) { return (feature.cluster[0].data.graphicWidths) ? (feature.cluster[0].data.graphicWidths) : feature.cluster[0].data.graphicWidth * 1.5; }
                    }
                }))
            });
            _map.addLayer(this.clusters);

            //注册点击事件
            this.clusters.events.register("click", this, function (evt) {
                var lonlat;
                var id = '';
                var htInfo = new Hashtable();
                var feature = null;
                for (var i = 0; i < this.clusters.features.length; i++) {
                    if (this.clusters.features[i].geometry.id == evt.srcElement.id) {
                        //多个对象
                        if (this.clusters.features[i].cluster.length > 1) {
                            feature = this.clusters.features[i];
                            var cid = "clusters_" + GetRandomNum();
                            var chtml = "<div style='height:20px;font-family:宋体;font-size:10pt;text-align:center;border-bottom: solid 1px #99ccff;'>列表</div>";
                            for (var j = 0; j < this.clusters.features[i].cluster.length; j++) {
                                chtml += "<div style='height:auto;width:150px;text-align:left;border-bottom: solid 1px #999999;font-size:9pt;'>";
                                if (this.clusters.features[i].cluster[j].attributes._html == undefined) {
                                    chtml += "<label style='height:15px;font-family:宋体;'>" + this.clusters.features[i].cluster[j].attributes.value.trim() + "</label>";
                                    chtml += '</div>';
                                    continue;
                                }
                                chtml += "<a id='" + cid + "style='font-family:宋体;font-size:9pt;cursor:hand' href='javascript:void(0);'onclick=MenuCallback_Clusters('" + this.clusters.features[i].cluster[j].attributes._id + "','" + cid + "')>" + this.clusters.features[i].cluster[j].attributes.value + "</a>";

                                chtml += '</div>';
                            }
                            feature.attributes._id = cid;
                            feature.attributes._html = chtml;
                            if (htObject.contains(cid) == false) { htObject.add(cid, feature); }
                            AddOjbContentMenu(cid, chtml, null, true, false);
                            break;
                        }
                        //单个对象
                        for (var j = 0; j < this.clusters.features[i].cluster.length; j++) {
                            this.clusters.features[i].cluster[j].attributes.func(this.clusters.features[i].cluster[j].attributes._id);
                        }
                        //lonlat = new OpenLayers.LonLat(this.clusters.features[i].geometry.x, this.clusters.features[i].geometry.y);
                        break;
                    }
                }
                if (feature == null) { return };
            });
        }
        this._strategy.distance = this._distance;   //设置合并范围，像素值
        this._strategy.threshold = 1; //可选阈值低于初始Features将被添加到层而不是集群
        this.clusters.removeAllFeatures();
        for (var i = 0; i < this.clusterspoint.length; i++) {
            var pointlayer = this.clusterspoint[i].layer;
            if (pointlayer == undefined) continue;
            if (pointlayer.name != "Clusters") {
                pointlayer.removeFeatures([this.htObject.items(this.clusterspoint[i].attributes._id)]);
            }
        }
        this.clusters.addFeatures(this.clusterspoint);

    }


    //添加聚合高级方式
    this.AddtoCluster2 = function (id) {
        var item = htObject.items(id);
        if (item == undefined)
            return;
        if (item.CLASS_NAME != "OpenLayers.Feature.Vector")
            return;
        this.points.push(item);
    }
    //聚合对象高级方式[Point 对象]
    /*    
    */
    this.StrategyCluster2 = function (clusterId, clusterPoints, clusterDistance) {
        var clusters2, _strategy2;
        if (clusterDistance == undefined || clusterDistance == '') { clusterDistance = this._distance; }
        if (clusterId == undefined || clusterId == '') {
            clusterId = "Clusters" + GetRandomNum();
            //画点图层
            _strategy2 = new OpenLayers.Strategy.Cluster();
            clusters2 = new OpenLayers.Layer.Vector(clusterId, {
                strategies: [_strategy2],
                styleMap: new OpenLayers.StyleMap(new OpenLayers.Style({
                    fontSize: "${fontSize}",
                    labelAlign: "cm",
                    fontColor: "${fontColor}"
                }, {
                    rules: [
    new OpenLayers.Rule({
        filter: new OpenLayers.Filter.Comparison({      //设置单点时的图标
            type: OpenLayers.Filter.Comparison.EQUAL_TO,
            property: "count",  //获取合并点数
            value: 1
        }),
        symbolizer: {
            label: "${label}",   //获取显示文字
            graphicWidth: "${graphicWidth}",
            labelXOffset: 0,  //设置显示文字的偏移量
            labelYOffset: -20, //设置显示文字的偏移量
            title: "${title}",
            externalGraphic: "${img1}"  //获取显示图标
        }
    }),
    new OpenLayers.Rule({
        // apply this rule if no others apply
        elseFilter: true,
        symbolizer: {
            externalGraphic: "${imgs}",
            graphicWidth: "${graphicWidths}",
            pointRadius: "${radius}",  //计算点半径
            fillColor: "#ffcc66",
            //fillOpacity: 0.8,
            strokeColor: "${strokeColor}",
            strokeWidth: "${strokeWidth}",
            //label: "${count}",  //获取合并点数
            title: "对象数：${count}",
            labelXOffset: 0, //设置显示文字的偏移量
            labelYOffset: -20, //设置显示文字的偏移量
            strokeOpacity: 1
        }
    })
                    ],
                    context: {
                        id: function (feature) { return feature.cluster[0].data.id; },
                        type: function (feature) { return feature.cluster[0].data.type; },
                        key: function (feature) { return feature.cluster[0].data.key; },
                        strokeWidth: function (feature) { return (feature.cluster) ? 2 : 1; },
                        radius: function (feature) {
                            var pix = 2;
                            if (feature.cluster) { pix = Math.min(feature.attributes.count, 7) + 2; }
                            return pix;
                        },
                        count: function (feature) { return feature.attributes.count; },
                        label: function (feature) { return feature.cluster[0].data.label; },
                        title: function (feature) { return feature.cluster[0].data.title; },
                        img1: function (feature) { return feature.cluster[0].data.img1; },
                        imgs: function (feature) { if (typeof (feature.cluster[0].data.imgsExFun) == "function") { return feature.cluster[0].data.imgsExFun(); } return feature.cluster[0].data.imgs; },
                        fontSize: function (feature) { return feature.cluster[0].data.fontSize; },
                        fontColor: function (feature) { return feature.cluster[0].data.fontColor; },
                        strokeColor: function (feature) { return feature.cluster[0].data.strokeColor; },
                        graphicWidth: function (feature) { return feature.cluster[0].data.graphicWidth; },
                        graphicWidths: function (feature) { return (feature.cluster[0].data.graphicWidths) ? (feature.cluster[0].data.graphicWidths) : feature.cluster[0].data.graphicWidth * 1.5; }
                    }
                }))
            });
            _map.addLayer(clusters2);

            //注册点击事件
            clusters2.events.register("click", clusters2, function (evt) {
                var lonlat;
                var id = '';
                var htInfo = new Hashtable();
                var feature = null;
                for (var i = 0; i < clusters2.features.length; i++) {
                    if (clusters2.features[i].geometry.id == evt.srcElement.id) {
                        //多个对象
                        if (clusters2.features[i].cluster.length > 1) {
                            feature = clusters2.features[i];
                            var cid = "clusters2_" + GetRandomNum();
                            var chtml = "<div style='height:20px;font-family:宋体;font-size:10pt;text-align:center;border-bottom: solid 1px #99ccff;'>列表</div>";
                            for (var j = 0; j < clusters2.features[i].cluster.length; j++) {
                                chtml += "<div style='height:auto;width:150px;text-align:left;border-bottom: solid 1px #999999;font-size:9pt;'>";
                                if (clusters2.features[i].cluster[j].attributes._html == undefined) {
                                    chtml += "<label style='height:15px;font-family:宋体;'>" + clusters2.features[i].cluster[j].attributes.value.trim() + "</label>";
                                    chtml += '</div>';
                                    continue;
                                }
                                chtml += "<a id='" + cid + "style='font-family:宋体;font-size:9pt;cursor:hand' href='javascript:void(0);'onclick=MenuCallback_Clusters('" + clusters2.features[i].cluster[j].attributes._id + "','" + cid + "')>" + clusters2.features[i].cluster[j].attributes.value + "</a>";

                                chtml += '</div>';
                            }
                            feature.attributes._id = cid;
                            feature.attributes._html = chtml;
                            if (htObject.contains(cid) == false) { htObject.add(cid, feature); }
                            AddOjbContentMenu(cid, chtml, null, true, false);
                            break;
                        }
                        //单个对象
                        for (var j = 0; j < clusters2.features[i].cluster.length; j++) {
                            clusters2.features[i].cluster[j].attributes.func(clusters2.features[i].cluster[j].attributes._id);
                        }
                        break;
                    }
                }
                if (feature == null) { return };
            });
        }
        else {
            clusters2 = this.GetLayersByName(clusterId)[0];
            _strategy2 = clusters2.strategies;
        }
        _strategy2.distance = clusterDistance;   //设置合并范围，像素值
        _strategy2.threshold = 1; //可选阈值低于初始Features将被添加到层而不是集群
        clusters2.removeAllFeatures();
        //for (var i = 0; i < clusterspoint2.length; i++) {
        //    var pointlayer = clusterspoint2[i].layer;
        //    if (pointlayer == undefined) continue;
        //    if (pointlayer.name != "Clusters") {
        //        pointlayer.removeFeatures([this.htObject.items(clusterspoint2[i].attributes._id)]);
        //    }
        //}
        clusters2.addFeatures(clusterPoints);
        return clusterId;
    }

    //第8类：测量功能-------------------------------------------------
    //创建一个测量控件  测距、测面积
    //按住shift键同时激活徒手模式。在徒手画直线或多边形模式,摁住鼠标,将每一次鼠标移动。
    //completeFun    完成时调用  返回距离或平方公里
    //partialFun     每移动时调用(每当位置变化时) 距离或平方公里
    this.CreateMeasurControls = function (layerid, completeFun, partialFun) {
        var renderer = OpenLayers.Layer.Vector.prototype.renderers;
        this._measureControls = {
            line: new OpenLayers.Control.Measure(
            OpenLayers.Handler.Path, {
                persist: true,
                handlerOptions: {
                    layerOptions: {
                        renderers: renderer,
                        styleMap: this._styleMap
                    }
                }
            }
        ),
            polygon: new OpenLayers.Control.Measure(
        OpenLayers.Handler.Polygon, {
            persist: true,
            handlerOptions: {
                layerOptions: {
                    renderers: renderer,
                    styleMap: new OpenLayers.StyleMap({
                        'default': {
                            strokeColor: "red",
                            strokeOpacity: 1,
                            strokeWidth: "1",
                            strokeDashstyle: "dashdot",
                            fillColor: "red",
                            fillOpacity: 0.3
                        }
                    })
                }
            }
        }
    )
        };
        var control;
        for (var key in this._measureControls) {
            control = this._measureControls[key];
            control.events.on({
                "measure": function (m) {
                    var geometry = m.geometry;
                    var units = m.units == "km" ? "公里" : m.units == "m" ? "米" : m.units;
                    var order = m.order;  //order =1 距离
                    var measure = m.measure;
                    var pointList = [];
                    var lineinfo = new function () {
                        this.isdisplaypoint = true;
                        this.pointstylelist = [];
                        this.pointattrslist = [];
                        this.attributes = new GisAttributes();
                        this.style = new GisObjectStyle();
                    };
                    lineinfo.style.strokeDashstyle = "solid";
                    lineinfo.style.fontColor = "blue";
                    lineinfo.attributes.type = "measure_line_obj";
                    if (order == 1) {
                        for (var i = 0; i < geometry.components.length; i++) {
                            lineinfo.pointattrslist[i] = new GisAttributes();
                            lineinfo.pointattrslist[i].type = "measure_line_obj";
                            lineinfo.pointstylelist[i] = new GisObjectStyle();
                            lineinfo.pointstylelist[i].label = (i == geometry.components.length - 1) ? measure.toFixed(3) + "" + units : '';
                            lineinfo.pointstylelist[i].strokeColor =
                                                    (i == 0 ? "#00FF00" : i == geometry.components.length - 1 ? "#FF0000" : "#0000FF");
                            lineinfo.pointstylelist[i].fontColor = "blue";
                            lineinfo.pointstylelist[i].pointRadius = 2;
                            pointList.push(GetGeometyPointBydisplaylonlat(geometry.components[i].x, geometry.components[i].y));
                        }
                        AddLine(layerid, pointList, lineinfo);
                    }
                    else {
                        for (var i = 0; i < geometry.components[0].components.length; i++) {
                            lineinfo.pointattrslist[i] = new GisAttributes();
                            lineinfo.pointattrslist[i].type = "measure_line_obj";
                            lineinfo.pointstylelist[i] = new GisObjectStyle();
                            lineinfo.pointstylelist[i].label =
                                         (i == geometry.components[0].components.length - 2 ? measure.toFixed(3) + "平方" + units : '');
                            lineinfo.pointstylelist[i].fontColor = "blue";
                            lineinfo.pointstylelist[i].pointRadius = 2;
                            pointList.push(GetGeometyPointBydisplaylonlat(geometry.components[0].components[i].x, geometry.components[0].components[i].y));
                        }
                        AddPolygon(layerid, pointList, lineinfo);
                    }
                    completeFun(measure.toFixed(3), m); //完成时
                },
                "measurepartial": function (m) {
                    var measure = m.measure;
                    partialFun(measure.toFixed(3), m); //每当位置变化时
                }
            });
            _map.addControl(control);
        }
        return this._measureControls;
    }

    //测量对象
    this.ToggleControl = function (type) {
        for (key in this._measureControls) {
            var control = this._measureControls[key];
            if (type == key) {
                control.activate(); control.geodesic = true; control.setImmediate(true);
            } else { control.deactivate(); }
        }
    }

    //清空测量对象
    this.ClearMeasureObj = function () {
        for (var attr in htObject._hash) {
            var item = htObject._hash[attr];
            if (item.attributes == undefined) continue;
            if (item.attributes.type != 'measure_line_obj') continue;
            item.destroy();
            htObject.remove(attr);
        }
    }

    //第9类：辅助对象-------------------------------------------------
    //辅助对象属性 系统内置三个属性 _id/_type/_html 请勿使用！
    this.GisAttributes = function () {
        this.id = null;
        this.type = null;
        this.code = null;
        this.msg = null;
        this.xml = null;
        this.name = null;
        this.value = null;
        this.obj = null;
        this.obj1 = null;
    }

    //对象样式
    /*
    id                      id
    key                     自定义 类型 
    label                   The text for an optional label.（显示的文字）            
    title                   鼠标移上去显示文字    
    externalGraphic         图标URL
    graphicWidth            图标的宽度
    graphicXOffset          图标X轴偏移量 单位px    
    graphicYOffset          图标Y轴偏移量 单位px   
    img1                    当聚合时 一个对象的图标URL
    imgs                    当聚合时 多个对象的图标URL
    imgsExFun               当聚合时 扩展当类型为function时，自定义返回图标
    fontcolor               label的颜色
    labelXOffset            文字X轴方向偏移量 单位px
    labelYOffset            文字Y轴方向偏移量 单位px
    cursor                  鼠标移动上面的图标
    fillColor               填充区颜色 
    fillOpacity             填充区透明度 0-1，1不透明    
    strokeColor             边框颜色
    strokeWidth             边框、线条宽度 px          
    strokeDashstyle         线的破折样式(“dot”, “dash”, “dashdot”, “longdash”, “longdashdot”, or “solid”) 
    strokeOpacity           边框透明度   0-1，1不透明    
    ....
    */
    this.GisObjectStyle = function (id, label) {
        this.id = (id == null) ? "" : id;
        this.label = (label == null) ? "" : label;
        this.title = "";
        this.externalGraphic = null;
        this.graphicWidth = 24;
        this.graphicWidths = 32;
        this.graphicXOffset = -1 * this.graphicWidth / 2;
        this.graphicYOffset = -1 * this.graphicWidth / 2;
        this.img1 = 'OpenLayers/img/marker.png';
        this.imgs = 'OpenLayers/img/marker.png';
        this.imgsExFun = null;
        this.fontColor = "#000000";
        this.fontSize = "9pt";
        this.fontFamily = "Courier New, monospace";
        this.labelXOffset = 0;
        this.labelYOffset = this.graphicYOffset - 10;
        this.cursor = "inherit";
        this.fillColor = "#ee9900";
        this.fillOpacity = 0.6;
        this.strokeColor = "#ee9900";
        this.strokeWidth = 2;
        this.strokeOpacity = 1;
        this.strokeDashstyle = "solid";
        this.strokeLinecap = "round";
        this.hoverFillColor = "white";
        this.hoverFillOpacity = 0.8;
        this.hoverPointRadius = 1;
        this.hoverPointUnit = "%";
        this.hoverStrokeColor = "red";
        this.hoverStrokeOpacity = 1;
        this.hoverStrokeWidth = 0.2;
        this.labelAlign = "cm";
        this.labelOutlineColor = "white";
        this.labelOutlineWidth = 3;
        this.pointerEvents = "visiblePainted";
        this.pointRadius = 3;

        //返回值
        return {
            id: this.id,
            title: this.title,
            label: this.label,
            externalGraphic: this.externalGraphic,
            graphicWidth: this.graphicWidth,
            graphicWidths: this.graphicWidths,
            graphicXOffset: this.graphicXOffset,
            graphicYOffset: this.graphicYOffset,
            img1: this.img1,
            imgs: this.imgs,
            fontcolor: this.fontcolor,
            labelXOffset: this.labelXOffset,
            labelYOffset: this.labelYOffset,
            cursor: this.cursor,
            fillColor: this.fillColor,
            fillOpacity: this.fillOpacity,
            fontColor: this.fontColor,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            hoverFillColor: this.hoverFillColor,
            hoverFillOpacity: this.hoverFillOpacity,
            hoverPointRadius: this.hoverPointRadius,
            hoverPointUnit: this.hoverPointUnit,
            hoverStrokeColor: this.hoverStrokeColor,
            hoverStrokeOpacity: this.hoverStrokeOpacity,
            hoverStrokeWidth: this.hoverStrokeWidth,
            labelAlign: this.labelAlign,
            labelOutlineColor: this.labelOutlineColor,
            labelOutlineWidth: this.labelOutlineWidth,
            pointerEvents: this.pointerEvents,
            pointRadius: this.pointRadius,
            strokeColor: this.strokeColor,
            strokeDashstyle: this.strokeDashstyle,
            strokeLinecap: this.strokeLinecap,
            strokeOpacity: this.strokeOpacity,
            strokeWidth: this.strokeWidth
        };
    }
    //第10类：其他----------------------------------------------------

    // 注册拖拉、缩放完成时触发事件
    /*    
    obj : 回调事件func中的this对象
    func：回调事件    
    OpenLayers.Bounds对象
    getExtent() 可以获取范围，边界框。数据存储为左,底部,右，顶部 ,float。
    toGeometry() OpenLayers.Geometry.Polygon 对象 多边形，containsPoint 判断一个point对象是否在范围内；
    */
    this.RegisterMoveend = function (obj, func) {
        _map.events.register("moveend", obj, func);
    }
    //取消注册 拖拉、缩放完成时触发事件(注意：由于采用队列的方式可以注册多个事件，取消时必须是注册时指定的obj和func)
    this.UnRegisterMoveend = function (obj, func) {
        _map.events.unregister("moveend", obj, func);
    }

    //add by qiubaosheng 20170225
    ////地图坐标转换为屏幕坐标,return "X坐标，Y坐标" 如："880,432"
    //function GetScreenCoordFromMapCoord(lon, lat) {
    //    var lonlat = this.GetDisplayLonlat(lon, lat);
    //    var x = parseInt(_map.size.w * (lonlat.lon - extent.left) / (extent.right - extent.left));
    //    var y = parseInt(_map.size.h * (lonlat.lat - extent.top) / (extent.bottom - extent.top));
    //    return new OpenLayers.Pixel(x, y);
    //}

    ////得到当前屏幕对角（左上角、右下角）范围, return "左上角经度，左上角纬度；右下角经度，右下角纬度"
    //function GetViewBounds() {
    //    var extent = _map.getExtent();
    //    var leftTopLonLat = this.GetLonlatByDisplayLonlat(extent.left, extent.top);
    //    var rightBottomLonLat = this.GetLonlatByDisplayLonlat(extent.right, extent.bottom);
    //    return leftTopLonLat.lon + "," + leftTopLonLat.lat + ";" + rightBottomLonLat.lon + "," + rightBottomLonLat.lat;
    //}

    ////设置当前窗口范围，参数：左上角经纬度、右下角经纬度
    //function SetViewBounds(leftTopLon, leftTopLat, rightBottomLon, rightBottomlat) {
    //    var leftTopLonLat = this.GetDisplayLonlat(leftTopLon, leftTopLat);
    //    var rightBottomLonLat = this.GetDisplayLonlat(rightBottomLon, rightBottomlat);
    //    var bounds = new OpenLayers.Bounds(leftTopLonLat.lon, leftTopLonLat.lat, rightBottomLonLat.lon, rightBottomLonLat.lat);
    //    _map.zoomToExtent(bounds, true);
    //}
    //----end add   by qiubaosheng 20170225


    //******************************内部调用*****************************************
    //初始化整个MAP对象
    function _Init(options, zoom, url, showOverview) {
        //参数
        var _options = {
            numZoomLevels: this._numZoomLevels, //（表示有几个缩放级别）
            projection: "EPSG:900913",          //坐标系 EPSG:900913
            displayProjection: "EPSG:4326",     //坐标系
            //fractionalZoom: true,
            isBaseLayer: true,
            sateTiles: false
        };
        if (options != null && options != "")
            _options = options;
        var layer = new OpenLayers.Layer.QQMap("地图",
                    [(url == undefined ? this._url : url)],
                   {
                       numZoomLevels: 19,              //（表示有几个缩放级别）
                       projection: "EPSG:900913",      //坐标系 EPSG:900913
                       displayProjection: "EPSG:4326", //坐标系
                       isBaseLayer: true,
                       sateTiles: false,
                       imgdirname: "maptilesv3"
                   }
                );
        var layersatellite = new OpenLayers.Layer.QQMap("卫星",
                    [(url == undefined ? this._url : url)],
                    {
                        numZoomLevels: 15,              //（表示有几个缩放级别）
                        projection: "EPSG:900913",      //坐标系 EPSG:900913
                        displayProjection: "EPSG:4326", //坐标系
                        isBaseLayer: true,
                        sateTiles: true,
                        imgdirname: "sateTiles"
                    }
                );
        var layerssatellitetran = new OpenLayers.Layer.QQMap("卫星标注",
                    [(url == undefined ? this._url : url)],
                    {
                        numZoomLevels: 19,              //（表示有几个缩放级别）
                        projection: "EPSG:900913",      //坐标系 EPSG:900913
                        displayProjection: "EPSG:4326", //坐标系
                        visibility: false,
                        sateTiles: false,
                        isBaseLayer: false,
                        imgdirname: "sateTranTiles"
                    }
                );

        _map = new OpenLayers.Map(
            {
                div: divName,
                layers: [layer, layersatellite, layerssatellitetran],
                center: [0, 0],
                zoom: zoom
            });

        //地图上点击事件 
        //_map.events.register("click", null, function(e) { });

        //添加标注
        markersLayer = new OpenLayers.Layer.Markers("兴趣标记", { visibility: false });
        _map.addLayer(markersLayer);

        //选择控件层
        selectFeatureControl = new OpenLayers.Control.SelectFeature([markersLayer],
                {
                    // clickFeature: function(feature) {
                    // feature.attributes.func();
                    // },
                    onBeforeSelect: function (feature) {
                        if (typeof (feature.attributes.beforeselectfunc) == "function")
                            feature.attributes.beforeselectfunc(feature.attributes._id, feature);
                    },
                    onSelect: function (feature) {
                        if (typeof (feature.attributes.selectfunc) == "function")
                            feature.attributes.selectfunc(feature.attributes._id, feature);
                    },
                    onUnselect: function (feature) {
                        if (typeof (feature.attributes.unselectfunc) == "function")
                            feature.attributes.unselectfunc(feature.attributes._id, feature);
                    },
                    multipleSelect: function ()
                    { },
                    hover: false,
                    multiple: false,
                    multipleKey: 'altKey'
                });
        //支持多选 multipleKey（多选健设置 (‘altKey’ or ‘shiftKey’）
        selectFeatureControl.multiple = false;
        selectFeatureControl.multipleKey = "altKey";
        //activate/deactivate 选择控件启用/取消
        _map.addControl(selectFeatureControl);
        //移除默认的zoom控件
        var zoomControl = this._map.getControlsByClass('OpenLayers.Control.Zoom')[0];
        _map.removeControl(zoomControl);
        //选择图层
        _strategy = new OpenLayers.Strategy.Cluster();
        // 定义controls 和初始地图范围
        //缩放杆
        _map.addControl(new OpenLayers.Control.PanZoomBar({ position: new OpenLayers.Pixel(2, 5) }));
        //默认的鼠标对地图的操作（比如对地图的双击执行放大，滚轮滚动执行放大缩小）
        _map.addControl(new OpenLayers.Control.Navigation());
        //右上角图层
        //this.switcherLayer = new OpenLayers.Control.LayerSwitcher();
        //_map.addControl(switcherLayer);
        ////中文显示
        //this.switcherLayer.dataLbl.innerHTML = "叠加图层";
        //this.switcherLayer.baseLbl.innerHTML = "地图类型";
        //鼠标位置坐标
        _map.addControl(new OpenLayers.Control.MousePosition({ element: document.getElementById('div1') }));
        //将比例尺设置为中文
        OpenLayers.INCHES_PER_UNIT["千米"] = OpenLayers.INCHES_PER_UNIT["km"];
        OpenLayers.INCHES_PER_UNIT["米"] = OpenLayers.INCHES_PER_UNIT["m"];
        OpenLayers.INCHES_PER_UNIT["英里"] = OpenLayers.INCHES_PER_UNIT["mi"];
        OpenLayers.INCHES_PER_UNIT["英尺"] = OpenLayers.INCHES_PER_UNIT["ft"];
        _map.addControl(new OpenLayers.Control.ScaleLine({
            topOutUnits: "千米", topInUnits: "米", bottomOutUnits: "英里", bottomInUnits: "英尺"//如果底部单位为空 则不显示比例尺下部分
        }));

        // 缩微图（鹰眼图）
        if (showOverview != undefined && showOverview != false)
            _map.addControl(new OpenLayers.Control.LTOverviewMap());

        // style the sketch fancy
        var sketchSymbolizers = {
            "Point": { pointRadius: 2, graphicName: "square", fillColor: "white", fillOpacity: 1, strokeWidth: 1, strokeOpacity: 1, strokeColor: "#333333" },
            "Line": { strokeWidth: 1, strokeOpacity: 1, strokeColor: "#666666", strokeDashstyle: "dash" },
            "Polygon": { strokeWidth: 2, strokeOpacity: 1, strokeColor: "#666666", fillColor: "white", fillOpacity: 0.3 }
        };
    }

    //获取地图中心 
    //retrun OpenLayers.LonLat.lon 经度；OpenLayers.LonLat.lat纬度 
    this.GetCenter = function () {
        return _map.getCenter().transform("EPSG:900913", "EPSG:4326 ");
    }

    //获取一个OpenLayers经纬度，并转换为屏幕投影
    this.GetDisplayLonlat = function (lon, lat) {
        var lonLat = new OpenLayers.LonLat(lon, lat);
        lonLat.transform("EPSG:4326", "EPSG:900913");
        return lonLat;
    }
    //根据屏幕投影经纬度,转换成一个OpenLayers经纬度
    this.GetLonlatByDisplayLonlat = function (dislon, dislat) {
        var lonLat = new OpenLayers.LonLat(dislon, dislat);
        lonLat.transform("EPSG:900913", "EPSG:4326");
        return lonLat;
    }

    //获取一个OpenLayers.Icon(图标)对象；图标地址，宽度，高度 
    this.GetIcon = function (url, width, height) {
        var size = new OpenLayers.Size(width == null ? 21 : width, height == null ? 25 : height);
        var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
        return new OpenLayers.Icon((url == null ? '../OpenLayers/img/marker.png' : url), size, offset)
    }

    //根据经纬度获取一个point对象
    this.GetGeometyPoint = function (lon, lat) {
        var displayLonlat = GetDisplayLonlat(lon, lat)
        return new OpenLayers.Geometry.Point(displayLonlat.lon, displayLonlat.lat);
    }

    //根据经纬度获取一个point对象
    this.GetGeometyPointBydisplaylonlat = function (displaylon, displaylat) {
        return new OpenLayers.Geometry.Point(displaylon, displaylat);
    }

    //获取一个Point对象 用于聚合层
    //point OpenLayers.Geometry.Point 对象
    //sytle 样式，以及聚合层对象的属性【data】
    this.GetPoint = function (point, style, attributes) {
        var pcid = "point_" + GetRandomNum();
        var feature = new OpenLayers.Feature.Vector(point, style);
        //属性、样式 初始化
        if (attributes == null || attributes == '') {
            attributes = new GisAttributes();
            attributes.id = pcid;
        }
        if (attributes.id == undefined || attributes.id == '')
            attributes.id = pcid;
        attributes._id = pcid;
        if (style == null || style == '') {
            style = new GisObjectStyle('', '');
            style.id = pcid;
        }
        if (style != undefined)
            feature.style = style;
        if (attributes != undefined) {
            attributes._type = "point";
            feature.attributes = attributes;
        }

        if (htObject.contains(pcid) == false) { htObject.add(pcid, feature); }
        return pcid;
    }

    //添加功能按钮
    /*
    divId 
    id  
    text 显示文字
    clickCallFunc 回调函数
    */
    this.AddButton = function (divId, id, text, clickCallFunc) {
        var button = document.createElement("BUTTON");
        button.value = text;
        button.id = id;
        if (typeof (clickCallFunc) == "function")
            button.onclick = function () {
                return clickCallFunc(this);
            };
        document.getElementById(divId).appendChild(button);
        return button;
    }

    //删除功能按钮
    this.RemoveButton = function (divId, id) {
        document.getElementById(divId).removeChild(document.getElementById(id));
    }

    //内部方式，请勿调用
    this.MenuCallback = function (id) {
        var item = GetObject(id);
        var click = htObjClickMenu.items(id);
        if (click == undefined) return;
        click.func(item.attributes);
    }
    //添加弹出框内容、链接
    this.AddMenuItem = function (id, memu, isShow) {
        return this.AddOjbContentMenu(id, null, memu, isShow, true);
    }

    //添加弹出框内容、链接
    /*
    id
    content     内容
    memu        菜单 链接方式
    isShow      弹出提示框
    isAppend    是否追加到content上（默认true）
    */
    this.AddOjbContentMenu = function (id, content, memu, isShow, isAppend) {
        var item = htObject.items(id);
        if (item == undefined) return;
        var p = document.getElementById("div_p_" + id);
        if (!p) {
            p = document.createElement("DIV");
            p.id = "div_p_" + id;
        }
        p.style.height = "100%";
        var ph = document.getElementById("div_ph_" + id);
        if (!ph) {
            ph = document.createElement("DIV");
            ph.style.fontSize = '9pt';
            ph.id = "div_ph_" + id;
            p.appendChild(ph);
        }
        if (isAppend == false) ph.innerHTML = '';
        if (content != undefined) ph.innerHTML += content;
        var pc = document.getElementById("div_pc_" + id);
        if (!pc) {
            pc = document.createElement("DIV");
            pc.id = "div_pc_" + id;
            p.appendChild(pc);
        }
        if (memu != undefined)
            pc.innerHTML += "<a id='" + id + "_" + memu.id + "' class=" + memu.cls + " style='font-family:宋体;font-size:9pt;cursor:hand' href='javascript:void(0);'onclick=MenuCallback('" + id + "')>" + memu.value + "</a><br/>";
        if (htObjClickMenu.contains(id) == false && memu != undefined)
            htObjClickMenu.add(id, memu);
        if (item.attributes._html == undefined) item.attributes._html = p.outerHTML;
        this.AddPointMsg(id, p.outerHTML, isShow);
        return p.outerHTML;
    }
    //增加删除菜单

    //*************************Marker***************************
    /* 添加Marker对象   
    lon 经度 
    lat 纬度
    info对象
    info.icon       图标(1)Icon url地址 （2）调用GetIcon方式获取一个图标对象
    info.opacity    透明度 0 — 1 ，1=不透明
    info.closeBox   是否显示弹出提示框 右上角 关闭 按钮
    info.overflow   超出部分自动显示滚动条    
    clickCallFun    
    bool            若为 True 则调用默认弹出界面并自动加载 htmlContent；
    function        若为函数直接回调该函数，不再出现弹出框
    htmlContent     弹出框内容 HTML格式 
    */
    this.AddMarker = function (lon, lat, info, clickCallFun, htmlContent) {
        var mid = "marker_" + GetRandomNum();
        if (info.icon == null) {
            info.icon = this.GetIcon();
        }
        var marker = new OpenLayers.Marker(this.GetDisplayLonlat(lon, lat));
        if (typeof (info.icon) == 'string') { marker.icon.url = info.icon; }
        else {
            marker.icon.url = info.icon.url;
            marker.icon.size = info.icon.size;
        }
        if (clickCallFun != undefined && clickCallFun != null && clickCallFun == true) {
            var feature = new OpenLayers.Feature(markersLayer, this.GetDisplayLonlat(lon, lat));
            feature.closeBox = info.closeBox == null ? true : info.closeBox;
            feature.popupClass = OpenLayers.Popup.FramedCloud;
            feature.data.popupContentHTML = htmlContent;
            feature.data.overflow = (info.overflow == null ? true : info.overflow) ? "auto" : "hidden";
            var markerClick = function (evt) {
                if (this.popup == null) {
                    this.popup = this.createPopup(this.closeBox);
                    this.popup.autoSize = true;
                    this.popup.id = mid;
                    _map.addPopup(this.popup);
                    this.popup.show();
                }
                else { this.popup.toggle(); }
                OpenLayers.Event.stop(evt);
            };
            marker.events.register("click", feature, markerClick);
        }
        else if (typeof (clickCallFun) == "function") {
            marker.events.register("click", this, function (evt) {
                clickCallFun([markercall, BackInfo]);
            });
        }
        if (typeof (info.opacity) == 'number')
            marker.setOpacity(info.opacity);

        markersLayer.addMarker(marker);
        if (htObject.contains(mid) == false) { htObject.add(mid, marker); };
        return mid;
    }

    /*修改 Marker
    info.icon       图标(1)Icon url地址 （2）调用GetIcon方式获取一个图标对象
    info.opacity    透明度 0——1
    info.closeBox   是否显示 右上角 关闭 按钮
    */
    this.SetMarkerInfo = function (id, info, htmlContent) {
        var marker = htObject.items(id);
        if (marker == undefined) return;
        //修改图标
        if (typeof (info.icon) == 'string' || marker.icon.url != info.icon) {
            marker.setUrl(info.icon);
        }
        //修改透明度
        if (typeof (info.icon) == 'number')
            marker.setOpacity(info.opacity);
        //修改提示框
        if (htmlContent != null && htmlContent != '') {
            var click = marker.events.listeners.click[0];
            if (click != undefined)
                click.obj.data.popupContentHTML = htmlContent;
            for (var i = 0; i < _map.popups.length; i++) {
                if (_map.popups[i].id == id) {
                    //自动调整大小适应新的内容
                    _map.popups[i].setSize(new OpenLayers.Size(10000, 10000));
                    _map.popups[i].setContentHTML(htmlContent); break;
                }
            }
        }
    }


    //添加或设置提示框内容
    this.AddPointMsg = function (id, content, isShow) {
        var point = htObject.items(id);
        if (point == undefined) return;
        //已存在弹出框，重新显示
        if (!point.popup) {
            for (var j = 0; j < _map.popups.length; j++) {
                var popup = _map.popups[j];
                if (popup.id == id) {
                    if (isShow) popup.show();
                    else popup.hide();
                    return;
                }
            }
            //point.geometry.getCentroid()获取中心点 
            var lonlat = new OpenLayers.LonLat(point.geometry.getCentroid().x, point.geometry.getCentroid().y)
            var popup = new OpenLayers.Popup.FramedCloud(id, lonlat, new OpenLayers.Size(300, 300), content, null, true);
            popup.maxSize = new OpenLayers.Size(500, 450);
            this._map.addPopup(popup);
            point.popup = popup;
            point.popup.updateSize();
            if (isShow) popup.show();
            else popup.hide();
        }
        else {
            //point.popup.setSize(new OpenLayers.Size(10000, 10000));
            point.popup.setContentHTML(content);
            point.popup.updateSize();
            point.popup.toggle();
            if (isShow) point.popup.show();
        }
    }

    //鼠标经纬度位置 传入DIVid
    this.SetMousePosition = function (divid) {
        _map.addControl(new OpenLayers.Control.MousePosition({ element: document.getElementById(divid) }));
    }

    //内部方法，禁止外部调用
    this.MenuCallback_Clusters = function (id, cid) {
        var item = htObject.items(id);
        if (item == undefined) return;
        var memu = new function () {
            this.id = 'c_all';
            this.value = "返回列表";
            this.func = function () {
                AddPointMsg(cid, htObject.items(cid).attributes._html, true);
            };
        }
        AddOjbContentMenu(cid, item.attributes._html + "<div style='border-bottom: solid 1px #999999'></div>", memu, true, false);
    }

    ///显示、隐藏 layer中的features对象
    this.DisplayLayerFeature = function (layerid, features, isdisply) {
        for (var i = 0; i < features.length; i++) {
            if (isdisply) features[i].style = null;
            else features[i].style = { display: 'none' };
        }
        this.GetLayersByName(layerid)[0].redraw();
    }

    //设置图元大小
    function SetSize(fraction) {
        var radius = fraction * _map.getExtent().getHeight();
        polygon.handler.setOptions({ radius: radius, angle: 0 });
    }
    return this;
}

//Hashtable
function Hashtable() {
    this._hash = new Object();
    this.add = function (key, value) {
        if (typeof (key) != "undefined") {
            this._hash[key] = typeof (value) == "undefined" ? null : value;
        } else {
            return false;
        }
    }
    this.remove = function (key) { delete this._hash[key]; }
    this.count = function () { var i = 0; for (var k in this._hash) { i++; } return i; }
    this.items = function (key) { return this._hash[key]; }
    this.contains = function (key) { return typeof (this._hash[key]) != "undefined"; }
    this.clear = function () { for (var k in this._hash) { delete this._hash[k]; } }

    /** hashTable 2 json */
    this.toJson = function () {
        var str = "";
        for (var attr in this._hash) {
            str += ",\"" + attr + "\":\"" + this._hash[attr].replace("\"", "").replace("'", "").replace(":", "").replace(",", "") + "\"";
        }
        if (str.length > 0) { str = str.substr(1, str.length); }
        return "{" + str + "}";
    };

    this.toJson2 = function () {
        var str = "";
        for (var attr in this._hash) {
            if (typeof (this._hash[attr]) != "number") {
                str += ",\"" + attr + "\":\"" + this._hash[attr].replaceAll("\"", "\\\"") + "\"";
            } else {
                str += ",\"" + attr + "\":" + this._hash[attr];
            }
            //str += ",\"" + attr + "\":\"" + this._hash[attr].replace("\"", "").replace("'", "").replace(":", "").replace(",", "") + "\"";
        }
        if (str.length > 0) { str = str.substr(1, str.length); }
        return "{" + str + "}";
    };

    this.toArrayKey = function () {
        var str = "";
        for (var attr in this._hash) {
            str += "," + attr;
        }
        if (str.length > 0) { str = str.substr(1, str.length); }
        return str;
    };
}

//获取随机数
function GetRandomNum() {
    var Rand = Math.random();
    return (100000 + Math.round(899999 * Rand));
}

