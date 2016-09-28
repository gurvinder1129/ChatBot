function initSmarttext(strBoundData, elem){
if(!strBoundData) strBoundData = '';
                        strBoundData = strBoundData.replace(/</g,'&lt;').replace(/>/g,'&gt;');
                                    //.listReplace('-', 'ul').listReplace('#', 'ol');
                        var tableIndex = strBoundData.indexOf('||');
                        var lines = strBoundData.split('\n');
                        var tmpBoundData = [];
                        var tableStart = false;
                        var ulStart = 0;
                        var olStart = 0;
                        var theadWritten = false;
                        $.each(lines, function(x, line) {
                            if(line.indexOf('||') == 0) {
                            	 bgColorIndex = line.indexOf('{bgcolor:');
                            	 if(bgColorIndex != -1){
                                 bgColor = line.substring(bgColorIndex+9, line.indexOf('}', bgColorIndex + 1));
                                 console.log(bgColor);
                            	 }
                                 if(!tableStart) {
                                     tmpBoundData.push('<div class = "tablewrap"><table class="table table-striped table-bordered smart_table"><thead>');
                                     theadWritten = false;
                                 }
                                 tableStart = true;
                                 tmpBoundData.push('<tr>');
                                 var cols = line.split('||');
                                 var colSpan = 1;
                                 var prevCol = '';
                                 $.each(cols, function(y, col) {
                                     if(y == 0 || y == cols.length - 1) return;
                                     if(col == null || col.trim() == '') {
                                    	 
                                    	 var style = 'style="text-align:center"';
                                    	 if(bgColorIndex != -1){
                                    		 style = style + ' bgcolor="'+bgColor+'"';
                                    	 }
                                         if(prevCol == '') tmpBoundData.push('<th '+style+'>&nbsp;</th>');
                                         colSpan++;
                                         
                                     }
                                     else {
                                    	
                                    	 var style = 'style="text-align:center"';
                                    	 
                                    	 if(bgColorIndex != -1){
                                    		 style = style + ' bgcolor="'+bgColor+'"';
                                    	 }
                                    	
                                    	 if(prevCol != '') tmpBoundData.push('<th '+style+' colspan="', colSpan, '">', prevCol, '</th>');
                                         prevCol = col;
                                         colSpan = 1;
                                     }
                                 });
                                 var style = 'style="text-align:center"';
                                 if(bgColorIndex != -1){
                            		 style = style + ' bgcolor="'+bgColor+'"';
                            	 }
                                 tmpBoundData.push('<th '+style+' colspan="', colSpan, '">', prevCol, '</th>');
                                 tmpBoundData.push('</tr>');
                                 
                             
                            	    
                            } else if(line.indexOf('|') == 0) {
                                if(!theadWritten) {
                                    theadWritten = true;
                                    tmpBoundData.push('</thead><tbody>');
                                }
                                tmpBoundData.push('<tr>');
                                var cols = line.split('|');
                                $.each(cols, function(y, col) {
                                    if(y == 0 || y == cols.length - 1) return;
                                    var colStyle = '';
                                    //if($.isNumeric(col))
                                    colStyle = " style='text-align:right; '";
                                    var lhColorIndex = col.indexOf('{lh:');
                            		if(lhColorIndex != -1) {

                                	var lhColor = col.substring(lhColorIndex+4, col.indexOf('}', lhColorIndex + 1));
                               
                                	colStyle = " style='text-align:right;  background-color:"+lhColor+" '";
                                	var colSplit = col.split("{lh:"+lhColor+"}");
                                	col = colSplit[1];
								
                            		}
                                
                                tmpBoundData.push('<td', colStyle, '>', col, '</td>'); 
                            	
                                });
                                tmpBoundData.push('</tr>');
                            } else if(line.indexOf('-') == 0 || line.indexOf('#') == 0) {
                                var start = line.charAt(0) == '-'? ulStart:olStart;
                                if(start == 0) {
                                    tmpBoundData.push(line.charAt(0) == '-'?'<ul>':'<ol>');
                                    if(line.charAt(0) == '-') ulStart++;
                                    else olStart++;
                                } 
                                tmpBoundData.push('<li>', line.substring(1), '</li>');
                            } else {
                                if(tableStart) {
                                    tmpBoundData.push('</tbody></table></div>');
                                    tableStart = false;
                                }
                                for(var i = 0; i < ulStart; i++) tmpBoundData.push('</ul>');
                                for(var i = 0; i < olStart; i++) tmpBoundData.push('</ol>');
                                tmpBoundData.push(line, '\n');
                            }
                        } );
                        
                        strBoundData = tmpBoundData.join('');
                        strBoundData = strBoundData
                                        .replace(/\n/g,'<br/>')
                                        .htmlReplace( '*', '<strong>', '</strong>')
                                        .htmlReplace('__', '<i>', '</i>')
										.htmlReplace('^', '<sup>', '</sup>')
                                        .htmlReplace( '??', '<cite>', '</cite>')
                                        .htmlReplace('{right}', "<span style='float:right'>", "</span>")
                                        .htmlReplace('{left}', "<span style='float:left'>", "</span>")
                                        .htmlReplace( '{quote}', '<blockquote>', '</blockquote>')
                                        .htmlReplace( '{noformat}', '<pre>', '</pre>')
                                        .htmlReplace( '{code}', '<code>', '</code>')
                                        .htmlReplace( '{h1}', '<h1>', '</h1>')
                                        .htmlReplace( '{h2}', '<h2>', '</h2>')
                                        .htmlReplace( '{h3}', '<h3>', '</h3>')
                                        .htmlReplace( '{h4}', '<h4>', '</h4>')
                                        .htmlReplace( '{h5}', '<h5>', '</h5>')
                                        .htmlReplace( '{h6}', '<h6>', '</h6>');
                        
                    	var imgIndex = strBoundData.indexOf('{img');
						var useSquareBraces = false;
						if(imgIndex == -1) {
							imgIndex = strBoundData.indexOf('[img');
							useSquareBraces = true;
						}
						if(imgIndex >= 0) {
							var imgDataStartPos = strBoundData.indexOf(useSquareBraces?']':'}', imgIndex) + 1;
							var imgDataEndPos = strBoundData.indexOf(useSquareBraces?'[/img]': '{/img}');
							var imgData = strBoundData.substring(imgDataStartPos, imgDataEndPos);
							strBoundData = strBoundData.substring(0, imgIndex) + '<div><img src="' + imgData + '"/></div>' + 
							((imgDataEndPos + 6) < strBoundData.length? strBoundData.substring(imgDataEndPos + 6): '');
						}

						/* anchor tag*/
						var anchorIndex = strBoundData.indexOf('[a');
						if(anchorIndex >= 0) {
							var anchorUrlStartPos = strBoundData.indexOf(']', anchorIndex) + 1;
							var anchorUrlEndPos = strBoundData.indexOf('[/a]');
							var hrefStart = strBoundData.indexOf('[href]', anchorUrlStartPos) + 6;
							var hrefEnd = strBoundData.indexOf('[/href]', hrefStart);
							var href = strBoundData.substring(hrefStart, hrefEnd);
							var linkText = strBoundData.substring(hrefEnd + 7, anchorUrlEndPos);
							strBoundData = strBoundData.substring(0, anchorIndex) + '<a href="' + href + '" target="_blank">' + linkText + '</a>' + 
							((anchorUrlEndPos + 4) < strBoundData.length? strBoundData.substring(anchorUrlEndPos + 4): '');
						}
						/* end anchor tag*/

                        var index = strBoundData.indexOf('{chart:');
                        var charts = [];
                        var seriesDataFunc = function(inputSeriesString, tag) {
                            var dataIndex = inputSeriesString.indexOf(tag);
                            var seriesData = [];
                            if(dataIndex != -1) {
                                var dataEndIndex = inputSeriesString.indexOf(tag, dataIndex + 1);
                                if(dataEndIndex != -1) {
                                    var dataString = inputSeriesString.substring(dataIndex + 3, dataEndIndex);
                                    var dataStringTokens = dataString.replace(/(?!\B"[^"]*),(?![^"]*"\B)/g, '##@@##').split('##@@##');
                                    $.each(dataStringTokens, function(_u, token) {
                                        var tmpData = token.replace('"', '').replace('"','');
                                        if($.isNumeric(tmpData)) tmpData = parseFloat(tmpData);
                                        seriesData.push(tmpData);
                                    });
                                }
                            }
                            return seriesData;
                        };
                        var timeSeriesDataFunc = function(inputSeriesString, tag) {
                        	var dataIndex = inputSeriesString.indexOf(tag);
                        	var seriesData = [];
                        	if(dataIndex != -1){
                        		var dataEndIndex = inputSeriesString.indexOf(tag, dataIndex + 1);
                        		if(dataEndIndex != -1) {
                        			var dataString = inputSeriesString.substring(dataIndex + 3, dataEndIndex);
                        			var dataStringTokens = dataString.replace(/(?!\B"[^"]*),(?![^"]*"\B)/g, '##@@##').split('##@@##');
                        			$.each(dataStringTokens, function(_u, token) {
                        				var tmpData = token.replace('"','').replace('"','');
										var re = /(\d*):(\d*)\ ?(a|p)?m/gi;
										var matches = re.exec(tmpData);
										var hour = parseFloat(matches[1]);
										var minute = parseFloat(matches[2]) % 60;
										if (matches[3] == 'p'){
											hour += 12;
										}
                        				seriesData.push(Date.UTC(0,0,0,hour,minute));
                        			});
                        		}
                        	}
                        	return seriesData;
                        };

                        if (!Array.prototype.last){
							Array.prototype.last = function(){
								return this[this.length - 1];
							};
						};

                        while(index != -1) {
                            var endIndex =  strBoundData.indexOf('{chart}', index + 1);
                            if(endIndex == -1) break;
                            var cLeft = strBoundData.substring(0, index);
                            var cRight = endIndex + 7 >= strBoundData.length?'': strBoundData.substring(endIndex + 7);
                            var chart = strBoundData.substring(index + 7, endIndex);
                            strBoundData =  cLeft + '<div class="smartchart_'  + charts.length + '">&#160;</div>' + cRight;
                            var chartObj = { 'chart': { /*'animation':false*/ }, 'xAxis': [], 'yAxis': [], 'series': [], 'colors': [], 'credits': {'enabled':
 false}, 'title': { 'text': null} };
                            charts.push(chartObj);
                            chartObj.plotOptions = {};
                            var seriesOptions = {};
                            var yAxis1 = {'lineWidth':1}; var yAxis2 = {'lineWidth':1,'opposite':'true'};
                            var defaultType = chart.substring('0', chart.indexOf('}'));
                            if (defaultType.match(/stacked/)){
                            	defaultType = defaultType.replace(/stacked(.*)/,'$1');
                            	seriesOptions['stacking'] = 'normal';
                            }
                            chartObj.chart.defaultSeriesType = defaultType;
                            var bkIndex = chart.indexOf('{bkcolor:');
                            if(bkIndex != -1) {
                                var bkColor = chart.substring(bkIndex+9, chart.indexOf('}', bkIndex + 1));
                                chartObj.chart.backgroundColor = bkColor;
                            }
                            bkIndex = chart.indexOf('{title:');
                            if(bkIndex != -1) {
                                var cTitle = chart.substring(bkIndex+7, chart.indexOf('}', bkIndex + 1));
                                chartObj.title.text = cTitle;
                            }
                            bkIndex = chart.indexOf('{label:');
                            if(bkIndex != -1) {
                                cLabel1 = chart.substring(bkIndex+7, chart.indexOf('}', bkIndex + 1));
                            }
                            var xAxis1 = {};
                            bkIndex = chart.indexOf('{x:title}');
                            var chart2Index = strBoundData.indexOf('{chart2:');
                            if(bkIndex != -1) {
                            	
								
                            	//xAxis1 = {'width':175};
                                var xTitle = chart.substring(bkIndex + 9, chart.indexOf('{x}', bkIndex));
                                //chartObj.xAxis.title = {'text':xTitle};
                                xAxis1.title = {'text':xTitle}; 
                                if(chart2Index != -1)
								{
									xAxis1 = {'width':300};//only when chart2 is present	
									xAxis1.title = {'text':xTitle, 'x':10,'y':-290};
									//xAxis1.plotLines = [{'color':'black', 'width':2, 'value':0}];

									yAxis1.plotLines = [{'color':'black', 'width':2, 'value':0}];
								}
								
                            }
                            bkIndex = chart.indexOf('{y:title}');
                            if(bkIndex != -1) {
                                var yTitle = chart.substring(bkIndex + 9, chart.indexOf('{y}', bkIndex));
                                yAxis1.title = {'text':yTitle};
                                yAxis2.title = {'text':yTitle};
                            }
                            bkIndex = chart.indexOf('{y2:title}');
                            if(bkIndex != -1) {
                                var yTitle = chart.substring(bkIndex + 10, chart.indexOf('{y}', bkIndex));
                                yAxis2.title = {'text':yTitle};
                            }
                            bkIndex = chart.indexOf('{datalabels}');
                            if (bkIndex != -1){
                            	seriesOptions.dataLabels = {'enabled':'true','inside':'true'};
                            }
                            bkIndex = chart.indexOf('{y:tickinterval}');
                            if (bkIndex != -1){
                            	var argStr = chart.substring(bkIndex + 16, chart.indexOf('{y}', bkIndex));
                            	var args = argStr.replace(/(?!\B"[^"]*),(?![^"]*"\B)/g, '##@@##').split('##@@##');
                            	yAxis1.min = parseInt(args[0]);
                            	yAxis1.max = parseInt(args[1]);
                            	yAxis1.tickInterval = parseInt(args[2]);
                            }
                            bkIndex = chart.indexOf('{y2:tickinterval}');
                            if (bkIndex != -1){
                            	var argStr = chart.substring(bkIndex + 17, chart.indexOf('{y}', bkIndex));
                            	var args = argStr.replace(/(?!\B"[^"]*),(?![^"]*"\B)/g, '##@@##').split('##@@##');
                            	yAxis2.min = parseInt(args[0]);
                            	yAxis2.max = parseInt(args[1]);
                            	yAxis2.tickInterval = parseInt(args[2]);
                            }
                            bkIndex = chart.indexOf('{x:time}');
                            if (bkIndex != -1){
                            	chartObj['tooltip'] = {formatter: function() { return Highcharts.dateFormat('%I:%M %p',this.x) }};
                            	chartObj['timeChart'] = true;
                            	//chartObj.xAxis['type'] = 'datetime';
                            	xAxis1['type'] = 'datetime';
                            	//chartObj.xAxis['dateTimeLabelFormats'] = { hour: '%I %p', minute: '%I:%M %p'};
                            	xAxis1['dateTimeLabelFormats'] = { hour: '%I %p', minute: '%I:%M %p'};
                            }

                            chartObj.plotOptions['series'] = seriesOptions;
                            chartObj.yAxis = [yAxis1,yAxis2];
                            var seriesIndex = chart.indexOf('{series:');
                            
                            while(seriesIndex != -1) {
                                cLeft = chart.substring(0, seriesIndex);
                                var seriesEndIndex = chart.indexOf('{series}', seriesIndex);
                                if(seriesEndIndex == -1) break;
                                cRight = seriesEndIndex + 8 >= chart.length?'':chart.substring(seriesEndIndex + 8);
                                var series = chart.substring(seriesIndex + 8, seriesEndIndex);
                                chart = cLeft + cRight;
                                var seriesObj = {'name': series.substring(0, series.indexOf('}')), 'data':[]};
                                chartObj.series.push(seriesObj);

                                console.log(series);

                                var seriesTypeIndex = series.indexOf('{seriestype}');
                                if(seriesTypeIndex != -1) { var seriesType = series.substring(seriesTypeIndex+12, series.indexOf('{seriestype}', 
seriesTypeIndex+1)); } else seriesType = null;
								
								console.log(seriesTypeIndex,seriesTypeIndex+12,series.indexOf('{seriestype}'),seriesTypeIndex+1,seriesType);
								chartObj.series.last().type = seriesType;

                                var seriesColorIndex = series.indexOf('{color:');
                                if(seriesColorIndex != -1) {
                                    var seriesColor = series.substring(seriesColorIndex + 7, series.indexOf('}', seriesColorIndex));
                                    var seriesColors = seriesColor.split(',');
                                    $.each(seriesColors, function(ff, sColor) { chartObj.colors.push(sColor); });
                                }
                                if(chartObj.timeChart){
                                	var xData = timeSeriesDataFunc(series, '{x}');
                                	var yData = seriesDataFunc(series, '{y}');

                                	for(var j = 0; j < xData.length; ++j){
                                		var curXData = xData[j];
                                		var curYData = j >= yData.length? 0: yData[j];
                                		seriesObj.data.push([curXData,curYData]);
                                	}
                                } else {
                                	var xData = seriesDataFunc(series, '{x}');
                                	var yData = seriesDataFunc(series, '{y}');
                                
									for(var j = 0; j < xData.length; j++) {
										var curXData = xData[j];
										if(!$.isNumeric(xData[j])) {
											//if(chartObj.xAxis && chartObj.series.length == 1)
											if(xAxis1 && chartObj.series.length == 1)
												//chartObj.xAxis.categories = xData;
												xAxis1.categories = xData;
											if(chartObj.chart.defaultSeriesType != 'pie')
												curXData = j;
											else if (chart.indexOf('{datalabels}') != -1) { chartObj.plotOptions = {'pie':{dataLabels: {'distance':-45,
'format':'<b>{point.percentage:.1f}%</b>'},'showInLegend':true}}; }
											else { chartObj.plotOptions = {'pie':{'showInLegend':true, dataLabels:{'enabled':false}}}; }
										}
										var curYData = j >= yData.length? 0: yData[j];
										seriesObj.data.push([curXData, curYData]);
									}
                                }
                                seriesIndex = chart.indexOf('{series:');
                            }
                            //.replace(/(?!\B"[^"]*),(?![^"]*"\B)/g, '##@@##').split('##@@##').join('-'));
                            index = strBoundData.indexOf('{chart:');
                            //fill xaxis here
                            chartObj.xAxis = [xAxis1];









                            //build chart2 here which will be side by side
                            if(chart2Index != -1)
                            {

                            var chart2endIndex =  strBoundData.indexOf('{chart2}', chart2Index + 1);
                            if(endIndex == -1) break;
                            var cLeft = strBoundData.substring(0, chart2Index);
                            var cRight = chart2endIndex + 7 >= strBoundData.length?'': strBoundData.substring(chart2endIndex + 7);
                            var chart = strBoundData.substring(chart2Index + 7, chart2endIndex);
                            strBoundData =  cLeft + '<div class="smartchart_'  + charts.length + '">&#160;</div>' + cRight;
                            //var chartObj = { 'chart': { /*'animation':false*/ }, 'xAxis': [], 'yAxis': [], 'series': [], 'colors': [], 'credits': {'enabled':
 //false}, 'title': { 'text': null} };
                            //charts.push(chartObj);
                            //chartObj.plotOptions = {};
                            //var seriesOptions = {};
                            //var yAxis1 = {'lineWidth':1}; var yAxis2 = {'lineWidth':1,'opposite':'true'};
                            //var defaultType = chart.substring('0', chart.indexOf('}'));
                            //if (defaultType.match(/stacked/)){
                            //	defaultType = defaultType.replace(/stacked(.*)/,'$1');
                            //	seriesOptions['stacking'] = 'normal';
                           // }
                           // chartObj.chart.defaultSeriesType = defaultType;
                           // var bkIndex = chart.indexOf('{bkcolor:');
                           // if(bkIndex != -1) {
                             //   var bkColor = chart.substring(bkIndex+9, chart.indexOf('}', bkIndex + 1));
                            //    chartObj.chart.backgroundColor = bkColor;
                           // }
                           bkIndex = chart.indexOf('{label:');
                            if(bkIndex != -1) {
                                cLabel2 = chart.substring(bkIndex+7, chart.indexOf('}', bkIndex + 1));
                            }
                            var bkIndex = chart.indexOf('{title:');
                            if(bkIndex != -1) {
                                var cTitle = chart.substring(bkIndex+7, chart.indexOf('}', bkIndex + 1));
                            //    chartObj.title.text = cTitle;
                            }
                            bkIndex = chart.indexOf('{x:title}');
                           //var chart2Index = strBoundData.indexOf('{chart2');
                            if(bkIndex != -1) {
                            	var xAxis2 = {};
								
								xAxis2 = {'width':300, 'offset' : 0, 'left' : 330};
								
                            	//xAxis1 = {'width':175};
                                var xTitle = chart.substring(bkIndex + 9, chart.indexOf('{x}', bkIndex));
                                //chartObj.xAxis.title = {'text':xTitle};
                                xAxis2.title = {'text':xTitle, 'x':10,'y':-290};
								xAxis2.plotLines = [{'color':'#C0D0E0', 'width':1, 'value':0}];
                            }
                            //bkIndex = chart.indexOf('{y:title}');
                            //if(bkIndex != -1) {
                            //    var yTitle = chart.substring(bkIndex + 9, chart.indexOf('{y}', bkIndex));
                            //    yAxis1.title = {'text':yTitle};
                            //    yAxis2.title = {'text':yTitle};
                           // }
                           // bkIndex = chart.indexOf('{y2:title}');
                           // if(bkIndex != -1) {
                           //     var yTitle = chart.substring(bkIndex + 10, chart.indexOf('{y}', bkIndex));
                           //     yAxis2.title = {'text':yTitle};
                           // }
                          //  bkIndex = chart.indexOf('{datalabels}');
                           // if (bkIndex != -1){
                           // 	seriesOptions.dataLabels = {'enabled':'true','inside':'true'};
                           // }
                           // bkIndex = chart.indexOf('{y:tickinterval}');
                           // if (bkIndex != -1){
                            //	var argStr = chart.substring(bkIndex + 16, chart.indexOf('{y}', bkIndex));
                            //	var args = argStr.replace(/(?!\B"[^"]*),(?![^"]*"\B)/g, '##@@##').split('##@@##');
                            //	yAxis1.min = parseInt(args[0]);
                            //	yAxis1.max = parseInt(args[1]);
                            //	yAxis1.tickInterval = parseInt(args[2]);
                           // }
                          //  bkIndex = chart.indexOf('{y2:tickinterval}');
                          //  if (bkIndex != -1){
                          //  	var argStr = chart.substring(bkIndex + 17, chart.indexOf('{y}', bkIndex));
                          //  	var args = argStr.replace(/(?!\B"[^"]*),(?![^"]*"\B)/g, '##@@##').split('##@@##');
                          //  	yAxis2.min = parseInt(args[0]);
                          //  	yAxis2.max = parseInt(args[1]);
                          //  	yAxis2.tickInterval = parseInt(args[2]);
                          //  }
                          //  bkIndex = chart.indexOf('{x:time}');
                           // if (bkIndex != -1){
                           // 	chartObj['tooltip'] = {formatter: function() { return Highcharts.dateFormat('%I:%M %p',this.x) }};
                           // 	chartObj['timeChart'] = true;
                            	//chartObj.xAxis['type'] = 'datetime';
                            //	xAxis1['type'] = 'datetime';
                            	//chartObj.xAxis['dateTimeLabelFormats'] = { hour: '%I %p', minute: '%I:%M %p'};
                            //	xAxis1['dateTimeLabelFormats'] = { hour: '%I %p', minute: '%I:%M %p'};
                           // }

                           // chartObj.plotOptions['series'] = seriesOptions;
                           // chartObj.yAxis = [yAxis1,yAxis2];
                            var seriesIndex = chart.indexOf('{series:');
                            
                            while(seriesIndex != -1) {
                                cLeft = chart.substring(0, seriesIndex);
                                var seriesEndIndex = chart.indexOf('{series}', seriesIndex);
                                if(seriesEndIndex == -1) break;
                                cRight = seriesEndIndex + 8 >= chart.length?'':chart.substring(seriesEndIndex + 8);
                                var series = chart.substring(seriesIndex + 8, seriesEndIndex);
                                chart = cLeft + cRight;
                                var seriesObj = {'xAxis':1,'showInLegend':false,'name': series.substring(0, series.indexOf('}')), 'data':[]};
                                chartObj.series.push(seriesObj);

                                console.log(series);

                                var seriesTypeIndex = series.indexOf('{seriestype}');
                                if(seriesTypeIndex != -1) { var seriesType = series.substring(seriesTypeIndex+12, series.indexOf('{seriestype}', 
seriesTypeIndex+1)); } else seriesType = null;
								
								console.log(seriesTypeIndex,seriesTypeIndex+12,series.indexOf('{seriestype}'),seriesTypeIndex+1,seriesType);
								chartObj.series.last().type = seriesType;

                                var seriesColorIndex = series.indexOf('{color:');
                                if(seriesColorIndex != -1) {
                                    var seriesColor = series.substring(seriesColorIndex + 7, series.indexOf('}', seriesColorIndex));
                                    var seriesColors = seriesColor.split(',');
                                    $.each(seriesColors, function(ff, sColor) { chartObj.colors.push(sColor); });
                                }
                                if(chartObj.timeChart){
                                	var xData = timeSeriesDataFunc(series, '{x}');
                                	var yData = seriesDataFunc(series, '{y}');

                                	for(var j = 0; j < xData.length; ++j){
                                		var curXData = xData[j];
                                		var curYData = j >= yData.length? 0: yData[j];
                                		seriesObj.data.push([curXData,curYData]);
                                	}
                                } else {
                                	var xData = seriesDataFunc(series, '{x}');
                                	var yData = seriesDataFunc(series, '{y}');
                                
									for(var j = 0; j < xData.length; j++) {
										var curXData = xData[j];
										if(!$.isNumeric(xData[j])) {
											//if(chartObj.xAxis && chartObj.series.length == 1)
											//if(xAxis2 && chartObj.series.length == 1)
												//chartObj.xAxis.categories = xData;
											xAxis2.categories = xData;
											if(chartObj.chart.defaultSeriesType != 'pie')
												curXData = j;
											else if (chart.indexOf('{datalabels}') != -1) { chartObj.plotOptions = {'pie':{dataLabels: {'distance':-45,
'format':'<b>{point.percentage:.1f}%</b>'},'showInLegend':true}}; }
											else { chartObj.plotOptions = {'pie':{'showInLegend':true, dataLabels:{'enabled':false}}}; }
										}
										var curYData = j >= yData.length? 0: yData[j];
										seriesObj.data.push([curXData, curYData]);
									}
                                }
                                seriesIndex = chart.indexOf('{series:');
                            }
                            //.replace(/(?!\B"[^"]*),(?![^"]*"\B)/g, '##@@##').split('##@@##').join('-'));
                            //index = strBoundData.indexOf('{chart:');
                            chart2Index = strBoundData.indexOf('{chart2:');
                            //fill xaxis here
                            //chartObj.xAxis = [xAxis1];
                        	chartObj.xAxis.push(xAxis2);
                            }
                        }

                        /*if (!Array.prototype.last){
							Array.prototype.last = function(){
								return this[this.length - 1];
							};
						};

						$.each(charts, function(i, chart){
							if (chart === charts.last()){
								console.log(i + JSON.stringify(chart));
							} else {
								//chart['legend'] = {'enabled':'false'};
								console.log(i + JSON.stringify(chart));
							}
						});*/
                        
                        index = strBoundData.indexOf('{color:');
                        while(index != -1) {
                            if(strBoundData.indexOf('{color}') == -1) break;
                            var color = strBoundData.substring(index + 7, strBoundData.indexOf('}', index));
                         	strBoundData = strBoundData.replace('{color:' + color + '}', '{color}');
                            strBoundData = strBoundData.htmlReplace('{color}', '<span style="color:' + color + '">', '</span>')
                            index = strBoundData.indexOf('{color:');
                        }
                        
                        elem.html(strBoundData);
                        
                        if(tableIndex != -1) {
                            $('.smart_table', elem).dataTable({
                                'bSort':false,
                                'bFilter':false,
                                'bPaginate': false,
                                'bInfo': false
                            });
                            $('div.row', elem).remove();
                        }
                        if(charts.length > 0) {
                            $.each(charts, function(i, chart) {
                            	console.log(JSON.stringify(chart));
                                $('.smartchart_' + i, elem).highcharts(chart, function(chart){
                                	//console.log(chart);
									if(cLabel1.length !=0){
										 chart.renderer.text(cLabel1, 100, 80)
											.css({
												color: 'black',
												fontSize: '14px'
											})
											.add();
									if(cLabel2.length !=0){
										 chart.renderer.text(cLabel2, 400, 80)
										 .css({
												color: 'black',
												fontSize: '14px'
											})
											.add();
											}
									}

                                });
                            });
                        }
                    }