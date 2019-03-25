/**
* 对自定义规则切割的图片进行拼装的类
*/
OpenLayers.Layer.QQMap = OpenLayers.Class(OpenLayers.Layer.TileCache, {
    sateTiles: false,
    imgdirname: "maptilesv3",
    initialize: function(name, url, options) {
        var tempoptions = OpenLayers.Util.extend({
            'format': 'image/png',
            isBaseLayer: true
        }, options);
        OpenLayers.Layer.TileCache.prototype.initialize.apply(this, [name, url, {},
        tempoptions]);
        this.extension = this.format.split('/')[1].toLowerCase();
        this.extension = (this.extension == 'jpg') ? 'jpeg' : this.extension;
        this.transitionEffect = "resize";
        this.buffer = 0;
    },
    /**
    * 按地图引擎切图规则实现的拼接方式
    */ 
    getURL: function(bounds) {      
        var res = this.map.getResolution();
        var bbox = this.map.getMaxExtent();
        var size = this.tileSize;
        var tileZ = this.map.zoom;
        //计算列号 
        var tileX = Math.round((bounds.left - bbox.left) / (res * size.w));
        //计算行号
        var tileY = Math.round((bbox.top - bounds.top) / (res * size.h));
        var scope = new Array(0, 0, 0, 0, 0, 3, 0, 3, 0, 3, 0, 3, 0, 7, 0, 7, 0, 15, 0, 15, 0, 31, 0, 31, 0, 63, 4, 59, 0, 127, 12, 115, 0, 225, 28, 227, 356, 455, 150, 259, 720, 899, 320, 469, 1440, 1799, 650, 929, 2880, 3589, 1200, 2069, 5760, 7179, 2550, 3709, 11520, 14349, 5100, 7999, 23060, 28689, 10710, 15429, 46120, 57369, 20290, 29849, 89990, 124729, 41430, 60689, 184228, 229827, 84169, 128886);
        var f = tileZ * 4;
        var i = scope[f++];
        var j = scope[f++];
        var l = scope[f++];
        var scope = scope[f];
        var tileNo = null;
        var imgformat = this.sateTiles ? ".jpg" : ".png"
        tileNo = tileZ + "/" + Math.floor(tileX / 16) + "/" + Math.floor(tileY / 16) + "/" + tileX + "_" + tileY + imgformat;       
        if (tileX >= i && tileX <= j && tileY >= l && tileY <= scope) {
            tileY = Math.pow(2, tileZ) - 1 - tileY;
            tileNo = tileZ + "/" + Math.floor(tileX / 16) + "/" + Math.floor(tileY / 16) + "/" + tileX + "_" + tileY + imgformat;
        } 
        var Surl = this.url;
        if (OpenLayers.Util.isArray(Surl))
            Surl = this.selectUrl(tileNo, Surl); 
        return Surl + this.imgdirname + "/" + tileNo;
    },

    clone: function(obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.QQMap(this.name, this.url, this.options);
        }
        obj = OpenLayers.Layer.TileCache.prototype.clone.apply(this, [obj]);
        return obj;
    },
    CLASS_NAME: "OpenLayers.Layer.QQMap"
});