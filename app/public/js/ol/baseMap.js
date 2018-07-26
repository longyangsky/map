var BaseMap = {
    map: null,
    layers: [], //图层带名称
    overlays: [], //弹出HTML层
    attribute: {}, //map的属性
    lastClickFeature: null, //最后点击对象
    initMap: function (mapAttr) {
        if (!mapAttr.proj || !mapAttr.coordinate || !mapAttr.sourceURL) {
            throw 'BaseMap.initMap()缺少必要值'
        }
        this.attribute.proj = mapAttr.proj
        this.attribute.centerCoordinate = mapAttr.coordinate;
        this.attribute.sourceURL = mapAttr.sourceURL;
        this.attribute.maxZoom = mapAttr.maxZoom || 20;
        this.attribute.minZoom = mapAttr.minZoom || 8;
        this.attribute.defaultZomm = mapAttr.defaultZomm || 14;
        this.map = new ol.Map({
            target: mapAttr.map,    
            projection: this.attribute.proj,
            view: new ol.View({
                center: this.attribute.centerCoordinate,
                zoom: this.attribute.defaultZomm,
                projection: this.attribute.proj,
                maxZoom: this.attribute.maxZoom,
                minZoom: this.attribute.minZoom
            })
        });
        mapLayer = new ol.layer.Tile({
            name: 'bottomMap',
            source: new ol.source.XYZ({
                url: this.attribute.sourceURL
            }),
            projection: this.attribute.proj
        });
        this.map.addLayer(mapLayer);
        this.layers.push(mapLayer);
        //添加绘制图层
        var vector_draw = new ol.layer.Vector({
            name: 'interactionArea',
            source: new ol.source.Vector()
        });
        this.map.addLayer(vector_draw);
        this.layers.push({
            name: 'interactionArea',
            layer: vector_draw
        })
    },
    initMapControl: function () {
        var baseMap = this;
        this.map.addControl(new ol.control.MousePosition({
            projection: this.attribute.proj,
            coordinateFormat: function (coordinate) {
                var zoom = baseMap.map.getView().getZoom();
                return '地图级别:' + zoom + ",  " + ol.coordinate.format(coordinate, '经度:{x}°,  纬度: {y}°', 10);
            },
            className: 'custom-mouse-position',
            target: document.getElementById('mouse-position'),
            undefinedHTML: '&nbsp'
        }));
        //比例尺控件
        this.map.addControl(new ol.control.ScaleLine());
    },
    initMapEvent: function () {
        var baseMap = this;
        this.map.on('singleclick', function (evt) {
            if (!evt.dragging) {
                var coordinate = evt.coordinate;
            }
            var feature = null;
            feature = BaseMap.map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
                if (feature == null) {
                    return null
                }
                return {
                    feature: feature,
                    layer: layer
                };
            })

            if (feature == null || (feature.layer != null && feature.layer.get('name') == 'interactionArea')) {
                return;
            }

            if (feature == null | feature.layer == null) {
                return;
            } 
            if (feature.feature.get('type')) {

            } else {
                return;
            }
            baseMap.lastClickResourceCode=feature.feature.get('code');

            baseMap.popupOverlay(0, feature.feature);
        })
        this.map.getView().on('change:resolution', function (event) {
            if (baseMap.map.getView().getZoom() >= 15) {

            } else {

            }
        });
        this.map.on('pointermove', function (e) {
            var pixel = baseMap.map.getEventPixel(e.originalEvent);
            var hit = baseMap.map.hasFeatureAtPixel(pixel);
            if (hit) {
                baseMap.map.getTargetElement().style.cursor = 'pointer';
            } else {
                baseMap.map.getTargetElement().style.cursor = '';
            }
        });

    },
    //创建绘制
    addDrawInteractionArea: function (type, drawendCallback) { //添加一个交互对象在interactionArea 的图层上
        //The geometry type. One of 'Point', 'LineString', 'LinearRing', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection', 'Circle'.
        /*  if (drawonmap) {
              BaseMap.map.removeInteraction(drawonmap);
          }*/
        if (type !== 'None') {
            var geometryFunction, maxPoints;
            //长方形正方形特出处理
            if (type === 'Square') {
                type = 'Circle';
                geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
            } else if (type === 'Box') {
                type = 'LineString';
                maxPoints = 2;
                geometryFunction = function (coordinates, geometry) {
                    if (!geometry) {
                        geometry = new ol.geom.Polygon(null);
                    }
                    var start = coordinates[0];
                    var end = coordinates[1];
                    geometry.setCoordinates([
                        [start, [start[0], end[1]], end, [end[0], start[1]], start]
                    ]);
                    return geometry;
                };
            }
            var style = BaseMap.createPolygonStyle("#808080", 2, 'rgba(200, 0, 255, 0.1)');
            var drawInteractionArea = new ol.interaction.Draw({
                source: BaseMap.getLayerByName('interactionArea').getSource(),
                style: style,
                type: type,
                geometryFunction: geometryFunction,
                maxPoints: maxPoints
            });
            drawInteractionArea.on('drawend', function (evt) {
                // var center = ol.proj.transform(evt.feature.getGeometry().getCenter(), 'EPSG:3857', 'EPSG:4326'); 
                switch (type) {
                    case "Circle":
                        var center = evt.feature.getGeometry().getCenter();
                        var radius = evt.feature.getGeometry().getRadius();
                        drawendCallback(center, radius);
                        break;
                    case "LineString":
                        var extent = evt.feature.getGeometry().getExtent(); //得到选中的区域 
                        var leftdownPoint = [extent[0], extent[1]];
                        var leftTopPoint = [extent[0], extent[3]];
                        var rightdownPoint = [extent[2], extent[1]]
                        var rightupPoint = [extent[2], extent[3]];
                        var Polygon = [leftTopPoint, rightupPoint, rightdownPoint, leftdownPoint].join(";");
                        drawendCallback(Polygon, 0);
                        break;
                    default:
                        throw new Error('错误的绘制类型');
                        break;
                }

            });
            drawInteractionArea.on('drawstart', function (evt) {
               // BaseMap.getLayerByName('interactionArea').getSource().clear();
            })
            BaseMap.map.addInteraction(drawInteractionArea);
            return drawInteractionArea;
        }

    },
    addDrawInteractionMeasure: function () {

    },
    popupOverlay: function (overlaysIndex, feature) {
        var featureContent;
        //保存最后一次点击提供处理
        var coordinate = feature.getGeometry().flatCoordinates;
        var geoType = '';
        switch (feature.get('type')) {
            case "camera":
                geoType = 'Point';
                featureContent = '资源名称:' + feature.get('name');
                break;
            default:
                featureContent = "默认" + feature.get('name');
        }

        BaseMap.lastClickFeature = {
            type: feature.get('type'),
            geoType: geoType,
            coordinates: coordinate
        };

        BaseMap.overlays[overlaysIndex].content.innerHTML = featureContent;
        BaseMap.overlays[overlaysIndex].overlay.setPosition(coordinate);
    },
    addLayerVector: function (name, style) {
        var layerVector = new ol.layer.Vector({
            name: name,
            source: new ol.source.Vector()
        })
        if (style != null) {
            layerVector.setStyle(style);
        }
        this.map.addLayer(
            layerVector
        )
        this.layers.push({
            name: name,
            layer: layerVector
        })
        return layerVector;
    },
    addOverlay: function (popName, popContent, popCloser) {
        var overlay = new ol.Overlay({
            element: popName,
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            }
        });

        popCloser.onclick = function () {
            overlay.setPosition(undefined);
            popCloser.blur(); 
            player=null;
            return false;
        };
        BaseMap.map.addOverlay(overlay);
        BaseMap.overlays.push({
            overlay: overlay,
            content: popContent
        });
    },
    getLayerByName: function (layerName) {
        var layer = null;
        this.layers.forEach(function (element) {
            if (element.name === layerName) {
                layer = element.layer;
                return layer;
            }
        });
        return layer;
    },
    setCenter: function (duration) {
        var duration = duration || 300;
        this.map.getView().animate({
            center: BaseMap.attribute.centerCoordinate,
            duration: duration
        })
    },
    createPolygonStyle: function (strokecolor, strokewidth, fillcolor) {
        return new ol.style.Style({
            stroke: new ol.style.Stroke(({
                color: strokecolor, //颜色
                width: strokewidth //宽度
            })),
            fill: new ol.style.Fill({
                color: fillcolor //like 'rgba(0, 255, 0, 0.2)'
            })
        });
    },
    getViewCoordinates:function(mapXY) { //得到当前视图坐标, 
        var topleftPoint = BaseMap.map.getCoordinateFromPixel(mapXY);
        var centerPoint = BaseMap.map.getView().getCenter();
        var bottomrightPoint = [centerPoint[0] + (centerPoint[0] - topleftPoint[0]),
         centerPoint[1] + (centerPoint[1] - topleftPoint[1])];
        var leftBootmPoint = [bottomrightPoint[0], topleftPoint[1]];
        var toprightPoint = [topleftPoint[0], bottomrightPoint[1]]
        return [topleftPoint, toprightPoint, bottomrightPoint, leftBootmPoint]
    }


}