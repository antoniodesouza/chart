
/// <reference path="underscore-min.js" />
//var parseJsonDate = function (d){ try{ return eval(d.replace(/\/Date\((\d+)(-(\d+))?\)\//gi, "new Date($1)")); } catch (e){ return d; } }
var parseJsonDate = function (d) { return new Date(Date.parse(d)); }
var isArray = function (a) { return (Object.prototype.toString.call(a) === '[object Array]'); };

// global chart options
Highcharts.setOptions({
	global: {
		useUTC: false
	}
});


var commonChartSettings = {
	chart: {
		animation: false
	},
	plotOptions: {
		series: {
			animation: false,
			events: {
				legendItemClick: function (event) {
					return false;
				}
			}
		}
	},
	credits: {
		enabled: false
	}
};




// Intraday Chart
(function ($) {

    var methods = {
        init: function (options) {
            var settings = $.extend({
				ChartData: [],
				ContainerId: null,
				Symbol: ''
            }, options);
		
			// handle invalid arguments
			if ((settings.ChartData == null) || (settings.ChartData.length == 0) || (settings.ContainerId == null)){
				return;
			}
			

			console.info('parseJsonDate', parseJsonDate);
			var minDateTime = new Date(parseJsonDate(settings.ChartData[settings.ChartData.length - 1].lastTradeDateTime).getTime());
			minDateTime.setHours(9, 30);
			var maxDateTime = new Date(minDateTime.getTime());
			maxDateTime.setHours(16, 30);

			var seriesData = new Array();
			if (minDateTime < settings.ChartData[0].lastTradeDateTime){
				seriesData.push([minDateTime.getTime(), null]);
			};

			for (var i = 0; i < settings.ChartData.length; i++){
				settings.ChartData[i].lastTradeDateTime = parseJsonDate(settings.ChartData[i].lastTradeDateTime);
				seriesData.push(
				{
					x: settings.ChartData[i].lastTradeDateTime.getTime(),
					y: settings.ChartData[i].priceLast,
					Quote: settings.ChartData[i],
					Ticker: settings.ChartData[i].ticker,
					Exchange: settings.ChartData[i].exchange
				});
			}

			if (maxDateTime > settings.ChartData[settings.ChartData.length - 1 ].lastTradeDateTime){
				seriesData.push([maxDateTime.getTime(), null]);
			};


			var intradayChartSettings = $.extend(true, {
				//colors: ["#f4711e", "#6d6e71", "#6d6e71", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
				chart: {
					renderTo: settings.ContainerId,
					animation: false,
					height:200
				},
				rangeSelector: { enabled: false },
				navigator: { enabled: false },
				scrollbar: { enabled: false },
				//tooltip: {
				//	useHTML: true,
				//	formatter: function() {
				//		try{
				//			return intradayChartTooltipTemplate(this.points[0].point);
				//		} catch(e){
				//		}
						
				//	}
				//},
				//plotOptions: {
				//	area: {
				//		fillOpacity: 0.5
				//	}
				//},
				yAxis: {
					id: "yAxis"//,
					//maxPadding: 0.25,
					//minPadding: 0.25,
					//labels: {
					//	formatter: function() { return $.formatNumber(Number(this.value), { format: _profileResources.Format_Cur2 }); }
					//},
					//plotLines : [{
					//	value : settings.ChartData[0].PricePreviousClose,
					//	color : 'blue',
					//	dashStyle : 'shortdash',
					//	width : 1,
					//	zIndex: 10,
					//	label : {
					//		align: 'right',
					//		text: "Last Close"
					//	}
					//}]
				},
				xAxis: {
					ordinal: false,
					showFirstLabel: true,
					showLastLabel: true,
					min: minDateTime.getTime(),
					max: maxDateTime.getTime(),
					startOnTick: true,
					endOnTick: true
				}
			}, commonChartSettings);
			
			var chartSettings = $.extend(true, {
				series: [{
					type: 'area',
					name: 'intraday',
					data: seriesData,
					threshold: null
				}]
			}, intradayChartSettings);

			console.info('seriesData', seriesData);

			chart = new Highcharts.StockChart(chartSettings);
			var extremes = chart.get('yAxis').getExtremes();
			var newYMin = Math.min(extremes.min, (Math.floor(settings.ChartData[0].pricePreviousClose) ));
			var newYMax = Math.max(extremes.max, (Math.ceil(settings.ChartData[0].pricePreviousClose) ));
			chart.get('yAxis').setExtremes (newYMin, newYMax);


        }
    };

    $.fn.horizons_IntradayChart = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.tooltip');
        }

    };

})(jQuery);


