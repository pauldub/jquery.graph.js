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
            type: 'verticalBar',
            fillStyle: '#fff',
            animationSpeed: 'slow',
            easing: undefined,
            draw: function onDraw(graph) {
                if (graphTypes[graph.options.type]) {
                    graphTypes[graph.options.type](graph);
                } else {
                    console.log("Cannot handle this graph type : " + graph.options.type);
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
        if (this.options.refreshUrl !== undefined) {
            setInterval(function update() {
                that.update();
            }, this.options.refreshInterval);
        } else {
            this.draw();
        }
    };

    Plugin.prototype.update = function update () {
        console.log("Update...");
        var that = this;
        $.getJSON(this.options.refreshUrl, function (response) {
            that.options.update(that, response);
            console.log("Done !");
            that.draw();
        });
    };

    Plugin.prototype.draw = function draw () {
        console.log("Draw " + this.options.type);
        this.options.draw(this);
        console.log("Done !");
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