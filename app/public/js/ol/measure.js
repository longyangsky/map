
var Measure = {
    map: null,
    proj: '',
    draw: null,
    listener: null,
    sketch: null,
    helpTooltipElement: '',
    helpTooltip: '',
    measureTooltipElement: null,
    measureTooltip: null,
    continuePolygonMsg: '点击继续测量面积',
    continueLineMsg: '点击继续测量距离',
    continueLineMsg: '点击继续测量距离',
    toolTipOverlay:[],
    /**

     * Handle pointer move.
     * @param {module:ol/MapBrowserEvent~MapBrowserEvent} evt The event.
     */
    pointerMoveHandler: function (evt) {
        if (evt.dragging) {
            return;
        }
        /** @type {string} */
        var helpMsg = '点击开始绘制';

        if (Measure.sketch) {
            var geom = (Measure.sketch.getGeometry()); 
            if (geom instanceof ol.geom.Polygon) {
                helpMsg = Measure.continuePolygonMsg;
            } else if (geom instanceof ol.geom.LineString) {
                helpMsg = Measure.continueLineMsg;
            }
        }

        Measure.helpTooltipElement.innerHTML = helpMsg;
        Measure.helpTooltip.setPosition(evt.coordinate);
        Measure.helpTooltipElement.classList.remove('hidden');
    },

    /**
     * Format length output.
     * @param {module:ol/geom/LineString~LineString} line The line.
     * @return {string} The formatted length.
     */
    formatLength: function (line) {
        var length = ol.sphere.getLength(line, { projection: Measure.proj }) //'EPSG:4326'
        var output;
        if (length > 100) {
            output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km'; //换算成KM单位
        } else {
            output = (Math.round(length * 100) / 100) + ' ' + 'm'; //m为单位
        }
        return output;

    },

    /**
     * Format area output.
     * @param {module:ol/geom/Polygon~Polygon} polygon The polygon.
     * @return {string} Formatted area.
     */
    formatArea: function (polygon) {
        var area = ol.sphere.getArea(polygon, { projection: Measure.proj });
        var output;
        if (area > 10000) {
            output = (Math.round(area / 1000000 * 100) / 100) +
                ' ' + 'km<sup>2</sup>';
        } else {
            output = (Math.round(area * 100) / 100) +
                ' ' + 'm<sup>2</sup>';
        }
        return output;
    },
    addVectorLayer: function () { 
        this.source  = BaseMap.getLayerByName('interactionArea').getSource()
        /*this.source = new ol.source.Vector();
        var vector = new ol.layer.Vector({
            name: 'measurce',
            source: Measure.source,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: '#ffcc33'
                    })
                })
            })
        });
        this.map.addLayer(
            vector
        )*/
        // this.map.addVectorLayer(vector);
    },
    addInteraction: function (type) {
        // var type = (typeSelect.value == 'area' ? 'Polygon' : 'LineString');
        if (Measure.draw != null) {
            Measure.map.removeInteraction(Measure.draw);
        }
        Measure.draw = new ol.interaction.Draw({
            source: Measure.source,
            type: type,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.7)'
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    })
                })
            })
        });
        Measure.map.addInteraction(Measure.draw);


        var measure = this;
        this.draw.on('drawstart',
            function (evt) {
                // set sketch
                measure.sketch = evt.feature;

                /** @type {module:ol/coordinate~Coordinate|undefined} */
                var tooltipCoord = evt.coordinate;

                measure.listener = Measure.sketch.getGeometry().on('change', function (evt) {
                    var geom = evt.target;
                    var output;
                    if (geom instanceof ol.geom.Polygon) {
                        output = measure.formatArea(geom);
                        tooltipCoord = geom.getInteriorPoint().getCoordinates();
                    } else if (geom instanceof ol.geom.LineString) {

                        output = measure.formatLength(geom);
                        tooltipCoord = geom.getLastCoordinate();
                    }
                    measure.measureTooltipElement.innerHTML = output;
                    measure.measureTooltip.setPosition(tooltipCoord);
                });
            }, this);

        this.draw.on('drawend',
            function () {
                measure.measureTooltipElement.className = 'tooltip tooltip-static';
                measure.measureTooltip.setOffset([0, -7]);
                // unset sketch
                measure.sketch = null;
                // unset tooltip so that a new one can be created
                measure.measureTooltipElement = null;
                measure.createMeasureTooltip();
                ol.Observable.unByKey(measure.listener);
            }, this);
    },

    /**
     * Creates a new help tooltip
     */
    createHelpTooltip: function () {
        var measure = this;
        if (this.helpTooltipElement) {
            this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
        }
        this.helpTooltipElement = document.createElement('div');
        this.helpTooltipElement.className = 'tooltip hidden';
        this.helpTooltip = new ol.Overlay({
            element: measure.helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        this.toolTipOverlay.push(this.helpTooltip);
        this.map.addOverlay(this.helpTooltip);
    },
    
    /**
     * Creates a new measure tooltip
     */
    createMeasureTooltip: function () {
        if (this.measureTooltipElement) {
            this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement);
        }
        this.measureTooltipElement = document.createElement('div');
        this.measureTooltipElement.className = 'tooltip tooltip-measure';
        this.measureTooltip = new ol.Overlay({
            element: this.measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        this.toolTipOverlay.push(this.measureTooltip);
        this.map.addOverlay(this.measureTooltip);
    },
    crateTool: function (type) {
        var measure = this;
        this.addVectorLayer();
        this.addInteraction(type); 
        this.createMeasureTooltip();
        this.createHelpTooltip();
        this.map.on('pointermove', this.pointerMoveHandler)
        this.map.getViewport().addEventListener('mouseout', function () {
            measure.helpTooltipElement.classList.add('hidden');
        })
    },
    removeDraw: function () {
        if (!this.draw != null) {
            this.map.removeInteraction(this.draw);  
        } 

      /*  if (this.measureTooltipElement) {
            this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement);
        } 
        if (this.helpTooltipElement) {
            this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
        }*/

    },
    removeDrawTooltip:function(){ 
        this.toolTipOverlay.forEach(function(overlay){
            Measure.map.removeOverlay(overlay)
        }) 
        this.toolTipOverlay.length=[];
    },
    removeDrawEvent:function(){  
        this.map.removeEventListener('pointermove');
        this.map.removeEventListener('mouseout');
    },
    getLine: function () {
        this.crateTool('LineString');
       // this.addInteraction('LineString');
    },
    getArea: function () {
        this.crateTool('Polygon');
     //  this.addInteraction('Polygon');
    }


    /**
     * Let user change the geometry type.
     */
    /*
    typeSelect.onchange = function () {
        map.removeInteraction(draw);
        addInteraction();
    };*/

}
