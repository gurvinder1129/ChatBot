
mapsBase = function init() {
    Highcharts.getOptions().colors = ['#00Aeef', '#f4b213', '#9cc84b', '#2bc4b6', '#8d64aa', '#0a3f6b', '#aa5019', '#416428', '#00566b', '#46295b', '#7fd6f7', '#f9d889', '#cde3a5', '#95e1da', '#c6b1d4'];

}


mapsBase.prototype.renderTo = function (_id) {
    if (!arguments.length) return this._renderTo;
    this._renderTo = _id;
    return this;
}


mapsBase.prototype.topTitle = function (_val) {
    if (!arguments.length) return this._title;
    this._title = _val;
    return this;
}
mapsBase.prototype.customData = function (_val) {
    console.log('_val ' , _val);
    if (!arguments.length) return this._data;
    this._data = _val;
    return this;
}


//basicMaps 
function basicMaps() { }
basicMaps.prototype = new mapsBase();
basicMaps.prototype.constructor = basicMaps;
basicMaps.prototype.parent = mapsBase.prototype;


basicMaps.prototype.plot = function () {
    var chart = new Highcharts.Map({
        chart: {
			renderTo: this.parent.renderTo.call(this),
        },
        title: {
            text: this.parent.topTitle.call(this),  // || this.text  // have to ask
        },
        // title graph postion
        legend: {
            layout: 'horizontal',
            borderWidth: 0,
            backgroundColor: 'rgba(255,255,255,0.85)',
            floating: true,
            verticalAlign: 'top',
            y: 25
        },
        // zoom in and zoom Out option
        mapNavigation: {
            enabled: true
        },
        colorAxis: {
            min: 1,
            type: 'logarithmic',
            minColor: '#EEEEFF',
            maxColor: '#000022',
            stops: [
                [0, '#EFEFFF'],
                [0.67, '#4444FF'],
                [1, '#000022']
            ]
        },

            series : [{
                animation: {
                    duration: 1000
                },
                data:this.parent.customData.call(this),
                mapData: Highcharts.maps['countries/us/us-all'],
                joinBy: ['postal-code', 'code'],
                dataLabels: {
                    enabled: true,
                    color: '#FFFFFF',
                    format: '{point.code}'
                },
                name: 'Population density',
                tooltip: {
                    pointFormat: '{point.code}: {point.value}/km²'
                }
            }]
    });
}

