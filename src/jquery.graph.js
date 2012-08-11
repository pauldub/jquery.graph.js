
/*!
 * Original author: Paul d'Hubert
 */

;(function ( $, window, document, undefined ) {
    var graphTypes = {
        verticalBar: function drawVerticalBar (graph) {
            var canvas = $(graph.element),
                width = graph.element.width,
                height = graph.element.height,
                layer = canvas.getLayer('vBar');
            
            var barHeight = (graph.data.current / graph.data.max) * height;

            if (!layer) {
                canvas.drawRect({
                    layer: true,
                    name: 'vBar',
                    fillStyle: graph.options.fillStyle,
                    x: 0,
                    y: height - barHeight,
                    width: width,
                    height: barHeight,
                    fromCenter: false
                });
            } else {
                canvas.animateLayer('vBar', {
                    y: height - barHeight,
                    height: barHeight
                }, graph.options.animationSpeed, graph.options.easing);
            }
        },
    };

    var pluginName = 'graph',
        defaults = {
            refreshInterval: 1000,
            refreshUrl: undefined,
            refresh: false,
            type: 'verticalBar',
            fillStyle: "#4c4",
            animationSpeed: 'slow',
            easing: undefined,
            debug: false,
            draw: function onDraw(graph) {
                if (graphTypes[graph.options.type]) {
                    graphTypes[graph.options.type](graph);
                } else {
                    graph.log("Cannot handle this graph type : " + graph.options.type);
                }
            },
        };

    function Plugin( element, options) {
        this.element = element;

        this.options = $.extend( {}, defaults, options) ;
        this.data = $.extend({}, options.data);
        
        this._defaults = defaults;
        this._name = pluginName;
        
        this.init();
    }

    Plugin.prototype.init = function init () {
        var that = this;
        if (this.options.refreshUrl !== undefined || this.options.refresh === true) {
            this.draw();
            setInterval(function update() {
                that.update();
            }, this.options.refreshInterval);
        } else {
            this.draw();
        }
    };

    Plugin.prototype.log = function log (message) {
        if (this.options.debug === true) {
            console.log(message);
        }
    };

    Plugin.prototype.update = function update () {
        this.log("Update...");
        if (this.options.refreshUrl !== undefined) {
            var that = this;
            $.getJSON(this.options.refreshUrl, function (response) {
                that.options.update(that, response);
                that.log("Done !");
                that.draw();
            });
        } else {
            this.options.update(this);
            this.draw();
            that.log("Done !");
        }
    };

    Plugin.prototype.draw = function draw () {
        this.log("Draw " + this.options.type);
        this.options.draw(this);
        this.log("Done !");
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, 
                new Plugin( this, options ));
            }
        });
    }
})( jQuery, window, document );