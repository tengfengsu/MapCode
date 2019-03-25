//Popup 重载,参考资料：http://www.openlayers.cn/portal.php?mod=view&aid=15
function onFeatureSelect(feature) {
    selectedFeature = feature;
    popup = new OpenLayers.Popup.CSSFramedCloud("chicken",
                                    feature.geometry.getBounds().getCenterLonLat(),
                                    null,
                                    "<div style='font-size:.8em'>Feature: " + feature.id + "<br>Area: " + feature.geometry.getArea() + "</div>",
                                    null, true, onPopupClose);
    feature.popup = popup;
    map.addPopup(popup);
}


