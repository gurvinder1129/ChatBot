/// Begin Enums
    var CHROMESTYLE = {
        NONE: 0,
        PLAIN: 1,
        TITILEONLY: 2,
        WINDOW: 3,
        PORTALMODULE: 4,
        PORTALMODULE_WITH_M: 5,
        PORTALMODULE_WITH_E: 6,
        PORTALMODULE_WITH_EM: 7,
        PORTALMODULE_MAX: 8,
        PORTALMODULE_WITH_X: 9
    },
    /// End Enums

    CEBWidget = function() { },
    EventManager;
    
    function checkIfDataEmpty(dataToCheck) {
        try {
        if (dataToCheck != null && $.isArray(dataToCheck)) {
            return dataToCheck.length <= 0;
        }
        else {
            for (element in dataToCheck) {
                if (typeof dataToCheck[element].length != 'undefined' && dataToCheck[element].length > 0) {
                    return false;
                }
            }
            return true;
        }
        } catch (error) {
            //TODO: Log error
            return false;
    }
    }

    /// Begin Global common functions
    if (typeof app === 'object' && typeof app.analyticsConfig === 'function') {
    	app.analyticsConfig().done (function (tracker){
    		if (typeof tracker === 'string') {
    			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      			  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      			  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      			 })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        	}
    	});
    	
    }
    //Gets data at multiple level - moving it to a common function cause its needed in more than one place
    function getDataFromIterate(property, data) {
        if (!property) {
            return data;
        }
        if(property.indexOf('+') != -1) {
            var retVal = [];
            var propTokens = property.split('+');
            var propData = getDataFromIterate(propTokens[0], data);
            var getChildData = function(parentData) {
                var childData = getDataFromIterate(propTokens[1], parentData);
                if($.isArray(childData)) retVal = retVal.concat(childData);
                else retVal.push(childData);
            };
            if($.isArray(propData)) {
                $.each(propData, function(j, pd){
                    retVal.push(pd);
                    getChildData(pd);
                });
            }
            else {
                retVal.push(propData);
                getChildData(propData);
            }
            return retVal;
        }
        else if(property.indexOf('..') != -1) {
            var retVal = [];
            var propTokens = property.split('..');
            if(propTokens.length < 2) return data;
            var propIter = function(propData, currentTokenIndex) {
                var childData = getDataFromMap(propTokens[currentTokenIndex], propData);
                if(childData != null && typeof(childData) != 'undefined') {
                    if(currentTokenIndex == propTokens.length - 1) retVal = retVal.concat(childData);
                    else {
                        $.each(childData || [], function(i, curData){
                            propIter(curData, currentTokenIndex+1);
                        });
                    }
                }
            };
            propIter(data, 0);
            
            return retVal;
        }
        if (property != '.' && property.indexOf('.') != -1) {
            var tempData = data;

            $.each(property.split('.'), function(j, propertyItem) {
                var currentData = getDataFromMap(propertyItem, tempData);
                if (currentData == null || (typeof(currentData) == "undefined")) {
                    tempData = null; //Fix for the case when the last data is null. it was returning tempdata which had to be cleared out
                    return;
                }
                tempData = currentData;
            });
            return tempData;
        }
        if(property == '.') return data;
        var retVal = getDataFromMap(property, data);
        return retVal;// == null || (typeof(retVal) == "undefined") ? []: retVal;
    }
    
    //Gets the data from a map
    function getDataFromMap(property, data) {
        if(!data || data == null) return data;
        var index =property.indexOf('['); 
        if(index == -1 || property.indexOf(']', index) == -1) {
            var tmpRetVal = data[property];
            if($.isNumeric(tmpRetVal) && tmpRetVal == 0) return tmpRetVal + '';
            return data[property];
        }
        var indexer = property.substring(index + 1, property.indexOf(']', index));
        var selectedData = $.isNumeric(indexer)?parseInt(indexer): (getDataFromIterate(indexer, data) || '');
        var retVal = (data[property.substring(0, index)] || [])[selectedData];
        if($.isNumeric(tmpRetVal) && retVal == 0) 
            return retVal + '';
        return retVal;
    }


    //PK - Writing a utility function that would get the frame that would assist us in
    //Cross Domain Requests. This is making sure the framework works for the future as well
    function getXDRFrame(uri) {
        var frameId = uri.replace('http://', '').replace('https://', '').replace('www.', ''),
            dotIndex = frameId.indexOf('.com');

        if (dotIndex > 0) {
            frameId = frameId.substring(0, dotIndex);
        }
        frameId = frameId.replace(/\./g, '_');
        return document.getElementById('xdrFrame' + frameId);

    }
    
    // Ishan - Function for data-bind-type = "filter" for single and multiSelect
    function renderSelectFilter (boundData, self, elem, isMulti) {
        var optionsData = boundData.hasValues ? boundData.filterValues : boundData.dbFilterValues,
        select = isMulti ? $('<select />').attr ('multiple', 'multiple') : $('<select />'),
        options = '';
        
        select.addClass ('form-control');
        
        if (isMulti) 
        	select.attr ('placeholder', app.getLocalizedText('App.Cebdropdown.Nothing_Selected' ,'Please Select...'));
        
        if ($.isArray (optionsData)) {
            $.each (optionsData, function (index, option){
            	if (option.value == -1 && !isMulti){
            		options += '<option value = "' + option.value + '">' + app.getLocalizedText('App.Cebdropdown.All' ,'All') + '</option>';
            	}
            	else if (option.value != -1){
            		option.value = option.value.replace(/&lt;script&gt;/g, '').replace(/&lt;\/script&gt;/, '');
            		option.text = option.text.replace(/&lt;script&gt;/g, '').replace(/&lt;\/script&gt;/, '');
            		options += '<option value = "' + option.value + '">' + option.text + '</option>';
            	}
            });
            elem.html('');
            $(select[0]).html (options);
            elem[0].appendChild(select[0]);
            select.appendTo (elem).on ('change', function (e){
                var _this = $(this);
                EventManager.raiseEvent('filterChanged', self.widgetType, {currentTarget: e.currentTarget, context: {val:  _this.val(), text: _this.find ('option:selected').text()}, targets: boundData.targetColumn, filterType : boundData.filterType, widgetinstance: self});
            });
            
            select.cebdropdown({
            	hasFilter: true
            });
        }
        
        return select;
    }
	
    var extractZoneDiff = function(date)
    {
    	var a = date.indexOf("+") == -1 ? date.lastIndexOf("-") : date.indexOf("+"),
    		b = date.indexOf(" ", a),
    		zone = date.substring(a, b == -1 ? date.length : b),
    		timeStamp = zone.substring(zone.indexOf('T') + 1),
    		op = timeStamp.charAt(0),
    		mn = timeStamp.substring(timeStamp.length - 2),
    		hr = timeStamp.substring(1, timeStamp.length - 3);
    	
    	return {
    		operation: op,
    		hours: hr,
    		minutes: mn
    	};
    },
    changeTimeZone = function(date, diff) //Takes a valid date string or date in milliseconds and the Time Difference object {operation, hours, minutes}
    {
    	var temp = new Date(date),
    		currOffset = temp.getTimezoneOffset(),
    		date_f = temp.getTime(),
    		serverOffset = 0,
    		finalOffset = 0;
    	
    	switch(diff.operation)
    	{
    		case '+':
    			serverOffset -= parseInt(diff.hours) * 60;
    			serverOffset -= parseInt(diff.minutes);
    		break;
    		case '-':
    			serverOffset += parseInt(diff.hours) * 60;
    			serverOffset += parseInt(diff.minutes);
    		break;
    	}
    	
    	finalOffset = currOffset + serverOffset;
    	date_f += (finalOffset * 60000) + (60* 60 * 1000); //Adding 1hr because of the daylight saving
    	
    	return date_f;
    },
    dbTime = readCookie("dbTime")?extractZoneDiff(readCookie("dbTime").substring(1, readCookie("dbTime").length-1)): {operation: "+", hours: "00", minutes: "00"};
	
	app.loadDateRangeComponent = function (widgetName) {
		var url = daterangefilterUrl;
			app.daterange = {};
			$.getScript (url, function (){
				if (typeof app.dateRangeLoaded === 'function')
					app.dateRangeLoaded(widgetName);
			});
	};
	
	app.dateRangeLoaded = function (widgetName) {
		try {
			if (app.daterange && typeof widgetName != 'undefined') {
				var relPath = widgetName.relativePath.split ('.jspx')[0],
				tempSlashIndex = relPath.lastIndexOf ('/'),
				targetWidgetInstance =  CEBWidget.namedInstances [relPath.substring (tempSlashIndex + 1, relPath.length)],
				oGrid = $('table.generic-grid', targetWidgetInstance.target).dataTable();
				app.daterange.grid = oGrid;
				app.daterange.current.key = null;
				app.daterange.current.start = null;
				app.daterange.current.end = null;
				app.daterange.init();
			}
		}
		catch (ex) {throw "Error occured in framework at app.dateRangeLoaded function : " + ex;};
	};
    
    // GUID Utility
    /* Jquery function to create guids.
     * Guid code from 
     * http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
     */
     
    $.fn.newguid = function () {
        this.val('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8; return v.toString(16); }));
        return this;
    };
    
    function runValidations (allValidations, isTriggerByHuman, self, validation, ERR_OBJ, value, validationLimit) { //validationLimit is optional
        
        var getErrorString = function (type, fallback, append) {
            ERR_OBJ.hasErrored = true;
            ERR_OBJ.error = app.getLocalizedText ('framework.validation.' + type, fallback) + ((typeof append !== 'undefined' || append != null) ? " " + append : '');
        };

        allValidations = allValidations.join('|');
            switch (validation) {
                case 'required' :  
                                    if (value == "" || typeof value == 'undefined' || value == null) {
                                        getErrorString (validation, 'This is a required field');
                                    }
                                    break;
                                    //Ignore Syntax error as this is STS issue. 
                case 'email'    : var pattern = /^[\w!#$%&'*+\-/=?\^_`{|}~]+(\.[\w!#$%&'*+\-/=?\^_`{|}~]+)*@((([\-\w]+\.)+[a-zA-Z]{2,4})|(([0-9]{1,3}\.){3}[0-9]{1,3}))$/;
                                  if (!value.match (pattern)) {
                                      getErrorString(validation, 'Please enter a valid email');
                                  }
                                  break;
								  
				case 'url'    : var pattern = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
                                  if (!value.match (pattern)) {
                                      getErrorString(validation, 'Please enter a valid url');
                                  }
                                  break;
				case 'remaininglength' :   if (value.length + 1 > validationLimit){		
									getErrorString('maxlength' , 'Maximum characters allowed are ', validationLimit);
									ERR_OBJ.preventDefault=true;
										} else{
										var left = validationLimit - value.length - 1;
										getErrorString(validation, 'Character(s) remaining', left);
										}
										break;
                                  
                case 'maxlength' : if (value.length > validationLimit){
                                    getErrorString(validation, 'Maximum characters allowed are ', validationLimit);
									ERR_OBJ.preventDefault=true;
                                  }
                                  break;
                
                case 'startswith' : if (!value.toLowerCase().startsWith (validationLimit.toLowerCase())){
                                        validationLimit = $.trim (app.converToMixCase (validationLimit));
                                        getErrorString(validation, 'Please enter a value that starts with ', validationLimit);
                                    }
                                  break;
                                  
                case 'endswith' : if (!value.endsWith (validationLimit)){
                                    getErrorString(validation,'Please enter a value that ends with ', validationLimit);
                                  }
                                  break;
                                  
                case 'numeric' :    if (allValidations.indexOf ('startswith::') != -1) {
                                        if (isNaN(value.substring(1))){
                                            var startsWithSub = allValidations.substring (allValidations.indexOf ('startswith::') + 'startswith::'.length),
                                            subVal = startsWithSub.substring (0, startsWithSub.indexOf ('|'));
                                            subVal = $.trim (app.converToMixCase (subVal));
                                            getErrorString(validation + '.startswith', 'Please enter a numeric value that starts with ', subVal);
                                        }
                                    }
                                    else if (!$.isNumeric(value) || (Number (value) !== parseInt (value, 10))){
                                        getErrorString(validation, 'Please enter only numeric values ');
                                    }
                                  break;
                                  
                case 'minval' : if (!isNaN(value) && !isNaN(validationLimit) && (Number(value) < Number(validationLimit))){
                                    getErrorString(validation, 'Please enter a value greater than ', (Number (validationLimit) - 1));
                                  }
                                  break;
                                  
                case 'maxval' : if (!isNaN(value) && !isNaN(validationLimit) && (Number(value) > Number(validationLimit))){
                                    getErrorString(validation, 'Please enter a value lesser than ', validationLimit);
                                }
                                break;
                case 'range' : if (!isNaN(value)){
	                    			if (validationLimit.indexOf('~')!= -1) {
	                        			(function(){
	                            			var range = validationLimit.split ('~');
	                        				if (!isNaN (range[0]) && !isNaN (range[1])){
				                                var iLow = Number (range[0]),
				                                iHigh = Number (range[1]),
				                                iVal = Number (value);
				                                
				                                var rangeCheck = ((iVal > iLow || iVal === iLow) && (iVal < iHigh || iVal === iHigh)); 
				                                if (!rangeCheck) {
				                                    var append = iLow + " " + " to " + " " + iHigh;
				                                    getErrorString(validation, 'The value must be between ', append + ".");
				                                }
	                        				}
	                        			}());
	                    			}     
                				}
                				break;

            }
            
            if (isTriggerByHuman && validation !== 'required' && value == "")
                ERR_OBJ.shouldRenderError = false;
            
        return ERR_OBJ;
    } 
    
    /// End common functions

    ///Begin CEB widget class

    CEBWidget.instances = [];
    CEBWidget.instanceCount = 0;
    /// All instances that are named are placed here.
    CEBWidget.namedInstances = [];

    CEBWidget.prototype = $.extend(true, {}, {
        ///Specifies the type of the widget. This gets set in the init method
        widgetType: 'CEBWidget',
        /// if refreshInterval is set use interval for re-fetch
        refreshInterval: 15000,
        //Set this to true if auto refresh is on and the data fetched is a delta of the previously loaded data
        supportsDelta: false,
        //the interval being used (if used)
        interval: null,
        //interval callback
        intervalCallback: null,
        //setting retry counts before stopping auto re-fetch
        retryCount: 0,
        retryCountMax: 3,
        /// Indicates whether auto refresh is started or not
        autoRefreshStarted: false,
        /// The DOM at which the widget is rendered.
        runOnce: false,
        target: null,
        /// The context against with the widget is working on
        context: null,
        /// The model to be used to render the widget.
        model: null,
        /// Indicates whether any data that the widget would update on the server or if it is only GETs
        isReadOnly: false,
        /// This is the chrome around the widget. Possible values are None, Plain, TitleOnly, Window, PortalModule, PORTALMODULE_WITH_M
        chromeStyle: CHROMESTYLE.NONE,
        /// Title of the widget. This would be rendered if the ChromeStyle is not None.
        title: '',
        /// Text to pop when the 'info' button is pressed. This would be needed for Dashboards?
        info: null,
        /// A unique ID that is automatically assigned to the widget.
        id: '',
        /// The name of the widget. This could be used to get the instance from the named instances
        name: '',
        /// Property that indicates if the widget is currently loading the data.
        poll: false,
        /// Decide whether to poll for values from the server and fetch it for the grid. 
        localPollData: [],
        isLoading: false,
        /// The basic URI from which the data has to be loaded. The params are appended by the framework
        dataURI: '',
        /// A key value pair of the data load params. This would be appended to the URL or sent via POST.
        dataLoadParams: {},
        ///This specifies the HTTP type to be used for making request
        httpType: 'POST',
        /// The data to which the current control binds to. If there are multiple data objects, then this
        /// valus should be an Array and the model should have array based bindings
        pageNumber: 0,
        ///For fetching the page
        pageSize:100,
        ///Initially fetching first ten records for the grid
        bindData: null,
        /// This is the last updated timestamp.
        lastUpdated: null,
        /// Context changed event that would be raised when the context is modified.
        onContextChanged: function(oldCtx, newCtx) { },
        /// OnLoad event handler. The event would be fired when the control is loaded and ready to use.
        ///If this field is true, then any of the input fields of this widget is changed
        dirty: false,
        ///If this field is true, then atleast one validation (data-bind-validate) has failed
        hasErrored: false,
        ///Array of errors holding the failed validation strings
        validationErrors : [],
        ///Array for holding the mapping of widget and it's elements that hold data-bind-validate for View Validation
        validationElements : [],
        //Map for holding maxlength values of admin and candidate input fields
        maxLengthMap : {},
        //A flag to indicate whether the data has to be persisted into original data
        saveOriginalData: false,
        //Original data before the data was bound to the widget
        originalData: {},
		//Spinner class from source DOM
		loaderClassName: '.tc-source-loader',
		//Threshold for dropdowns for this widget
		dropdownThreshold: null,
        //Method to push Row Context into seletecRows array. Used by data-bind-type = "rowselector"
        getCurrentVisibleSelectedRows : function () {
        	var oGrid = $('table', this.target).dataTable(),
        	rows = oGrid.$('tr:visible');
        	currentRowsContext = [];
        	for (var i = 0; i < rows.length; i++) {
        		if ($(rows[i]).find ('[data-bind-type="rowselector"] input[type="checkbox"]')[0].checked)
        			currentRowsContext.push ({
        				row : rows[i],
        				context : oGrid.fnGetData(rows[i])
        			});
        	}
        	return currentRowsContext;
        },
        areRowsSelected : function (dataTableElement) {
        	var oGrid = (dataTableElement? dataTableElement: $('table', this.target)).dataTable(),
            rows = oGrid.$('tr:visible'),
            returnObject = {any : false, all : true};
            for (var i = 0; i < rows.length; i++) 
                $(rows[i]).find ('[data-bind-type="rowselector"] input[type="checkbox"]')[0].checked ? returnObject.any = true : returnObject.all = false;
            return returnObject;
        },
        onLoad: function(e) {
            this.loaded();
        },
        /// Has widget been rendered yet - render function will set to true
        rendered: false,
        loaded: function() {
            this.render();
            if (this.poll) {
            	this.polling();
            	this.setIsLoading (true, this);
            }
            	
            var handled = EventManager.raiseEvent('Loaded', this.widgetType, this);
            if (!handled) {
                this.fetch(this.httpType);
            }
        },
        //start interval and run postback if there
        startInterval: function() {
            var self = this;
            //Logger.info("starting interval");
            self.interval = setInterval(function() {
                if (self.intervalCallback) {
                    self.intervalCallback();
                } else {
                    if (!self.supportsDelta) {
                        self.bindData = [];
                    }
                    self.fetch(self.httpType);
                }
            }, self.refreshInterval);
            self.autoRefreshStarted = true;
        },
        handleFetchErrors: function(instance, status, err) {
            var errorMsg = 
            app.getLocalizedText('framework.generic_error_message_1', 'There has been an error processing your request.  Please try again.  If the problem persists, please') + ' ' + '<a>' + app.getLocalizedText('framework.generic_error_message_2', 'contact us') + '</a>';
            errorMsg = errorMsg.replace('<a>', '<a href=' + app.contact +' target="_blank" widget-data-event="click::ErrorHelpClicked">');
            instance.target.html("<span class='error'>" + errorMsg + '</span>');
        },
        //manually stop interval
        stopInterval: function() {
            var self = this;
            //Logger.error("clearing interval manually");
            clearInterval(self.interval);
            self.autoRefreshStarted = false;
        },
        /// Sets the context for the current widget.
        setContext: function(ctx, doNotLoadData) {
            var old = this.context,
                params = '',
                url;
            this.context = ctx;
            if (this.onContextChanged(old, ctx)) {
                this.lastUpdated = null;
                if (ctx != null && ctx.IsExport != null && ctx.IsExport == true) {

                    url = this.dataURI + '?' + params;
                    window.open(url, '_blank', 'location=no,scrollbars=no,resizable=no,menubar=no,height=100,width=100');
                    ctx.IsExport = false;
                    return;

                }
                //If we had done !doNotLoadData, then any object passed in as parameter would have failed the condition
                //Hence specifically checking for true below
                if (doNotLoadData != true) {
                    this.bindData = [];
                    if (this.pollURI && this.pollURI != '') {
                    	this.poll = true;
                    	this.pageNumber = 0;
                    	this.polling();
                    }
                    else
                    	this.fetch(this.httpType);
                }
            }
        },
        //Method to ensure the id associated with a DOM element is unique
        modifyIds: function(target) {
            var self = this;
            $.each($('[id]', target), function(i, elem) {
                if (elem.id.indexOf(self.id) != 0) {
                    elem.id = this.id + elem.id;
                }
            });
        },
        /// This is the callback that should be overwritten if data needs custom merging
        mergeCallback: function(oldData, newData, shouldPrepend, mergeProperty) {
            if (mergeProperty == '.') {
                mergeProperty = null;
            }

            var mergeArray = function(source, dest) {
                $.each(source, function(i, item) {
                    if (shouldPrepend) {
                        dest.splice(i, 0, item);
                    } else {
                        dest.push(item);
                    }
                });
            },
            mergeObject = function(source, dest) {
                if (mergeProperty && source[mergeProperty] && dest[mergeProperty]) {
                    if ($.isArray(source[mergeProperty]) && $.isArray(dest[mergeProperty])) {
                        mergeArray(source[mergeProperty], dest[mergeProperty]);
                    }
                } else {
                    for (var prop in source) {
                        if ($.isArray(source[prop]) && $.isArray(dest[prop])) {
                            mergeArray(source[prop], dest[prop]);
                        }
                    }
                }
            },
            isNewDataArray,
            isOldDataArray;

            if (oldData && newData) {
                isNewDataArray = $.isArray(newData);
                isOldDataArray = $.isArray(oldData);
                if (isOldDataArray && isNewDataArray) {
                    mergeArray(newData, oldData);
                    return true;
                } else if (!isOldDataArray && !isNewDataArray) {
                    mergeObject(newData, oldData);
                    return true;
                }
            }
            return false;
        },

        /// Inits the control. Any overrides must invoke the base function for the widgets to work properly
        init: function(widgetType, target, model, name) {
            EventManager.registerEvent('Loaded', widgetType);
            EventManager.registerEvent('Rendered', widgetType);
            EventManager.registerEvent('DataBound', widgetType);
            EventManager.registerEvent('WidgetContextChanged', widgetType);
          

            //Logger.debug("Initializing Widget... ");
            this.widgetType = widgetType;
            this.target = target;
            this.id = 'w_' + widgetType + '_' + CEBWidget.instanceCount++;
            this.name = name;
            this.modifyIds(target);
            this.dirty = false;
            
            //TODO: Add the actual instances here when we have the destructor logic inplace. Else
            // we would be holding up the widgets forever
            CEBWidget.instances[this.id] = this;
            if (name) {
                if (CEBWidget.namedInstances[name]) {
                    //Logger.warn("A widget with the name - " + name + " is already registered. The instance would be overwritten");
                }
                CEBWidget.namedInstances[name] = this;
            }
            this.model = model;
            this.onLoad();
        },
        //Function to render the control.
        //we could potentially be async here and hence passing in model
        //as "this" could be null
        render: function(modelToUse, instance) {
            var self = instance || this,
                s = self.chromeStyle,
                html = [];

            if (s == CHROMESTYLE.WINDOW || s == CHROMESTYLE.TITLEONLY || s == CHROMESTYLE.PLAIN) {
                html.push("<div class='ui-widget'><div class='ui-widget-header'>", self.title);
                if (s != CHROMESTYLE.TITILEONLY) {
                    html.push("<span style='float:right; width:50px'><span class='ui-icon ui-icon-zoomin maximize' style='display:inline-block'/><span class='ui-icon ui-icon-help help' style='display:inline-block'/><span class='ui-icon ui-icon-wrench settings' style='display:inline-block'/></span>");
                }
                html.push('</div>');
            }

            if (s == CHROMESTYLE.NONE) {
                html.push((modelToUse || self.model).html());

            } else if (s == CHROMESTYLE.PORTALMODULE || s == CHROMESTYLE.PORTALMODULE_WITH_M || s == CHROMESTYLE.PORTALMODULE_WITH_E || s == CHROMESTYLE.PORTALMODULE_WITH_EM || s == CHROMESTYLE.PORTALMODULE_WITH_X) {
                html.push('<div class=\"moduleInner\"><h3 class=\"gradientHeader\">', self.title, '<a class=\"info\" href=\"javascript:void(0);\"></a><div class=\"infoPop\"></div>',
                    ((s == CHROMESTYLE.PORTALMODULE_WITH_E || s == CHROMESTYLE.PORTALMODULE_WITH_EM) ? ' <a class=\"editDbWidget\" href=\"javascript:void(0);\"><span>TODO: Write Edit title here<span></a>' : ' '),
                    ((s == CHROMESTYLE.PORTALMODULE_WITH_E || s == CHROMESTYLE.PORTALMODULE_WITH_EM) ? ' <a title=\"TODO: Write title here\" class=\"removeMe\" href=\"javascript:void(0);\">X</a>' : ' '),

                    '</h3>', (modelToUse || self.model).html(), '</div>');

            } else if (s == CHROMESTYLE.PORTALMODULE_MAX) {
                html.push('<div class=\"moduleInner\"><h3 class=\"gradientHeader\">', self.title, '<a class=\"minimize\" href=\"javascript:void(0);\">MIN</a><a class=\"info\" href=\"javascript:void(0);\"></a><div class=\"infoPop\"></div></h3>',
                    (modelToUse || self.model).html(), '</div>');

            } else {
                html.push("<div class='ui-widget-content'>", (modelToUse || self.model).html(), '</div>');
                html.push('</div>');

            }

            if (typeof Modernizr != 'undefined' && !$(self.loaderClassName).length) {
                if (Modernizr.cssanimations) {
                    html.push('<div class=\"commonloadingicon\"><i class=\"icon-spinner icon-spin icon-large\"></i></div>'); //TODO: Get a common loading icon
                }
                else {
                    html.push('<div class=\"commonloadingicon no-animation-support\"></div>'); //TODO: Get a common loading icon
                }
            }

            $(self.target).html("").html(html.join('')).attr('widget-id', self.id);
            $('.ui-state-default', $(self.target)).mouseenter(function(e) {
                $(this).removeClass('ui-state-active').addClass('ui-state-hover');
            }).mouseleave(function(e) {
                $(this).removeClass('ui-state-hover');
            }).mousedown(function(e) {
                $(this).addClass('ui-state-active');
            }).mouseup(function(e) {
                $(this).removeClass('ui-state-active');
            });
            $('a.maximize', $(self.target)).click(function(e) {
                //alert(localizedString('txtMaximize', 'maximize'));
            });
            $('a.help', $(self.target)).click(function(e) {
                //alert('Help');
            });
            $('a.editDbWidget', $(self.target)).click(function(e) {
                EventManager.raiseEvent('EditSettings', 'CEBWidget', self);
            });
            self.createInfoTip();
            self.bindData = [];
            self.rendered = true;
            //this.bind(null, self);
            self.setIsLoading(false, self);

            /*$('[widget-data-event]', self.target).each(function(i, ele) {
                try {
                    var ets = $(this).attr('widget-data-event');
                    var et = ets.split('::');
                    if (et[0] && et[1] && et[0] !== et[1]) {
                        $(this).data('widget-name', self.widgetType);
                        $(this).bind(et[0], function(event) {
                            var cont = $(ele).data('context') || $(self).data('context');
                            var attr = { type: et[1], 'context': cont, 'currentTarget': ele, 'widgetinstance': self };
                            EventManager.raiseEvent(et[1], self.widgetType, attr);
                        });
                    }
                } catch(error) {
                    //TODO: Log error
                }
                // $(this).removeAttr("data-event");
            });*/

            EventManager.raiseEvent('Rendered', self.widgetType, self);
            if ($(self.target).attr ('widget-type').toLowerCase() === 'genericfilterwidget') {
                EventManager.registerEventHandlers ('filterChanged', self.widgetType, function (args, event){ 
                    var relPath = args.widgetinstance.bindData.widgetName.relativePath.split ('.jspx')[0],
                    tempSlashIndex = relPath.lastIndexOf ('/'),
                    targetWidgetInstance =  CEBWidget.namedInstances [relPath.substring (tempSlashIndex + 1, relPath.length)],
                    oGrid = $('table.generic-grid', targetWidgetInstance.target).dataTable(),
                    headers = oGrid.fnSettings().aoHeader [0],
                    targetColumnIndex = -1,
                    filterString = '',
                    filterType = args.filterType,
                    value = args.context.val,
                    bRegex = false;
                    
                    for (var headerIndex = 0; headerIndex < headers.length; headerIndex++) {
                        if ($(headers [headerIndex].cell).data ('filtermap') == args.targets) {
                            targetColumnIndex = headerIndex;
                        }
                    }
                    
                    if (targetColumnIndex > -1) {
                        if (filterType === 'TOGGLE') 
                        	value === true ? filterString = 'true' : filterString = '';
                        else if (filterType === 'MULTISELECT') {
                        	if (value && value.length) {
                        		filterString = value.join ('|');
                        		filterString = filterString.replace('(', '');
                        		filterString = filterString.replace(')', '');
                        		filterString = filterString.replace(/ /g,'');
                        		bRegex = true;
                        		
                        	}
                        }
                        else
                            (value == -1 || value == '') ? filterString = '' : filterString = args.context.val;
                            
                        oGrid.fnFilter ( filterString, targetColumnIndex, bRegex, false);
                    }
                });    
            }
            
        },
        createInfoTip: function() {
            var self = this,
                i = self.info,
                link = $('a.info', self.target),
                pop;

            if (i && link) {
                pop = link.siblings('div.infoPop');
                pop.html(i);

                link.click(function() {
                    $('div.infoPop').not(pop).hide('fast');

                    pop.toggle('fast');

                    return false;
                });
            }
        },
        
        polling: function(){
            
            var self = this;
            self.dataLoadParams.pageNumber = self.pageNumber;
            self.dataLoadParams.pageSize = 500;
            var xhr = AjaxRequest.send(self.pollURI,'post', null, null, self.dataLoadParams, null, null, null),
            gridElement = $('.poll-grid', self.target);
            
            xhr.success (function(dataReceived){
            	//console.log (new Date());
                var rows = dataReceived.Data;
                self.localPollData = [];
                for (var i = 0; i < rows.length; i++) 
                    self.localPollData.push (rows[i]);
                
                var isLoading = false;
                
                EventManager.raiseEvent ('pollSuccessCallback', self.target.attr ('widget-type'), {'instance': self, 'rows': rows});
                
                if (self.pageNumber == 0){
                	self.poll = false;
                	if (rows.length)
                		self.setContext ({'localData': self.localPollData});
                	else
                		gridElement.dataTable().fnClearTable();
                }
                else {
                	gridElement.dataTable().fnAddData (rows, false);
                	gridElement.dataTable().fnStandingRedraw();
                }
                
                if(dataReceived.Data.length && dataReceived.Data.length == self.dataLoadParams.pageSize){
                	self.pageNumber = Number(self.pageNumber) + 1;
                	
                	if (self.widgetType = "ProjectWidget" && self.dataLoadParams.isDraft == true){
                		self.poll = false;
                	}
                	else {
                		self.polling();
                		isLoading = false;
                	}
                }
                else
                	self.poll = false;
                
                self.setIsLoading (isLoading, self);
            });
            
            xhr.error(function(jqXR, textStatus, errorThrown){
                //console.log("error");
            });
    },

        /// Transforms the data either using predefined transforms. If none on of the predefined transforms match,
        /// it would assume it to be a custom transform
        transformData: function(data, transform, truncMaxLength, rawData, instance, elem) {
            if (!transform) { return data; }
            instance = instance || this;
            var transforms = transform.split('|');
            for(var i = 0; i < transforms.length; i++) {
                data = instance.chainTransformData(data, transforms[i].trim(), truncMaxLength, rawData, instance, elem);
            }
            return data;
        },
        
        chainTransformData: function(data, transform, truncMaxLength, rawData, instance, elem) {
            if (!transform) { return data; }
            var transformedData = data;

            try {
                //Please note that data could be null. Any new transforms should make sure it takes care of null checks!
                var transformTokens = transform.split('::');
                transform = transformTokens[0];
                switch (transform) {
	                case 'correctincorrect':
                        transformedData = (data + '').toLowerCase() == 'true' ? app.getLocalizedText('framework.correct','Correct') : app.getLocalizedText('framework.incorrect','Incorrect'); //TODO: Localize
	                break;
	                case 'sentnotsent':
	                    transformedData = (data + '').toLowerCase() == 'true' ? app.getLocalizedText('framework.sent','Sent') : app.getLocalizedText('framework.not_sent','Not Sent'); //TODO: Localize
	                    break;
	                case 'yesno':
	                    transformedData = data ? app.getLocalizedText('framework.yes','Yes') : app.getLocalizedText('framework.no','No'); //This translates a boolean into a readable 'Yes', 'No' text
	                    break;
	                case 'activeinactive':
                        transformedData = data ? app.getLocalizedText('framework.active','Active') : app.getLocalizedText('framework.inactive','Inactive'); //This translates a boolean into a readable 'Active', 'No' text
                        break;
                    case 'touppercase':
                        transformedData = typeof data != 'undefined' ? data.toUpperCase() : data;
                        break;
                    case 'tolowercase':
                        transformedData = typeof data != 'undefined' ? data.toLowerCase() : data;
                        break;
                    case 'camelcase':
                        transformedData = typeof data != 'undefined' ? data.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                            return letter.toUpperCase();
                        }) : data;

                        break;
                    
                    case 'join': 
                        if (transformTokens.length > 1) {
                            (function(){
                                var _delimeter =  transformTokens[1] || ', ';
                                if ($.isArray(data)) transformedData = data.join (_delimeter) + '';
                                else transformedData = data;
                            }());
                        }
                    case 'abbrevate':
                        var words = data.split(' ');
                        var abbrevation = '';
                        $.each(words, function(i, word) {
                            var chr = word.charAt(0);
                            if(chr == '(') chr += word.charAt(1) + ')';
                            abbrevation += chr;
                        });
                        abbrevation = abbrevation.toUpperCase();
                        var abbrevatedTexts = window.abbrevatedTexts || [];
                        if($.inArray(abbrevation, abbrevatedTexts) > -1) {
                            for(var i = 0; i < 100; i++) {
                                abbrevation += i;
                                if($.inArray(abbrevation, abbrevatedTexts) == -1) break;
                            }
                        }
                        abbrevatedTexts.push(abbrevation);
                        window.abbrevatedTexts = abbrevatedTexts;
                        $(elem).attr('title', data);
                        transformedData = abbrevation;
                        if(transformTokens[1]) {
                            var legend = $('#' + transformTokens[1]);
                            var html = [];
                            var $row = $('<tr />');
                            var $keyCell = $('<td />').addClass ('key_cell').text (abbrevation);
                            var $valueCell = $('<td />').addClass ('value_cell').text (data);
                            
                            $keyCell.appendTo ($row);
                            $valueCell.appendTo ($row);
                            $row.appendTo (legend);
                        }
                        break;
                    case 'trunc':
                         transformedData = typeof data == 'string' ? $.trim(data).trunc(truncMaxLength) : $.trim(data);
                        break;
                    case 'expression':
                        if (transformTokens.length > 1) {
                            var expression = transformTokens[1] || '';
                            var braceIndex = 0;
                            var tempData = data || rawData;
                            if($.isArray(tempData) && tempData.length < 1){
                                tempData = rawData;
                            }
                            while ((braceIndex = expression.indexOf('{', braceIndex)) > -1) {
                                var endIndex = expression.indexOf('}', braceIndex);
                                if (endIndex > -1) {
                                    var variable = expression.substring(braceIndex + 1, endIndex);
                                    var variableData = "";
                                    if(variable == "widgetId") variableData = instance.id.toLowerCase();
                                    else if(variable == "widgetName") variableData = instance.name.toLowerCase();
                                    else if(variable == ".") variableData = tempData;
                                    else variableData = tempData[variable];
                                    expression = expression.replace('{' + variable + '}', variableData);
                                }
                                braceIndex++;
                            }
                            transformedData = expression;
                        }
                        break;
                    case 'count':
                        if ($.isArray(data)) transformedData = data.length + '';
                        else if ($.isArray(rawData)) transformedData = rawData.length + '';
                        else transformedData = '0';
                        break;
                        
                    case 'countincrement':
                        if ($.isArray(data)) transformedData = data.length + 1 + '';
                        else if ($.isArray(rawData)) transformedData = rawData.length + 1 + '';
                        else transformedData = '0';
                        break;  
                        
                    case 'anyAvailable':
                        if ($.isArray(data)) transformedData = data.length > 0;
                        else if ($.isArray(rawData)) transformedData = rawData.length > 0;
                        else transformedData = false;
                        break;
                    case 'isempty':
                        if(typeof(data) == 'undefined' || data == null) return true;
                        var strData = data + '';
                        if(strData == '' || strData.trim() == '') return true;
                        return false;
                        break;
                    case 'is':
                        transformedData = false;
                        var strData = data +''; //Ensuring 0 would become a string
                        if(transformTokens.length > 1){
                            if (transformTokens[1].substr(0,1) == "g"){
                                return eval("data > " + transformTokens[1].substr(1) );
                            }
                            if (transformTokens[1].substr(0,1) == "l"){
                                return eval("data < " + transformTokens[1].substr(1) );
                            }
                            return strData == transformTokens[1];
                        }
                        break;
                    case 'isnot':
                        transformedData = false;
                        var strData = data +''; //Ensuring 0 would become a string
                        if(transformTokens.length > 1)
                            return strData != transformTokens[1]; 
                        break;
						case 'isnotempty':            
                            if(typeof(data) == 'undefined' || data == null) return false;
                        var strData = data + '';
                        if(strData == '' || strData.trim() == '' ||strData=='0') return false;
                        
						return true
                    case 'decode':
                        transformedData = typeof data == 'string' ? decodeURIComponent(data): data;
                        break;
                    case 'truncatetext':
                        if(transformTokens[1] && typeof(data) != 'undefined' && data != null) {
                            var trncLen = parseInt(transformTokens[1]);
                            var text = data.substr(0, trncLen) + (data.length > trncLen ? '...' : '');
                            var shouldSetTitle = data.length > trncLen ? true : false;
                            var shouldInitBsTooltip = elem.attr ('data-inittooltip');
                            transformedData = text;
                            
                            if (shouldSetTitle)
                                elem.attr ('title', data + '');
                            
                            if (shouldInitBsTooltip && shouldSetTitle) 
                                elem.tooltip();
                            
                        }
                        break;
                    default:
                        try {
                            //Assuming any other value to be a custom function to call
                            transformedData = window[transform](data, rawData, elem);
                        } catch (error) {
                            //Logger.error('Error while transform - ' + error);
                        }
                        break;
                } //end switch
            } catch (error) {
                //Logger.error('Error while transform - ' + error);
            }
            return transformedData;
        },

        reload: function() {
            this.setContext(this.context);
        },

        dataBinder: function(self, target, boundData, isOuter, elementList, currentIndex) {
            $.each(elementList || $(isOuter ? '[data-bind-outer]' : '[data-bind]', target), function(j, e) {
                var elem = $(e),
                binder = elem.attr(isOuter ? 'data-bind-outer' : 'data-bind'),
                subBinder = elem.attr(isOuter ? 'data-bind-outer-sub' : 'data-bind-sub'),
                bindType = elem.attr('data-bind-type') || '',
                bindTransform = elem.attr('data-bind-transform'),
                bindValidate = elem.attr ('data-bind-validate'),
                //strBoundData = binder == '.' ? boundData : boundData[binder],
                strBoundData = getDataFromIterate(binder, boundData),
                dataBindIf = elem.attr('data-bind-if'),
                dataBindIfTransform = elem.attr('data-bind-if-transform'),
                tempData,
                truncMaxLength = 0;

                //If using data at sub level for binding
                if (subBinder != null && subBinder != '') {
                    strBoundData = (getDataFromIterate(subBinder, boundData) || [])[binder];
                }

                if (bindTransform == 'trunc') {
                    truncMaxLength = Number(elem.attr('data-bind-maxlength') || 0);
                }
                
                var performBind = true;
                
                if(dataBindIf) {
                    var val = getDataFromIterate(dataBindIf, boundData);
                    if(dataBindIfTransform) val = self.transformData(val, dataBindIfTransform, 0, boundData, self, elem);
                    if(val == null || val === false || val === "false") performBind = false; 
                }
                
                if(!performBind) return;

                strBoundData = self.transformData(strBoundData, bindTransform, truncMaxLength, boundData, self, elem);
                // Add class to target item
                if(typeof strBoundData === "string"){
                	strBoundData = strBoundData.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                	strBoundData = app.stripScripts (strBoundData);
                	
                }
                switch (bindType) {
                    case 'noop':
                    break;
                    case 'index':
                        elem.text((typeof(currentIndex) == 'undefined' || currentIndex == null)? '-': currentIndex + 1);
                        break;
                    case 'attribute':
                        var attr = elem.attr('attr-to-bind') || 'widgetboundattr';
                        elem.attr(attr, strBoundData);
                        break;
                    case 'grand-parent-attribute':
                        var attr = elem.attr('attr-to-bind') || 'widgetboundattr';
                        elem.parent().parent().attr(attr, strBoundData);
                        break;
                    case 'parent-attribute':
                        var attr = elem.attr('attr-to-bind') || 'widgetboundattr';
                        elem.parent().attr(attr, strBoundData);
                        break;
                    case 'next-elem-attribute':
                        var attr = elem.attr('attr-to-bind') || 'widgetboundattr';
                        elem.next().attr(attr, strBoundData);
                        break;
                    case 'prev-elem-attribute':
                        var attr = elem.attr('attr-to-bind') || 'widgetboundattr';
                        elem.prev().attr(attr, strBoundData);
                        break;
					case 'next-elem-append-attribute':
                        var attr = elem.attr('attr-to-bind') || 'widgetboundattr';
                        var nextElem = elem.next();
						nextElem.attr(attr, nextElem.attr(attr) + '|' + strBoundData);
                        break;
                    case 'prev-elem-append-attribute':
                        var attr = elem.attr('attr-to-bind') || 'widgetboundattr';
						var prevElem = elem.prev();
						prevElem.attr(attr, prevElem.attr(attr) + '|' + strBoundData);
                        break;
                    case 'href' :
                        if (elem.attr('href')) {
                            if (strBoundData && strBoundData.length && strBoundData.indexOf('/') == 0) {
                                strBoundData = baseUrl + strBoundData.substring(1);
                            }
                            elem.attr('href', strBoundData);
                        }
                        break;
                    case 'title':
                        elem.attr('title', strBoundData);
                        break;
                    case 'parent-title':
                        target.attr('title', strBoundData);
                        break;
                    case 'next-elem-title':
                        elem.next().attr ('title', strBoundData);
                        break;
                    case 'window-title':
                        window.document.title = strBoundData;
                        break;
                    case 'style': case 'parent-style':
                    	var attr = elem.attr('attr-to-bind') || 'widgetboundattr';
                    	var elemToBind = bindType == 'parent-style'?elem.parent(): elem;
                    	elemToBind.css(attr, strBoundData);
                    	break;
                    case 'parent-width':
                        var val = elem.attr('data-bind-value') || 'auto';
                        elem.parent().width(val);
                        break;
                    case 'parent-class':
                    case 'parent-append-class':
                    	if(bindType == 'parent-class')
                    		elem.parent().attr('class', '');
                    	
                        strBoundData = strBoundData + '';
                        elem.parent().addClass(strBoundData.toString().replace(/\s/g, '_').toLowerCase());
                        break;
                    case 'class':
                        elem.attr('class', '');
                        strBoundData = strBoundData + '';
                        elem.addClass(strBoundData ? strBoundData.toString().replace(/\s/g, '_').toLowerCase() : '');
                        break;
                    case 'multi-class':
                        strBoundData = strBoundData + '';
                        var classes = strBoundData.toLowerCase().split(' ');
                        $.each(classes, function(i, c) { elem.addClass(c); });
                        break;
                    case 'multi-class-parent':
                        strBoundData = strBoundData + '';
                        var classes = strBoundData.toLowerCase().split(' ');
                        var parent = elem.parent();
                        $.each(classes, function(i, c) { parent.addClass(c); });
                        break;
                    case 'function':
                        window[binder](boundData, elem, self);
                        break;
                    case 'id':
                        elem.attr('id', strBoundData ? strBoundData.toString().replace(/\s/g, '_').toLowerCase() : '');
                        break;
                    case 'margin-left':
                    case 'margin-top':
                    case 'margin-right':
                    case 'margin-bottom':
                        var fData = parseFloat(strBoundData);
                        elem.css(bindType, (fData * 100) + '%');
                        break;
                    case 'progressbarraw':
                        var fData = strBoundData == ""? 0: parseInt(strBoundData);
                        elem.attr('style', 'width:' + fData + '%;');
                        break;
                    case 'progressbar':
                        var fData = parseFloat(strBoundData);
                        elem.attr('style', 'width:' + fData * 100 + '%;');
                        break;
                    case 'progressbarshadedraw':
                        var fData = strBoundData == ""? 0:parseInt(strBoundData);
                        elem.removeClass();
                        elem.addClass('progress progress-bar-' + (fData <= 30 ? 'danger' : fData > 30 && fData <= 70 ? 'warning' : 'success'));
                        elem.attr('style', 'width:' + fData + '%;');
                        break;
                    case 'progressbarshaded':
                        var fData = strBoundData == ""? 0.0:parseFloat(strBoundData);
                        elem.removeClass();
                        elem.addClass('progress progress-bar-' + (fData <= 0.3 ? 'danger' : fData > 0.3 && fData <= 0.7 ? 'warning' : 'success'));
                        elem.attr('style', 'width:' + fData * 100 + '%;');
                        break;
                    case 'progressbarshadedlg':
                        var fData = strBoundData == ""? 0.0:parseFloat(strBoundData);
                        elem.removeClass();
                        elem.addClass('progress progress-lg progress-bar-' + (fData <= 0.3 ? 'danger' : fData > 0.3 && fData <= 0.7 ? 'warning' : 'success'));
                        elem.attr('style', 'width:' + fData * 100 + '%;');
                        break;
                    case 'progressbarshadedhg':
                        var fData = strBoundData == ""? 0.0:parseFloat(strBoundData);
                        elem.removeClass();
                        elem.addClass('progress progress-lg progress-hg progress-bar-' + (fData <= 0.3 ? 'danger' : fData > 0.3 && fData <= 0.7 ? 'warning' : 'success'));
                        elem.attr('style', 'width:' + fData * 100 + '%;');
                        break;
                    case 'progressbarshadedlgraw':
                        var fData = strBoundData == ""? 0.0:parseFloat(strBoundData);
                        elem.removeClass();
                        elem.addClass('progress progress-lg progress-bar-' + (fData <= 30 ? 'danger' : fData > 30 && fData <= 70 ? 'warning' : 'success'));
                        elem.attr('style', 'width:' + fData + '%;');
                        break;
                    case 'embeddedImage':
                        if (!strBoundData || strBoundData == '') {
                            //Show white space
                            //data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==
                            //elem.attr('src', 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==');
                            elem.remove();
                        } else {
                            elem.attr('src', strBoundData);
                        }
                        break;                   
					case 'htmlVideo':
                        if (!strBoundData || strBoundData == '') {
                            elem.remove();
                        } else {
                         if(elem.is('video')) {
							var srcTag = $('<source type="video/mp4">'); 
							srcTag.attr('src', strBoundData);
							elem.append(srcTag);
                         } else {
							var videoTag = $('<video width="100%" height="100%" controls="controls" autoplay="autoplay">');
							elem.append(videoTag);
							var srcTag = $('<source type="video/mp4">'); 
							srcTag.attr('src', strBoundData);
							videoTag.append(srcTag);
                         }
                        }
                        break;

                    case 'enabled':
                        strBoundData = (strBoundData + '').toLowerCase();
                        if(strBoundData == 'true') elem.removeAttr('disabled');
                        else elem.attr('disabled', 'disabled');
                        break;
                    case 'disabled':
                        strBoundData = (strBoundData + '').toLowerCase();
                        if(strBoundData == 'true') elem.attr('disabled', 'disabled');
                        else elem.removeAttr('disabled');
                        break;
                    case 'show':
                        strBoundData = (strBoundData + '').toLowerCase();
                        if(strBoundData == 'true') elem.show();
                        else elem.hide();
                        break;
                    case 'hide':
                        strBoundData = (strBoundData + '').toLowerCase();
                        if(strBoundData == 'true') elem.hide();
                        else elem.show();
                        break;
                    case 'remove':
                        elem.empty();
                        elem.remove();
                        break;
                    case 'remove-parent':
                        elem.parent().remove();
                        break;
                    case 'rowselector':
                        (function(){
                            var checkWrap = $('<div />').addClass ('checkbox'),
                            label = $('<label />'),
                            input = $('<input />').attr ('type', 'checkbox').addClass ('app'),
                            span = $('<span />').addClass ('lbl');
                            
                            input.appendTo (label);
                            span.appendTo (label);
                            label.appendTo (checkWrap);
                            elem.html ('');
                            checkWrap.appendTo (elem);
                            
                            input.on ('change', function (e){
								var tableElem = $(this).closest ('table');
                                var oGrid = tableElem.dataTable(),
                                toggleVisibleRows = function (checked) {
                                    var rows = oGrid.$('tr:visible');
                                    rows.find ('[data-bind-type="rowselector"] input[type="checkbox"]').prop ('checked', checked);
                                },
                                isHeader = elem.is ('th') ? true: false,
                                checked = this.checked,
                                activateGlobalActions = false;
                                
                                if (isHeader) {
									toggleVisibleRows (checked);
									activateGlobalActions = checked;
								}
                                else {
                                	activateGlobalActions = self.areRowsSelected(tableElem).any;
                                } 
                                
                                EventManager.raiseEvent ('rowSelected', self.widgetType, {currentTarget: elem[0], widgetinstance: self, checked : $(this).prop ('checked'), context: boundData});
                                EventManager.raiseEvent ('gridGlobalActions', $(self.target).attr ('widget-type'), {'activateGlobalActions': activateGlobalActions, 'currentTarget': elem[0], 'widgetinstance': self, 'context': boundData});
                            });
                            
                        }());
                        break;
                    case 'formvalue':
                        if(elem.is('select') && elem.attr('data-bind-select-options')) {
                            var optionsData = getDataFromIterate(elem.attr('data-bind-select-options'), boundData) || [];
                            var optionsKey = elem.attr('data-bind-options-key');
                            var optionsVal = elem.attr('data-bind-options-value');
							
                             elem.html(''); //TODO
                            if(optionsData && optionsData.length) {
								var loadOptions = true;
								if(self.dropdownThreshold) {
									loadOptions = optionsData.length < self.dropdownThreshold;
								}
								if(loadOptions) {
                                $.each(optionsData,function(key,value){
									
                                    elem.append($('<option>', { 
                                        value: getDataFromIterate(optionsKey, value),
                                        text : getDataFromIterate(optionsVal, value)
                                    }));
                                });                             
                            }
                        }
                        }
                        if (elem.is('[type="radio"]')) {
                        	if (typeof strBoundData === 'boolean') {
                        		elem.prop('checked', strBoundData);
                        	}
                        	else if (elem.val() == strBoundData) {
                        		elem.prop('checked', true);
                        	}
                        }
                        else if (elem.is('[type="checkbox"]')) {
                            tempData = strBoundData;
                            if ($.isArray(tempData)) {
                                elem.attr('bound-data-is-array', 'true');
                                if ($.inArray(elem.val(), tempData) > -1) { elem.prop('checked', true); }
                            } else { elem.prop('checked', strBoundData); }
                        }
                        else if (elem.is('select') && elem.attr('multiple')) {
                            tempData = strBoundData;
                            if ($.isArray(tempData)) {
                                $.each(tempData, function(i, val) {
                                    elem.find('option[value= "' + val + '"]').attr('selected', true);
                                });
                            }
                        }
                        else { elem.val(self.checkDateString(strBoundData)); }
                        elem[0].origOnChange = elem[0].onchange;
                        elem.change(function(eventObj) {
                        	if (self.shouldFireFormvalueChange)
                        		return;
                            self.dirty = true;
                            var source = $(eventObj.target || eventObj.srcElement),
                                context = source.data('context'),
                                dataBindProp = source.attr('data-bind'),
                                dataSubBindProp = source.attr('data-bind-sub'),
                                changedProp = self.widgetType + '.',
                                selectedVals,
                                actualBoundProperty=dataBindProp,
                                widgetName = null;
                            if (context && dataBindProp) {
                                var lastIndexOfDot = dataBindProp.lastIndexOf('.'); 
                                if(lastIndexOfDot > 0) {
                                    actualBoundProperty = dataBindProp.substring(lastIndexOfDot + 1);
                                    context = getDataFromIterate(dataBindProp.substring(0, lastIndexOfDot), context) || [];
                                }
                                if (dataSubBindProp != null && dataSubBindProp != '') {
                                    context = getDataFromIterate(dataSubBindProp, context);
                                    changedProp = dataSubBindProp + '.';
                                    widgetName = self.widgetType + '.';
                                }
                                if (elem.is('[type="checkbox"]')) {
                                    if (elem.attr('bound-data-is-array') == 'true') {
                                        selectedVals = new Array();
                                        $.each($("input:checkbox[data-bind='" + dataBindProp + "']:checked", $(target)), function() {
                                            selectedVals.push($(this).val());
                                        });
                                        context[actualBoundProperty] = selectedVals;
                                    } else { context[actualBoundProperty] = source.is(':checked'); }
                                }
                                else if (elem.is('[type="radio"]')) {
                                    var radioVal = ($('input:radio[name=' + elem.attr('name') + ']:checked', $(target)).val());
                                    if (radioVal == 'on') {
                                        //This is a group of radios that have no values, but goes by selected
                                        if($(this).is(":checked")) {
                                            //Need to manually trigger change on the rest to ensure the property is reset
                                            $('input:radio[name=' + elem.attr('name') + ']', $(target)).not($(this)).trigger('change');
                                            context[actualBoundProperty] = true;
                                        } else context[actualBoundProperty] = false;
                                    } else {
                                        context[actualBoundProperty] = $('input:radio[name=' + elem.attr('name') + ']:checked', $(target)).val();
                                    }
                                }
                                else {
									/* if(elem.is('select') && elem.attr('data-bind-select-options')){
                                 var selectedIndex = $(elem)[0].selectedIndex;
                                 var selectedOptionsData = getDataFromIterate(elem.attr('data-bind-select-options'), context) || [];
                                 if(selectedOptionsData.length > selectedIndex) selectedOptionsData[selectedIndex][actualBoundProperty] = true; 
                                 } */
                                    
                                    context[actualBoundProperty] = (typeof source.val() === 'string' ? $.trim (source.val()) : source.val());
                                }
                                if (typeof dataSubBindProp != 'undefined' && widgetName) {
                                   EventManager.onChange(widgetName + changedProp + dataBindProp, context[actualBoundProperty], self, elem);
                                   EventManager.onLocalChange(self.target, widgetName + changedProp + dataBindProp, context[actualBoundProperty], self, elem);                                 
                                }
                                else {
                                   EventManager.onChange(changedProp + dataBindProp, context[actualBoundProperty], self, elem); //Invoke global first
                                   EventManager.onLocalChange(self.target, changedProp + dataBindProp, context[actualBoundProperty], self, elem);
                                }
                            }
                            if (source[0].origOnChange) { source.origOnChange(eventObj); }
                            EventManager.raiseEvent('WidgetContextChanged', self.widgetType, context);
                            EventManager.raiseEvent('FormValueChanged', self.widgetType, { 'context': context, 'source': source, 'dataBindProp': dataBindProp, 'dataSubBindProp': dataSubBindProp, 'self': self });
                        });
                        break;
                    case 'sanitizedhtml':
                        //TODO: Sanitize
                        elem.html(strBoundData);
                        break;
                        
                    case 'filter':
                        (function(){
                            var filterElem = null,
                            filterElemID = 'ID_' + strBoundData + '_' + self.id + '_' + boundData.targetColumn;
                            switch (strBoundData) {
                                case 'SELECT': 
                                    // Type : Single <select />
                                    filterElem = renderSelectFilter (boundData, self, elem, false);
                                    break;
                                    
                                case 'MULTISELECT': 
                                    // Type : Multiple <select /> 
                                    filterElem = renderSelectFilter (boundData, self, elem, true);
                                    break;
                                
                                case 'TOGGLE': 
                                    // Type : Toggle Button (true/false)
                                    (function(){
                                        var toggle = $('<button />').addClass ('btn btn-default').css ('display', 'block').attr ('data-toggle', 'button').text (boundData.label);
                                        elem.html ('');
                                        toggle.appendTo (elem).on ('click', function (e){
                                            var _this = $(this);
                                            EventManager.raiseEvent('filterChanged', self.widgetType, {currentTarget: e.currentTarget, context: {val:  !_this.is ('.active'), text: _this.is ('.active')}, targets: boundData.targetColumn, filterType : boundData.filterType, widgetinstance: self});
                                        });
                                        filterElem = toggle;
                                    }());
                                    
                                    break;
                                    
                                case 'FREETEXT': 
                                    // Type : Toggle Button (true/false)
                                    (function(){
                                        var txtInput = $('<input />').addClass ('form-control').attr ('type', 'text');
                                        elem.html ('');
                                        txtInput.appendTo (elem).on ('keyup', function (e){
                                            var _this = $(this);
                                            EventManager.raiseEvent('filterChanged', self.widgetType, {currentTarget: e.currentTarget, context: {val:  _this.val(), text: _this.val()}, targets: boundData.targetColumn, filterType : boundData.filterType, widgetinstance: self});
                                        });
                                        filterElem = txtInput;
                                    }());
                                    
                                    break;
								
								case 'RANGE' : 
									//Type: Date Range 
									
									(function(){
										elem.html ('');
										var main_range_wrap = $('<ul />').addClass ('list-unstyled list-inline');
										var list_elem = $('<li />').appendTo (main_range_wrap);
										var sublist = $('<ul />').addClass ('list-unstyled list-inline date-range-filter').appendTo(list_elem);
										var rangeSelectorListItem = $('<li />').addClass ('no-padding-left').appendTo (sublist);
										var rangeInputListItem = $('<li />').appendTo (sublist);
										var resetBtnListItem = $('<li />').appendTo (sublist);
										var rangeSelectorDD = $('<select />');
										
										sublist.attr ('data-JSON_KEY', boundData.targetColumn);
										
										rangeSelectorDD.append ('<option value = "1">' + app.getLocalizedText ('framework.range.on_before', 'On or Before') + '</option>');
										rangeSelectorDD.append ('<option value = "2" selected = "selected">' + app.getLocalizedText ('framework.range.equal_to', 'Equal To') + '</option>');
										rangeSelectorDD.append ('<option value = "3">' + app.getLocalizedText ('framework.range.from', 'From') + '</option>');
										
										rangeSelectorListItem.append ('<label class = "bolder no-margin-bottom">' + boundData.label + '</label>');
										rangeSelectorDD.appendTo (rangeSelectorListItem);
										
										rangeInputListItem.append ('<label class = "hide-on-extend bolder no-margin-bottom">' + app.getLocalizedText ('framework.range.date', 'Date') + '</label>');
										rangeInputListItem.append ('<label class = "extender hidden bolder no-margin-bottom">' + app.getLocalizedText ('framework.range.from', 'From') + '</label>');
										rangeInputListItem.append ('<input type = "text" placeholder="mm/dd/yyyy" class = "form-control start-date range-filter-input inline-block" />');
										
										var extender = $('<div />').addClass ('extender hidden margin-top-5');
										extender.append ('<label class = "block bolder no-margin-bottom">' + app.getLocalizedText ('framework.range.to', 'To') + '</label>');
										extender.append ('<input disabled = "disabled" type = "text" placeholder="mm/dd/yyyy" class = "form-control end-date range-filter-input inline-block" />');
										extender.append ('<input data-shouldDisableFutureDates = "${disableFutureDates}" class="future-date-disable hidden" />');
										extender.appendTo (rangeInputListItem);
										
										resetBtnListItem.append ('<label class = "block" aria-hidden = "true" >&#160;</label>');
										resetBtnListItem.append ('<button class = "btn btn-secondary reset">' + app.getLocalizedText ('framework.reset', 'Reset') + '</button>');
										
										main_range_wrap.appendTo (elem);
										
										app.loadDateRangeComponent(self.bindData.widgetName);
										elem.prev().remove();
										filterElem = main_range_wrap;
										
									}());
                                    
                                default:
                                    //console.log ('got default');
                            }
                            
                            filterElem.attr ('id', filterElemID);
                            elem.prev().attr ('for', filterElemID);
                            elem.parent().addClass (filterElemID + '_wrapper');
			            }());
                        break;
                    
                    case 'setdefault':
                        strBoundData = self.checkDateString(strBoundData);
                        if (strBoundData == null || typeof strBoundData == 'undefined' || strBoundData == "") {
                        	(function() {
	                        	var defaultText = elem.data ('binddefault');
	                        	var transformType = elem.attr ('data-bind-transform');
	                        	if (typeof transformType === "string" && transformType.startsWith ('truncatetext')) {
	                        		 var transformTokens = transformType.split('::');
	                        		 if (transformTokens && transformTokens.length && !isNaN ( Number (transformTokens [1]))) {
	                        			 var trncLen = Number (transformTokens [1]);
	                        			 defaultText = defaultText.substr(0, trncLen) + (defaultText.length > trncLen ? '...' : '');
	                        		 }
	                        		 elem.attr ('title', elem.data ('binddefault'));
	                        	}
	                        	elem.text(defaultText);
                        	}());
                        }
                        else
                            elem.text (strBoundData);
                        break;
                    case 'localizedtext':
                        if (strBoundData)
                        {
                            try{
                            	var localized = app.getLocalizedText(strBoundData,strBoundData);
                                elem.text(localized);
                            }
                            catch(err){
                                elem.text(strBoundData);
                            }
                        }
                        else
                            elem.text(strBoundData);
                        break;
                    case 'smarttext':
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
                                if(!tableStart) {
                                    tmpBoundData.push('<table class="table table-striped table-bordered smart_table"><thead>');
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
                                        if(prevCol == '') tmpBoundData.push('<th style="text-align:center">&nbsp;</th>');
                                        colSpan++;
                                    }
                                    else {
                                        if(prevCol != '') tmpBoundData.push('<th style="text-align:center" colspan="', colSpan, '">', prevCol, '</th>');
                                        prevCol = col;
                                        colSpan = 1;
                                    }
                                });
                                tmpBoundData.push('<th style="text-align:center" colspan="', colSpan, '">', prevCol, '</th>');
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
                                    if($.isNumeric(col)) colStyle = " style='text-align:right; '";
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
                                    tmpBoundData.push('</tbody></table>');
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
                                                                                                                                                                                                        .htmlReplace( '{h6}', '<h6>', '</h6>')
                                        .htmlReplace( '^' ,'<sup>','</sup>');
                        
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
                        while(index != -1) {
                            var endIndex =  strBoundData.indexOf('{chart}', index + 1);
                            if(endIndex == -1) break;
                            var cLeft = strBoundData.substring(0, index);
                            var cRight = endIndex + 7 >= strBoundData.length?'': strBoundData.substring(endIndex + 7);
                            var chart = strBoundData.substring(index + 7, endIndex);
                            strBoundData =  cLeft + '<div class="smartchart_'  + charts.length + '">&#160;</div>' + cRight;
                            var chartObj = { 'chart': { 'animation':false }, 'series': [], 'colors': [], 'credits': {'enabled': false}, 'title': { 'text': null} };
                            charts.push(chartObj);
                            var defaultType = chart.substring('0', chart.indexOf('}'));
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
                            bkIndex = chart.indexOf('{x:title}');
                            if(bkIndex != -1) {
                                var xTitle = chart.substring(bkIndex + 9, chart.indexOf('{x}', bkIndex));
                                chartObj.xAxis = { 'title': {'text':xTitle}};
                            }
                            bkIndex = chart.indexOf('{y:title}');
                            if(bkIndex != -1) {
                                var yTitle = chart.substring(bkIndex + 9, chart.indexOf('{y}', bkIndex));
                                chartObj.yAxis = { 'title': {'text':yTitle}};
                            }
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
                                var seriesColorIndex = series.indexOf('{color:');
                                if(seriesColorIndex != -1) {
                                     var seriesColor = series.substring(seriesColorIndex + 7, series.indexOf('}', seriesColorIndex));
                                    var seriesColors = seriesColor.split(',');
                                    $.each(seriesColors, function(ff, sColor) { chartObj.colors.push(sColor); });
                                }
                                var xData = seriesDataFunc(series, '{x}');
                                var yData = seriesDataFunc(series, '{y}');
                                for(var j = 0; j < xData.length; j++) {
                                    var curXData = xData[j];
                                    if(!$.isNumeric(xData[j])) {
                                        if(chartObj.xAxis && chartObj.series.length == 1)
                                            chartObj.xAxis.categories = xData;
                                        if(chartObj.chart.defaultSeriesType != 'pie')
                                            curXData = j;
                                        else chartObj.plotOptions = {'pie':{'showInLegend':true}};
                                    }
                                    var curYData = j >= yData.length? 0: yData[j];
                                    seriesObj.data.push([curXData, curYData]);
                                }
                                seriesIndex = chart.indexOf('{series:');
                            }
                            //.replace(/(?!\B"[^"]*),(?![^"]*"\B)/g, '##@@##').split('##@@##').join('-'));
                            index = strBoundData.indexOf('{chart:');
                        }
                        
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
                                $('.smartchart_' + i, elem).highcharts(chart);
                            });
                        }
                        break;
                    case 'src':
                    	 elem.attr('src', strBoundData);
                        break;
                    default:
                        elem.text('');
                        var displayText = self.checkDateString(strBoundData);
                        var lines = displayText.split('\r\n');
                        $.each(lines, function(i, line) {
                            if (i > 0) elem.append('<br/>');
                            elem.append(document.createTextNode(line));
                        });
                        break;

                }
                elem.data('context', boundData);
                if (bindValidate) 
                    self.validate(strBoundData, boundData, bindValidate, elem);
            });
        },
        startHelp: function() {
            var instance = this;
            var helpElements = $("[widget-help]", this.target);
            if(helpElements.length == 0) return; 

            $("body").append($("<div>").css({
                position: "fixed"
                ,width: "100%"
                ,height: "100%"
                ,"background-color": "rgba(0,0,0,0.8)"
                ,"z-index": 9999
                ,top: 0
                ,left: 0
            }).attr("id", "widget_help_mask"));

            var currentIndex = 0;
            var mask = $("#widget_help_mask");
            var startElem = $(helpElements[currentIndex]);
            var oldZIndex = startElem.css("z-index");
            var oldPosition = startElem.css("position");
            startElem.css("position", "relative");
            startElem.css("z-index", 10000);
            
            $("body").append($("<div>").css({
                position: "fixed"
                ,width:"100%"
                ,height: "100%"
                ,"z-index": 10001
                ,top: 0
                ,left: 0                
            }).attr("id", "widget_help_overlay"));
            var overlay = $("#widget_help_overlay");
            
            overlay.append($("<div>").attr("id", "help-overlay-text").attr("class", "help-overlay-text"));
            var textElem = $("#help-overlay-text");
            overlay.append($("<button>").css({
                position: "relative",
                top: "90%",
                right: "300px"
            }).attr("id", "next_help_btn").attr("class","btn btn-primary pull-right margin-top-20").text("Next"));
            textElem.text(startElem.attr("widget-help"));
			textElem.css('position','absolute');
            textElem.css('top', (startElem.offset().top - 30) + 'px').css('left', startElem.offset().left + 'px');
			textElem.css('color','white').css('font-size','20px');
            $("#next_help_btn").click(function() {
                if(currentIndex >= helpElements.length) instance.endHelp();
                currentIndex++;
                startElem.css("z-index", oldZIndex);
                startElem.css("position", oldPosition);
                startElem = $(helpElements[currentIndex]);
                oldZIndex = startElem.css("z-index");
                oldPosition = startElem.css("position");
                startElem.css("z-index", 10000);
                startElem.css("position", "relative");
                textElem.text(startElem.attr("widget-help"));
                textElem.css({top: startElem.offset().top - 30, left: startElem.offset().left});
            });
        },
        endHelp: function() {
            $("#widget_help_mask").remove();
            $("#widget_help_overlay").remove();
        },
        validateAll : function(checkOnlyRequired) {
            var self = this,
            elements = $('[data-bind-validate]', self.target),
            requiredElements = null,
            qualifiesRequired = true;
            
            self.hasErrored = false;
            
            $.each (elements, function (elIndex, element){
                var el = $(element),
                triggerEvent = el.is ('input[type="text"]') || el.is ('textarea') ? 'focusout' : 'change';
                if (!el.attr ('data-bind-ignorevalidation'))
                	el.trigger(triggerEvent);
            });
            if (checkOnlyRequired) {
                requiredElements = $('[data-bind-validate="required"]', self.target);
                $.each (requiredElements, function (reqIndex, reqEl){
                    var reqFieldVal = $(reqEl).val();
                    if (reqFieldVal == '' || reqFieldVal == null || typeof reqFieldVal == 'undefined')
                        qualifiesRequired = false;
                    
                    if (!qualifiesRequired)
                        return false;
                });
                return qualifiesRequired;
            }
            
            
            return self.validationErrors;
        },
        validate: function(strBoundData, boundData, bindValidate, elem) {
            var self = this,
            triggerEvent = elem.is ('input[type="text"]') || elem.is ('textarea') ? 'focusout' : 'change';
			if(bindValidate.indexOf('remaininglength') != -1) triggerEvent = 'keyup';
            
            if(bindValidate == "maxlengthadminfields" || bindValidate == "maxlengthadmindescriptionfields" || bindValidate == "maxlengthcandidatefields"){
            	
            	if(jQuery.isEmptyObject(self.maxLengthMap)){
            		
            		var xhr = AjaxRequest.send(app.maxLengthPropertiesUrl, 'get', 'text/plain;charset=UTF-8', 'text', null, null, null, null, false, false);
            		xhr.success (function (data){
        	 			var parameters = data.split( /\n/ );
	       	 			 for(var i=0; i<parameters.length; i++ ) {
	       	 				 if(parameters[i].length > 0 && parameters[i].match('^#')!='#') {
	       	 					var pair = parameters[i].split('=');
	       	 					if(pair.length > 0) {
	       	 						var name = unescape(pair[0]).replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' );
	       	 						var value = pair.length == 1 ? '' : pair[1];
	       	 						self.maxLengthMap[name] = value;
	       	 					}
	       	 				 }
	       	 			 }
            		});
            	}
            	
            	var nativeElem = elem[0];
            	if(typeof nativeElem.maxLength === 'number'){
            		elem.attr('maxlength',self.maxLengthMap[bindValidate]);
            	} else {
            		// Code for old browsers
					elem.on("keyup", function(event){
        	            var key = event.which;
        	      if( key == 8 || key == 46 ){
        	                var maxLength = self.maxLengthMap[bindValidate];
        	                var length = this.value.length;
        	                if(length >= maxLength) {                     
        	                    event.preventDefault();
        	                }
							}
        	       });
				   
            		elem.on("keypress", function(event){
        	            var key = event.which;
        	            if(key >= 33 || key == 13 || key == 32) {
        	                var maxLength = self.maxLengthMap[bindValidate];
        	                var length = this.value.length;
        	                if(length >= maxLength) {                     
        	                    event.preventDefault();
        	                }
        	            }
        	       });
	        		elem.on("paste", function(event){
	        			setTimeout(function() {
			                var maxLength = self.maxLengthMap[bindValidate];
			                var length = elem.val().length;
			                if(length >= maxLength) {                     
			                    elem.val(elem.val().slice(0, maxLength));
			                }
	        			 }, 100);
	    	        });
            	}
            }
            else {
	            elem.on (triggerEvent, function (e) {
                      var $this = $(this),
                      value = $this.val(),
                      elem_id = $this.attr ('id');
                      if(elem_id == null || elem_id == '') {
                        elem_id = '_' + new Date().getTime();
                        $this.attr('id', elem_id);
                      }

	                var isFormGroup = elem.parents('.input-group').length ? true: false,
	                errLabel = $('<label />').attr ('for', elem_id).addClass ('error margin-top-10'),
	                prevLabel = $('label.error[for="' + elem_id + '"]'),
	                RETURN_OBJ = '',
	                ERR_OBJ = {
	                    hasErrored : false,
	                    error : '',
	                    shouldRenderError : true
	                },
	                bindValidate = $this.attr ('data-bind-validate'),
	                validations = (bindValidate && typeof bindValidate === 'string') ? bindValidate.split ('|') : [],
	                isTriggerByHuman = e.originalEvent ? true : false;
	                
	                if (typeof value === 'string')
	                    value = value.trim();
	                
	                prevLabel.remove();
	                
	                if (validations.length) {
	                    for (var valIndex = 0; valIndex < validations.length; valIndex++) {
	                        var t_validation = validations [valIndex];
	                        t_validation = t_validation.trim();
	                        t_validation = t_validation.toLowerCase();
	                        
	                        if (t_validation.indexOf ("::") != -1) {
	                            var v_split = t_validation.split ("::");
	                            RETURN_OBJ = runValidations (validations, isTriggerByHuman, self, v_split[0], ERR_OBJ, value, v_split[1]);
	                        } 
	                        else RETURN_OBJ = runValidations (validations, isTriggerByHuman, self, t_validation, ERR_OBJ, value);
	                        
	                        if (RETURN_OBJ.hasErrored) // Stop Validations
	                            break;
	                    } 
	                }
					
					if(ERR_OBJ.preventDefault) 					
					e.preventDefault();
				
	                if (RETURN_OBJ.hasErrored && RETURN_OBJ.shouldRenderError){
	                    errLabel.text (RETURN_OBJ.error);
	                    if (elem.siblings ('.ceb-dropdown-container').length) {
	                    	elem.siblings ('.ceb-dropdown-container').after (errLabel);
	                    }
	                    else {
	                    	 isFormGroup ? elem.parent().after(errLabel) : elem.after (errLabel);
	                    }
	                   
	                    errLabel.css ('display', 'block');
	                }
	                if (RETURN_OBJ.hasErrored)
	                	self.hasErrored = RETURN_OBJ.hasErrored;
	                
	                if ($.inArray (RETURN_OBJ.error, self.validationErrors) == -1)
	                    self.validationErrors.push (RETURN_OBJ.error);
	                
	                
	                if (!self.validationElements.length)
	                    self.validationElements.push (elem);
	                else {
	                    (function(){
	                        var _foundEl = false;
	                        for (var valElIndex = 0; valElIndex < self.validationElements.length; valElIndex++) {
	                            if ($(self.validationElements[valElIndex]).is (elem)) {
	                                
	                                _foundEl = true;
	                            }
	                            if (_foundEl)
	                                break;
	                        }
	                        if (!_foundEl)
	                            self.validationElements.push (elem); 
	                        }
	                    ());
	                }
	            });
            }
        },
        //Bind method version 2
        bind2: function(data, instance, rawData, appendData, customTarget) {
            var self = instance || this,
            dataBindIterate;

            data = data || self.bindData || [];
            
            if(!customTarget && self.saveOriginalData)
            	self.originalData = $.extend(true, {}, data);
            
            //If we need to append the data, then we need not call render as the model would already be rendered in the target.
            //TODO: Validate if this logic would ever be required
            if (!appendData) {
                self.render(null, self);
                self.bindData = data;
            }

            var targetElement = customTarget || self.target;
            var startElement = $(targetElement);
            var walkTree = function(node, callback, context, curIndex) {
                node = $(node);
                var newContext = callback(node, context, curIndex); //Callback can change the context
                if(newContext ) context = newContext;
                var walkChildren = function(parentNode, parentContext, currentIndex) {
                    var children = parentNode.children();
                    $.each(children, function(i, child) {
                        walkTree(child, callback, parentContext, currentIndex);
                    });
                };
                var iterate = node.attr('data-bind-iterate');
                var iterateLimit = node.attr('iterate-limit');
                var inline = node.attr('iterate-in-line');
                var iterateForTable = customTarget?null: node.attr('data-bind-iterate-for-table');
                if (iterate) {
                    var dataList = getDataFromIterate(iterate, context) || [];
                    //TODO: Check to ensure data list is an array
                    if (!dataList || ($.isArray(dataList) && !dataList[0])) {
                        node.remove();
                    }
                    else {
                        var parent = node.parent();
                        var clonedNode = node.clone();
                        var lastNode = node;
                        $.each(dataList, function(i, itrData) {
                            if(iterateLimit && i > iterateLimit) return false;
                            var childClonedNode = node;
                            if (i > 0) {
                                childClonedNode = clonedNode.clone();
                                childClonedNode.attr('data-bind-iterate', '');
                                if(inline) {
                                    childClonedNode.insertAfter(lastNode);
                                    lastNode = childClonedNode;
                                }
                                else parent.append(childClonedNode);
                            }
                            walkChildren(childClonedNode, itrData, i);
                        });
                    }
                } else if(!iterateForTable) {
                    walkChildren(node, context, 0);
                }
            };

            walkTree(startElement, function(node, currentData, currentIndex) {
                node.data('context', currentData);
                if (node.attr('data-bind')) {
                    self.dataBinder(self, self.target, currentData, false, node, currentIndex);
                    if(node.attr('data-context'))
                        return getDataFromIterate(node.attr('data-context'), currentData);
                    return null;
                }
            }, data, 0);
            if(!customTarget) {
                self.bindWidgetDataEvent(targetElement, self);

                //If custom target is passed, we cannot invoke
                //custom bind or the change handlers
                if (self.customBind) {
                    self.customBind(data, self);
                }
               /* if (self.poll && self.pageNumber == 0) {
                    self.polling();
                }*/
                
                registerChangeHandlers(self.target);
    
                EventManager.raiseEvent('DataBound', self.widgetType, self);
                
                if(typeof app != 'undefined' && app != null) {
	                if (typeof app.enableAccessibilty == 'function') {
	                    app.enableAccessibilty (self.target);
	                }
                }
            }

        },
        
        bindWidgetDataEvent: function(targetElement, self) {
            $('[widget-data-event]', targetElement).each(function(i, ele) {
                try {
                    var ets = $(this).attr('widget-data-event');
                    var et = ets.split('::');
                    if (et[0] && et[1] && et[0] !== et[1]) {
                        $(this).data('widget-name', self.widgetType);
                        $(this).unbind(et[0]);
                        $(this).bind(et[0], function(event) {
                            var cont = $(ele).data('context');
                            var attr = { type: et[1], 'context': cont, 'currentTarget': ele, 'widgetinstance': self };
                            var widgetType = $(self.target).attr ('widget-type');
                            var preventDefault = EventManager.raiseEvent(et[1], widgetType, attr);
                            if (preventDefault) {
                                event.preventDefault();
                                event.stopImmediatePropagation();
                                return false;
                            }
                                
                        });
                    }
                } catch(error) {
                    //TODO: log the error
                }
            //$(this).removeAttr('widget-data-event');
        });
        },

        /// Binds the control to the data
        /// This method always ignores rawData and this is in place for semantics only. The fetch method invokes the callback
        /// with the rawData as 3rd param
        bind: function(data, instance, rawData, appendData, prependDOM) {

            var self = instance || this,
                dataBindIterate;

            var dataBindVersion = self.target.attr('data-bind-version');
            if (dataBindVersion && dataBindVersion == 2) return self.bind2(data, instance, rawData, appendData);

            data = data || self.bindData || [];
            //If we need to append the data, then we need not call render as the model would already be rendered in the target.
            //TODO: Validate if this logic would ever be required
            if (!appendData) {
                self.render(null, self);
                self.bindData = data;
            }
            dataBindIterate = $('[data-bind-iterate][data-bind-iterate!=\"\"]', $(self.target));
            //Check if bindData is an array, if not, we dont need to return.
            //Multi level data support -  e.g. if the array data is one/many level down in the JSON var
            //Check that element has attribute then make sure it's equal to something


            self.dataBinder(self, self.target, data, true);
            if ($.isArray(data) && !data[0]) {
                dataBindIterate.remove();
                self.customBind(data, self);
                $('.no-context', self.target).show();
                 $('[widget-data-event]', self.target).each(function(i, ele) {
                    try {
                        var ets = $(this).attr('widget-data-event');
                        var et = ets.split('::');
                        if (et[0] && et[1] && et[0] !== et[1]) {
                            $(this).data('widget-name', self.widgetType);
                            $(this).unbind(et[0]);
                            $(this).bind(et[0], function(event) {
                                var cont = $(ele).data('context');
                                var attr = { type: et[1], 'context': cont, 'currentTarget': ele, 'widgetinstance': self };
                                EventManager.raiseEvent(et[1], self.widgetType, attr);
                            });
                        }
                        $(this).removeAttr('widget-data-event');
                    } catch(error) {
                        //TODO: Log the error
                    }
                 });                
                return;
            }

            $.each(dataBindIterate.length == 0 ? self.target : dataBindIterate, function(i, curElement) {
                curElement = $(curElement);

                var property = curElement.attr('data-bind-iterate') || '.',
                    dataList = property == '.' ? data : data[property],
                    iterateLimit = parseInt(curElement.attr('iterate-limit') || '0', 10) - 1,
                    bindRecursive = $('[data-bind-iterate-recursive]', curElement);
                //Adding support to data at any level,  data-bind-iterate property can be set to 'levelone.leveltwo.levelthree.infinity'
                dataList = getDataFromIterate(property, data) || [];

                //FIXME: Remove current element when dataList has no entries
                if (!dataList || dataList.length == 0) {
                    curElement.remove();
                }
                $.each(dataList, function(j, boundData) {
                    var curTarget = curElement,
                        curTargetRecursive,
                        bindElement,
                        binderKey,
                        recursiveToInner,
                        clonedBindElement,
                        recursiveBind,
                        i;
                    if ((j > 0 || appendData) && dataBindIterate.length) {
                        curTarget = curElement.clone();
                        // RemoveAttr() not working for IE7 so we must set to empty instead of removing
                        curTarget.attr('data-bind-iterate', '').attr('iterate-limit', '');
                        var widgetHelps = $("[widget-help]", curTarget);
                        $.each(widgetHelps, function(jjj, widgetHelp) {
                            $(widgetHelp).removeAttr("widget-help");
                        });

                        if (prependDOM) {
                            curElement.parent().prepend(curTarget);
                        } else {
                            curElement.parent().append(curTarget);
                        }
                    }
                    curTarget.data('context', boundData);
                    self.dataBinder(self, curTarget, boundData);

                    bindRecursive = $('[data-bind-iterate-recursive]', curTarget);
                    if (bindRecursive.length) {

                        for (i = 0; i < bindRecursive.length; i++) {
                            bindElement = bindRecursive[i];
                            bindElement = $(bindElement);
                            binderKey = bindElement.attr('data-bind-iterate-recursive');
                            recursiveToInner = bindElement.attr('recursive-inner') == 'true';
                            if (binderKey != '') {
                                clonedBindElement = bindElement.clone();
                                recursiveBind = function(workData, workElement) {
                                    var data = getDataFromIterate(binderKey, workData) || [],
                                        k,
                                        item,
                                        nextWorkElement;
                                    if (data.length == 0) { workElement.remove(); }
                                    for (k = 0; k < data.length; k++) {
                                        item = data[k];

                                        if (k > 0) {
                                            curTargetRecursive = clonedBindElement.clone();
                                            curTargetRecursive.show();
                                            // RemoveAttr() not working for IE7 so we must set to empty instead of removing
                                            curTargetRecursive.attr('data-bind-iterate-recursive', '').attr('iterate-limit', '').data('context', workData);
                                            //bindElement.attr("data-bind-iterate-recursive", "");
                                            workElement.parent().append(curTargetRecursive);


                                        } else {
                                            curTargetRecursive = workElement;
                                            curTargetRecursive.data('context', workData);
                                        }
                                        self.dataBinder(self, curTargetRecursive, item);
                                        nextWorkElement = clonedBindElement.clone();
                                        if (recursiveToInner) { curTargetRecursive.children().first().append(nextWorkElement); }
                                        else { curTargetRecursive.append(nextWorkElement); }
                                        recursiveBind(item, nextWorkElement);
                                    }
                                };
                                recursiveBind(boundData, bindElement);
                            }
                        }

                        $.each($('[data-bind-iterate-recursive]', curTarget), function(l, item) {
                            if (!$(item).data('context')) { $(item).hide(); }
                        });
                    }
                    return iterateLimit < 0 || j < iterateLimit;
                });

                return dataBindIterate.length > 0;
            });

            $('[widget-data-event]', self.target).each(function(i, ele) {
                try {
                    var ets = $(this).attr('widget-data-event');
                    var et = ets.split('::');
                    if (et[0] && et[1] && et[0] !== et[1]) {
                        $(this).data('widget-name', self.widgetType);
                        $(this).unbind(et[0]);
                        $(this).bind(et[0], function(event) {
                            var cont = $(ele).data('context');
                            var attr = { type: et[1], 'context': cont, 'currentTarget': ele, 'widgetinstance': self };
                            EventManager.raiseEvent(et[1], self.widgetType, attr);
                        });
                    }
                    $(this).removeAttr('widget-data-event');
                } catch(error) {
                    //TODO: Log the error
                }
            });

            if (self.customBind) {
                self.customBind(data, self);
            }

            EventManager.raiseEvent('DataBound', self.widgetType, self);
            
            if (typeof app.enableAccessibilty == 'function') {
                app.enableAccessibilty (self.target);
            }
            
        },

        setIsLoading: function(val, instance) {
            (instance || this).isLoading = val;
			var target = $(instance.target);
			var hasTcLoader = $(instance.loaderClassName).length;
            if (val) {
				if (hasTcLoader) {
					target.css ('visibility', 'hidden');
					target.prev (instance.loaderClassName).show();
				}
				else {
					$('.commonloadingicon', target).show();
					$('.commonloadingicon', target).siblings().addClass('widget-visually-hidden');
					target.addClass('position-relative');
				}
            } else {
                //Hide Loading icon
				if (hasTcLoader) {
					if (target.css ('visibility') === 'hidden')
						target.css({opacity: 0.0, visibility: "visible"}).animate({opacity: 1.0}, 500);
					target.prev (instance.loaderClassName).hide();
					target.css ('visibility', 'visible');
				}
				else {
					//Hide Loading icon
					$('.commonloadingicon', target).hide();
					$('.commonloadingicon', target).siblings().removeClass('widget-visually-hidden');
					target.removeClass('position-relative');
					
					if (target.css ('visibility') === 'hidden')
						target.css({opacity: 0.0, visibility: "visible"}).animate({opacity: 1.0}, 500);
				}
            }
        },

        //Mayank - Function to convert date to mm/dd/yyyy (For DB)
        convertDateForServer: function(dateString, format){
        	var date = {
        			day: "",
        			month: "",
        			year: ""
        	};
        	if (dateString.indexOf('/Date') == -1) { 
    	    	date = typeof app == "object" && typeof app.extractDate == "function" ? app.extractDate(format, dateString) : "";
        	}
        	else{
        		var dateRec = new Date();
        		dateRec.setTime(dateString.replace('/Date(', '').replace(')/', ''));
                date = {
                	day: ("0" + dateRec.getDate()).slice(-2),
                	month: ("0" + (dateRec.getMonth() + 1)).slice(-2),
                	year: dateRec.getFullYear()
                };
        	}
    		return date != "" ? (date.month + "/" + date.day + "/" + date.year) : dateString;
        },
        
        checkDateString: function(str) {
            if (str == null) {
                return '';
            }
            str = str + '';
            if (str.indexOf('/Date') != -1) {
                var date = new Date();
                date.setTime(str.replace('/Date(', '').replace(')/', ''));
                //return dateFunctions.inline(date, dateFormats.normal);
                //return date.toUTCString();
				// Update: Date Localization | Init df_global (decalred in app.js) variable with Date Format based on Locale 
                
                //console.log(changeTimeZone(date.getTime(), dbTime));
                date = new Date(changeTimeZone(date.getTime(), dbTime));
                
                var dateToReturn = {
                	day: ("0" + date.getDate()).slice(-2),
                	month: ("0" + (date.getMonth() + 1)).slice(-2),
                	year: date.getFullYear()
                },
                /*getDelimeter = function(format){
        			var s = "abcdefghijklmnopqrstuvwxyz";
        			for(var i = 0; i<format.length; i++){
        				if(s.indexOf(format.charAt(i)) == -1)
        					return format.charAt(i);
        			}
        		},*/
				isDfdValid = typeof df_global != "undefined" && typeof df_global == 'string',
        		delimeter = isDfdValid && typeof app == "object" && typeof app.getDelimeter == "function" ? app.getDelimeter(df_global): "-",
        		dateFormat = isDfdValid ? df_global.toLowerCase().split(delimeter) : ["mm", "dd", "yyyy"],
        		toReturn = "";
        		for(var i = 0; i < dateFormat.length; i++){
        			if(dateFormat[i] == "dd"){
        				toReturn += (i < 2) ? dateToReturn.day + delimeter : dateToReturn.day;
        			}
        			else if(dateFormat[i] == "mm"){
        				toReturn += (i < 2) ? dateToReturn.month + delimeter : dateToReturn.month;
        			}
        			else{
        				toReturn += (i < 2) ? dateToReturn.year + delimeter : dateToReturn.year;
        			}
        		}
        		return toReturn;
                //return ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2) + '-' + date.getFullYear();
                //return date.format(dateFormat.masks.shortDate);
            }
            return str;
        },
        checkDateStringUTC: function(str) {
            if (str == null) {
                return '';
            }
            str = str + '';
            if (str.indexOf('/Date') != -1) {
                var date = new Date();
                date.setTime(str.replace('/Date(', '').replace(')/', ''));
                //return dateFunctions.inlineUTC(date, dateFormats.normal);
                return date.toUTCString();
            }
            return str;
        },
        /// Fetches data from the specified URI. If URI is blank, fetch would load from dataURI property
        /// httpType - GET, POST, etc.
        /// params - Key-Value pair of params to be passed to the server. if null or then dataLoadParams are passed.
        /// callback - This would be invoked in case of success or failure. If it is not passed bind is invoked.
        /// The callback function is expected to receive 3 arguments callback(data, iserror, errorThrown).
        /// cachedData would be the cached data which was already fetched. The widgets only request for updates to the data
        /// and the updated data would be merged with the cached data.
        /// requireRawData - this parameter specifies that the callback has to be invoked with the raw data.
        /// If this is set to true, then the callback has to be specified
        fetch: function(httpType, URI, params, callback, requireRawData, doNoSetAsOf, mergeProperty, hideLoading, customErrorCallback) {
            //TODO: Grouping of similar requests. HTTP allows only 2 requests per website
            //TODO: Hook into HTML5 capabilities.

            if (this.fetchTimeout) { clearTimeout(this.fetchTimeout); }


            var self = this,
            uri = URI || self.dataURI,
            cacheKey, cachedData, cachedObj, successCallback, errorCallback, anyMatchingRequests,
            prevIndex,
            tmp,
            xdrFrame;

            if (!uri) {
                //Logger.info("Ignoring a widget's call to update since there is no URI set");
                return;
            }
            params = params || self.dataLoadParams;
            //Deep cloning so that any params set here will not affect in the future
            tmp = {};
            for (var prop in params) { tmp[prop] = params[prop]; }
            params = tmp;

            cacheKey = uri + '?';
            $.each(params || [], function(key) { cacheKey += key + '=' + params[key] + ';'; });
            cachedData = self.bindData;

            /// Here is how the data merging works -
            ///     If the widget supports delta, then a delta request is made to get data from the last updated timestamp
            ///     If the widget does not support delta or if the server sends all the data by setting IgnoreLocalCache flag, then the server data is used
            ///     While merging the data with the local cached data, the data is always appended to end. If the data needs to be added to the top, the server
            ///     should return ShouldPrependData as true.
            ///     The merged data is cached if the server specifies that the item could be cached using the CacheExpiry flag.
            successCallback = function(dataReceived) {
                var data = cachedData || [],
                config_error = app.getLocalizedText('framework.config.error', 'Configuration error. Callback needs to be specified when requiring raw data');

                //Logger.debug("Data received for URI - " + uri);
                if (requireRawData == true) {
                    if (!callback) { alert(config_error); }
                    self.setIsLoading(false, self);
                    callback(dataReceived, self);
                    return;
                }
                if (dataReceived.IsError) {
                    if (self.handleFetchErrors) {
                        self.handleFetchErrors(self, dataReceived.ErrorMessage);
                    }
                    self.setIsLoading(false, self);
                    return;
                } else if (dataReceived.IgnoreLocalCache || !cachedData) {
                    data = dataReceived.Data;
                } else {
                    if (!self.mergeCallback(data, dataReceived.Data, dataReceived.ShouldPrependData, mergeProperty)) {
                        $.each(dataReceived.Data || [], function(i, tmpData) {
                            if (dataReceived.ShouldPrependData) {
                                data.splice(i, 0, tmpData);
                            } else {
                                data.push(tmpData);
                            }
                        });
                    }
                }

                if (typeof dataReceived.Data != 'undefined' && dataReceived.Data != null && !checkIfDataEmpty(dataReceived.Data)) {
                    self.lastUpdated = new Date();
                }
                self.currentRequest = null;
                if (typeof callback != 'undefined') {
                    self.setIsLoading(false, self);
                }
                (callback || self.bind)(data, self, dataReceived.Data);
            };
            errorCallback = function(jqXR, textStatus, errorThrown) {
                //Logger.error("Error while requesting data from server for URI " + uri + " :- " + textStatus);
				if (jqXR.readyState == 4) { //Ensure the failure is not because of incomplete response download
					self.currentRequest = null;
					if (customErrorCallback) customErrorCallback(self, textStatus, errorThrown);
					else if (self.handleFetchErrors) {
						self.handleFetchErrors(self, textStatus, errorThrown);
					}
					self.setIsLoading(false, self);
				}
            };

            //Cancel any previous running requests... All we have to do is remove the callbacks from the callback queue
            if (window.currentRequests && this.currentRequest && this.xhrCallbacks && window.currentRequests[this.currentRequest]) {
                prevIndex = $.inArray(this.xhrCallbacks, window.currentRequests[this.currentRequest]);
                if (prevIndex >= 0) {
                    window.currentRequests[this.currentRequest].splice(prevIndex, 1);
                }
            }

            xdrFrame = getXDRFrame(uri);

            if (!xdrFrame) {
                //This could happen if the frame is still not loaded
                //TODO: When we support cross domain requests, we need to uncomment below
                //alert('Unable to complete the action. Please clear your browser cache and try again.');
                //return;
            }

            /// If one widget is already making a request, other widgets need not make the request again. Instead
            /// we would hook up the callbacks to the exiting requests...
            anyMatchingRequests = false;
            if (!window.currentRequests) {
                window.currentRequests = [];
            }
            if (!window.currentRequests[cacheKey]) {
                window.currentRequests[cacheKey] = [];
            } else {
                anyMatchingRequests = true;
            }

            this.xhrCallbacks = { 's': successCallback, 'e': errorCallback };
            window.currentRequests[cacheKey].push(this.xhrCallbacks);
            this.currentRequest = cacheKey;
            if (!hideLoading) this.setIsLoading(true, this);
            if (anyMatchingRequests) {
                return;
            }

            //Logger.debug("Loading data from URI - " + URI);

            //this.currentRequest = cacheKey;
            (xdrFrame ? (xdrFrame.contentWindow || xdrFrame.document) : $).ajax({
                url: uri,
                type: httpType,
                data: JSON.stringify(params),
                dataType: requireRawData == true ? null : 'json',
                contentType: 'application/json; charset=utf-8',
                beforeSend: function(request){
                    var token = $("meta[name='_csrf']").attr("content");
                    var header = $("meta[name='_csrf_header']").attr("content");
                    if(token && header)
                        request.setRequestHeader(header, token);
                },
                success: function(dataReceived) {
                    $.each(window.currentRequests[cacheKey] || [], function(i, cb) {
                        cb.s(dataReceived);
                    });
                    delete window.currentRequests[cacheKey];
                    self.retryCount = 0;
                },
                error: function(jqXR, textStatus, errorThrown) {
                    $.each(window.currentRequests[cacheKey] || [], function(i, cb) {
                        cb.e(jqXR, textStatus, errorThrown);
                    });
                    delete window.currentRequests[cacheKey];
                    self.retryCount++;
                    if (self.interval != null && self.retryCount >= self.retryCountMax) {
                        //Logger.error("clearing interval after multiple retries");
                        clearInterval(self.interval);
                    }
                }
            });
        },
        
        generateGrid: function(instance, tableElement, data, columnKeys, 
                columnDefs, sorting, autoWidth, saveState, notResponsive,searching, gridDrawCallback, sDom) {
			var dataTableElement = tableElement?$(tableElement): instance.target;
            var tmpTemplateRow = $('tr[data-bind-iterate-for-table]', dataTableElement);
            if(!tmpTemplateRow){
				dataTableElement = instance.target;
				tmpTemplateRow = $('tr[data-bind-iterate-for-table]', instance.target);
			}
            var breakpointDefinition = {
            	    tablet: 1024,
            	    phone : 480,
            	    xtralarge: 1800,
            	    desktop: 1440
            	  
            	};
            var bSort = true;
            var sDom = typeof sDom === 'string' ? sDom : "<'row'<'col-sm-6'l><'col-sm-6'f>r>t<'row'<'col-sm-6'i><'col-sm-6'p>>";
            if (typeof sorting == "boolean" && sorting == false) {//when sorting=[], enable sorting but no inital sort 
            	bSort = false;
            	sorting = [];
            }
            return tableElement.dataTable({
            	'sDom': sDom,
                bDeferRender: true,
                'aaData':data,
                'bSort' : bSort,
                'aoColumnKeys': columnKeys,
                'aoColumnDefs': columnDefs,
                'aaSorting': sorting,
                sPaginationType: 'bootstrap',
                "aLengthMenu": [ 10, 25, 50, 100, 500 ],
                oLanguage: {
                    sLengthMenu: 
                        '_MENU_' + app.getLocalizedText('framework.records_per_page', 'records per page'),
                    sEmptyTable:
                        app.getLocalizedText('framework.datatable_empty', 'No data available in table'),
                    sZeroRecords:
                        app.getLocalizedText('framework.datatable_zero_records', 'No matching records found '),
                    sSearch: 
                        app.getLocalizedText('framework.datatable_search', 'Search:'),
                    sInfo: 
                        app.getLocalizedText('framework.Showing_entries_1', 'Showing') + ' _START_ ' + app.getLocalizedText('framework.Showing_entries_2', 'to') + ' _END_ ' + app.getLocalizedText('framework.Showing_entries_3', 'of') + ' _TOTAL_ ' + app.getLocalizedText('framework.Showing_entries_4', 'entries'),
                    sInfoEmpty:
                        app.getLocalizedText('framework.Showing_0_entries', 'Showing 0 to 0 of 0 entries'),
                    sInfoFiltered:
                        app.getLocalizedText('framework.filtered_total_entries_1', '(filtered from') + ' _MAX_ ' + app.getLocalizedText('framework.filtered_total_entries_2', 'total entries)')
                },
                "oSearch": {"sSearch": searching},
                bStateSave: saveState,
                bAutoWidth: autoWidth,
                fnPreDrawCallback: function(oSettings ) {
                    // Initialize the responsive datatables helper once.
                    if (!this.data('responsiveHelper') && !notResponsive) {
                        var responsiveHelper = new ResponsiveDatatablesHelper(this, breakpointDefinition);
                        responsiveHelper.setWindowsResizeHandler(true);
                        this.data('responsiveHelper', responsiveHelper);
                    }
                },
                fnRowCallback: function(nRow) {
                    if(!notResponsive) {
                        this.data('responsiveHelper').createExpandIcon(nRow);
                       // this.data('responsiveHelper').respond();
                    }
                },
                fnDrawCallback: function(oSettings) {
                	
                	if ($('th[data-bind-type="rowselector"]', dataTableElement).length){
                		$('#header-row-selector', dataTableElement).find ('input[type="checkbox"]').prop ('checked', instance.areRowsSelected(dataTableElement).all);
                		EventManager.raiseEvent ('gridGlobalActions', instance.widgetType, {activateGlobalActions: instance.areRowsSelected(dataTableElement).any, widgetinstance: instance});
                	}
                    if(!notResponsive) {
                    	this.data ('responsiveHelper').respond();
                    }
                        
                    if (typeof gridDrawCallback == 'function')
                        gridDrawCallback ();
                },
                fnCreatedRow: function(row, rData, dataIndex) {
                    if (data==null) return;	//When no data passed to datatable and trying to use the data from HTML DOM
                    var templateRow = tmpTemplateRow.clone();
                    instance.bind2(data[dataIndex], instance, data[dataIndex], true, templateRow);
                    var $row = $(row);
                    $row.html('');
                    $row.data('context', rData);
                    //var newTds = $('td', $(row));
                    $.each($('td', templateRow), function(i, td) {
                        //$(newTds[i]).html($(td).html()).attr('class', $(td).attr('class'));
                        $row.append($(td).clone(true, true));
                    });
                    instance.bindWidgetDataEvent($row, instance);
                    if(!notResponsive) {
                        var tableDT = $(this).dataTable();
                        columnsHiddenIndexes = tableDT.data ('responsiveHelper').columnsHiddenIndexes;
                        if (columnsHiddenIndexes && columnsHiddenIndexes.length) {
                             var colsToRemove = []
                             for (var i = 0, iLen = columnsHiddenIndexes.length; i < iLen; i++) {
                                  colsToRemove.push($row.find ('td:eq(' + columnsHiddenIndexes [i] + ')')); 
                             }
                             $.each(colsToRemove, function(i, e){e.remove();});
                        }
                   }

                },
                fnInitComplete: function(oSettings, json) {
                   var dtLenWrap = $(oSettings.nTableWrapper).find ('.dataTables_length');
                   var cebDDElem = dtLenWrap.find ('select');
                   cebDDElem.cebdropdown ({buttonWidth: '85px'});
                   dtLenWrap.find ('.ceb-dropdown-container').addClass ('margin-right-third'); 
                }
            });
        }

    });

    CEBWidget.beforeReadyCallbacks = [];
    CEBWidget.beforeReady = function(callback) {
        if (CEBWidget.readyFired) { callback.call(this); }
        else { CEBWidget.beforeReadyCallbacks.push(callback); }
    };

    
    CEBWidget.readyCallbacks = [];
    CEBWidget.ready = function(callback) {
        if (CEBWidget.readyFired) { callback.call(this); }
        else { CEBWidget.readyCallbacks.push(callback); }
    };

    CEBWidget.ready(function() {
        loadCEBWidgets();
        //Logger.setLogMessageTarget($(".log_section"));
    });
    
    CEBWidget.fireBeforeReady = function() {
        if(CEBWidget.readyFired) return;
        $.each(CEBWidget.beforeReadyCallbacks, function(i, cb) {
            cb.call(this);
        });
        CEBWidget.beforeReadyCallbacks = [];
    };

    CEBWidget.fireReady = function() {
        if (CEBWidget.noOfXDRFramesLoaded < CEBWidget.noOfXDRFrames) {
            CEBWidget.canFireReady = true;
            return;
        }
        CEBWidget.fireBeforeReady();
        CEBWidget.readyFired = true;
        $.each(CEBWidget.readyCallbacks, function(i, cb) {
            cb.call(this);
        });
        CEBWidget.readyCallbacks = [];
    };

    if (typeof noOfXDRFrames != 'undefined') {
        CEBWidget.noOfXDRFrames = noOfXDRFrames;
    }
    else { CEBWidget.noOfXDRFrames = 0; }

    CEBWidget.noOfXDRFramesLoaded = 0;

    CEBWidget.xdrFrameLoaded = function(prod) {
        if (!productsOnPage['loaded']) {
            setTimeout(function() {
                CEBWidget.xdrFrameLoaded(prod);
            }, 100);
            return;
        }
        if (prod && productsOnPage[prod]) {
            CEBWidget.noOfXDRFramesLoaded++;
        }
        if (CEBWidget.noOfXDRFramesLoaded >= CEBWidget.noOfXDRFrames && CEBWidget.canFireReady) { CEBWidget.fireReady(); }
    };

    $(document).ready(function() {
        window.onload = function() {
            var totalWidgets = 0,
                totalLoaded = 0;
            $.each($('.widgetPlaceHolder'), function(i, e) {
                totalWidgets++;
                var div = $(e);
                div.load(div.attr('widget-url'), null, function() {
                    totalLoaded++;
                    if (totalLoaded >= totalWidgets) { CEBWidget.fireReady(); }
                });
            });
            if (totalWidgets == 0) { CEBWidget.fireReady(); }
            
            // Google Ananlytis
            if (typeof ga === 'function') {
            	app.analyticsConfig().done (function (trckr){
            		 ga('create', trckr, 'none');
            		 ga('send', 'pageview');	
            	});
            }
        };

    });

    function loadCEBWidgets(context, shouldFireReadyEvent) {
        if (shouldFireReadyEvent) {
            CEBWidget.readyFired = false;
            CEBWidget.canFireReady = false;
        }
        var
            widgetsToLoad = [],
            shouldLoadWidgets = true;
        $.each($('.cebwidget', context || document), function(i, e) {
            var elem = $(e),
                widget;

            if (elem.attr('widget-type') && !elem.attr('widget-id')) {
                widget = window[elem.attr('widget-type')];
                if (widget) {
                    widgetsToLoad.push(elem);
                }
                else {
                    setTimeout(function() { loadCEBWidgets(context, shouldFireReadyEvent); }, 500);
                    shouldLoadWidgets = false;
                    return false;
                }
            } /*else {
                widgetsToLoad.push(elem); //Support for inline widgets
            }*/
        });
        if (shouldLoadWidgets) {
            registerChangeHandlers();
            $.each(widgetsToLoad, function(i, elem) {
                var widget;
                //var init = false;
                if (elem.attr('widget-type') && !elem.attr('widget-id')) {
                    widget = window[elem.attr('widget-type')];
                } /*else {
                    widget = CEBWidget; //inline widgets without any backup scripts
                    init = true;
                }*/
                var widgetInstance = new widget(elem, $('.widget-model', elem).clone(), elem.attr('widget-name')); //Init the widgets
                /*if(init)
                    widgetInstance.init('INLINEINSTANCE', elem, elem, elem.attr('widget-name'));
                    */
            });
            if (shouldFireReadyEvent) { CEBWidget.fireReady(); }
        }
    }

    function registerChangeHandlers(target) {
        var changeObservers = target? $('[widget-on-change]', target): $('[widget-on-change]');
        if(target) {
            $.each(changeObservers, function(i, observer) {
                var pathObserved = $(observer).attr('widget-on-change');
                EventManager.removeLocalOnChange(target, pathObserved);
            });
        }
        $.each(changeObservers, function(i, observer) {
            var observerElem = $(observer);
            var pathObserved = observerElem.attr('widget-on-change');
            var changeAction = observerElem.attr('on-change-action') || 'val';
            var changeFilter = observerElem.attr('on-change-filter');
            var callback = function(val, widget, elem) {
                if(changeFilter) {
                    elem = $(elem);
                    switch(changeFilter) {
                    case 'sameparent':
                        if(!(elem.parent()[0] == observerElem.parent()[0])) return;
                        break;
                    case 'samegrandparent':
                        if(!(elem.parent().parent()[0] == observerElem.parent().parent()[0])) return;
                        break;
                    case 'parentgrandparent':
                        if(!(elem.parent().parent()[0] == observerElem.parent()[0])) return;
                        break;
                    case 'grandparentgreatgrandparent':
                        if(!(elem.parent().parent().parent()[0] == observerElem.parent().parent()[0])) return;
                        break;
                    }
                }
                switch(changeAction) {
                case 'rebind':
                    widget.dataBinder(widget, observerElem, observerElem.data('context') );
                    break;
                case 'rebindParent':
                    widget.dataBinder(widget, observerElem.parent(), observerElem.data('context') );
                    break;
                case 'truncatetext':
                    if(typeof(val) != 'undefined' && val != null) {
                        var trncLen = 20;
                        var text = val.substr(0, trncLen) + (val.length > trncLen ? '...' : '');
                        var shouldSetTitle = val.length > trncLen ? true : false;
                        $(observer).text(text);
                        
                        checkGetRects (observer, val, trncLen);
                        
                        if (shouldSetTitle)
                            elem.attr ('title', val + '');
                    }
                    break;
                case 'val':
                default:
                    if (typeof (val) === 'boolean') {
                        var s = String (app.getLocalizedText("localized."+val), val);
                        val = s.charAt (0).toUpperCase () + s.substring (1);
                    }
                        
                    $(observer).text(val);
                    break;
                }
            };
            if(target) EventManager.registerLocalOnChange(target, pathObserved, callback);
            else EventManager.registerOnChange(pathObserved, callback);
        });
    }

    function checkGetRects (observer, val, trncLen) {
    	var lines = observer.getClientRects().length;
    	if (lines > 1) {
    		trncLen = trncLen -1;
    		var text = val.substr(0, trncLen) + (val.length > trncLen ? '...' : '');
    		$(observer).text (text);
    		checkGetRects (observer, text, trncLen);
    	}
    }

    ///End widget class

    ///Begin EventManager class
    EventManager = (function() {
        var _registeredEvents = [],
        _registeredHandlers = [],
        _changeNotificationHandlers = [],
        _localChangeNotificationHandlers = [],
        _api = {
            registerOnChange: function(propPath, handler) {
                var handlers = _changeNotificationHandlers[propPath] || [];
                handlers.push(handler);
                _changeNotificationHandlers[propPath] = handlers;
            },
            onChange: function(propPath, value, widget, elem) {
                var handlers = _changeNotificationHandlers[propPath] || [];
                $.each(handlers, function(i, handler) {
                    try {
                        handler(value, widget, elem);
                    } catch (error) {}
                });
            },
            removeOnChange: function(propPath) {
                _changeNotificationHandlers[propPath] = [];
            },
            registerLocalOnChange: function(target, propPath, handler) {
            	target = target.attr('widget-id');
                var changeNotificationHandlers = _localChangeNotificationHandlers[target] || [];
                var handlers = changeNotificationHandlers[propPath] || [];
                handlers.push(handler);
                changeNotificationHandlers[propPath] = handlers;
                _localChangeNotificationHandlers[target] = changeNotificationHandlers;
            },
            onLocalChange: function(target, propPath, value, widget, elem) {
            	target = target.attr('widget-id');
                var changeNotificationHandlers = _localChangeNotificationHandlers[target] || [];
                var handlers = changeNotificationHandlers[propPath] || [];
                $.each(handlers, function(i, handler) {
                    try {
                        handler(value, widget, elem);
                    } catch (error) {}
                });
            },
            removeLocalOnChange: function(target, propPath) {
            	target = target.attr('widget-id');
                var changeNotificationHandlers = _localChangeNotificationHandlers[target] || [];
                changeNotificationHandlers[propPath] = [];
            },          
            registerEvent: function(eventName, widgetType) {
                if (!_registeredEvents[widgetType]) {
                    _registeredEvents[widgetType] = [];
                }
                if ($.inArray(eventName, _registeredEvents[widgetType]) == -1) {
                    _registeredEvents[widgetType].push(eventName);
                }
            },
            getRegisteredEvents: function(widgetType) {
                return _registeredEvents[widgetType] || [];
            },
            registerEventHandlers: function(eventName, widgetType, instance) {
                if (!_registeredHandlers[widgetType]) {
                    _registeredHandlers[widgetType] = [];
                }
                if (!_registeredHandlers[widgetType][eventName]) {
                    _registeredHandlers[widgetType][eventName] = [];
                }
                if ($.inArray(instance, _registeredHandlers[widgetType][eventName]) == -1) {
                    _registeredHandlers[widgetType][eventName].push(instance);
                }
            },
            raiseEvent: function(eventName, widgetType, args) {
                var handlers,
                    event;
                if (!_registeredHandlers[widgetType]) {
                    return;
                }
                handlers = _registeredHandlers[widgetType][eventName];
                if (!handlers) {
                    return;
                }
                //Logger.debug('Invoking event - ' + eventName);
                event = { handled: false, source: widgetType, eventName: eventName };
                var handlerError = false;
                $.each(_registeredHandlers[widgetType][eventName], function(i, handler) {
                    try {
                        handler(args, event);
                    } catch (error) {
                        handlerError = true;
                        //Logger.error('Error while invoking the event handler - ' + error.message);
                    }
                });

                return event.handled;
            }
        };

        return _api;
    } ());

    ///End Event Manager class

    ///Begin appending to JS types prototype
    Date.prototype.toShortString = function() {
        var month = (this.getMonth() + 1).toString(),
        date = this.getDate().toString(),
        year = this.getFullYear().toString();

        return (month.length == 1 ? '0' : '') + month + '/' + (date.length == 1 ? '0' : '') + date + '/' + year;
    };

    //toServerString converts a date to the format 'MM/dd/yy hh:mm:ss a' in UTC time
    //this is the format recognized and deserialized by the server
    Date.prototype.toServerString = function() {
        //get hours and AM/PM format
        var h24 = this.getUTCHours();
        var ampm = 'AM';
        if (h24 >= 12)
            {
                h24 = h24 - 12;
                ampm = 'PM';
            }
        if (h24 == 0)
            {
                h24 = 12;
            }
        var month = (this.getUTCMonth() + 1).toString(),
        date = this.getUTCDate().toString(),
        year = this.getUTCFullYear().toString(),
        //hour = this.getUTCHours().toString(),
        hour = h24.toString(),
        mins = this.getUTCMinutes().toString(),
        secs = this.getUTCSeconds().toString(),
        milli = this.getUTCMilliseconds().toString();
        return (month.length == 1 ? '0' : '') + month + '/' + (date.length == 1 ? '0' : '') + date + '/' + year +
            ' ' + (hour.length == 1 ? '0' : '') + hour + ':' + (mins.length == 1 ? '0' : '') + mins + ':' +
            (secs.length == 1 ? '0' : '') + secs +
            /*'.' +
            (milli.length == 0 ? '000' : milli.length == 1 ? '00' : milli.length == 2 ? '0' : '') + milli
            */
            ' ' + ampm;

    };
    //tolocalServerString converts a date to the format 'MM/dd/yy hh:mm:ss a' in LOCAL time
    //this is the format recognized and deserialized by the server
    Date.prototype.toLocalServerString = function() {
        //get hours and AM/PM format
        var h24 = this.getHours();
        var ampm = 'AM';
        if (h24 >= 12)
            {
                h24 = h24 - 12;
                ampm = 'PM';
            }
        if (h24 == 0)
            {
                h24 = 12;
            }
        var month = (this.getMonth() + 1).toString(),
        date = this.getDate().toString(),
        year = this.getFullYear().toString(),
        //hour = this.getHours().toString(),
        hour = h24.toString(),
        mins = this.getMinutes().toString(),
        secs = this.getSeconds().toString(),
        milli = this.getMilliseconds().toString();
        return (month.length == 1 ? '0' : '') + month + '/' + (date.length == 1 ? '0' : '') + date + '/' + year +
            ' ' + (hour.length == 1 ? '0' : '') + hour + ':' + (mins.length == 1 ? '0' : '') + mins + ':' +
            (secs.length == 1 ? '0' : '') + secs +
            /*'.' +
            (milli.length == 0 ? '000' : milli.length == 1 ? '00' : milli.length == 2 ? '0' : '') + milli
            */
            ' ' + ampm;

    };
    String.prototype.trunc = function(n) {
        return this.substr(0, n - 1) + (this.length > n ? '...' : '');
    };
    ///End appending to JS types prototype




    var Settings = (function() {
        var _currentPageName = '';
        var _pageSettings = {};
        var _timeoutHandle = null;
        var _isPersisting = false;
        var _isLoaded = false;
        var _isDirty = false;
        var _baseUrl = null;
        var _baseSaveUrl = null;
		var _setWidgetLoaderVis = function (widgets, shouldShow) {
			if (widgets && widgets.length)
				for (var widex = 0; widex < widgets.length; widex++) 
					CEBWidget.namedInstances [ widgets [widex] ].setIsLoading (shouldShow, CEBWidget.namedInstances [ widgets [widex] ]);
		};

        return _api = {
            settingsCallback: null,

            setBaseUrl: function(url, saveUrl) {
                _baseUrl = url;
                _baseSaveUrl = saveUrl;
            },

            ///Sets the current page for which the settings are being loaded
            setCurrentPage: function(pagename) {
                _currentPageName = pagename;
            },
            load: function(callback, widgetNames) {
                //If the setting is already loaded, then we need not load again
                if (_isLoaded) {
                    alert('already loaded');
                    if (callback)
                        callback(true);
                    return;
                }
				_setWidgetLoaderVis (widgetNames, true); 
				var url = (_baseUrl || 'users/settings/') + _currentPageName;
                $.ajax({
                    url: url,
                    type: 'GET',
                    beforeSend: function(request) {
                         //console.log("Ajax before send");
                         var token = $("meta[name='_csrf']").attr("content");
                         var header = $("meta[name='_csrf_header']").attr("content");
                         request.setRequestHeader(header, token);
                    },
                    success: function(data) {
                        if (data.PageName == _currentPageName) {
                            _pageSettings = data.Settings;
                            _isLoaded = true;
                            if (callback)
                                callback(true);
                        }
                    },
                    error: function() {
                        //Logger.error('Unable to load settings for the page');
                        if (callback)
                            callback(false);
						_setWidgetLoaderVis (widgetNames, false);
                    }
                });
            },

            pending: function() {
                return _isDirty || _isPersisting;
            },

            ///Gets the settings for the given page and section
            get: function(key) {
                return _pageSettings[key];
            },

            set: function(key, value) {
                _pageSettings[key] = value;
                //Wait for 500ms to make sure there are no changes and then persist
                var self = this;
                if (_timeoutHandle) clearTimeout(_timeoutHandle);
                _isDirty = true;
                var invokePersist = function() {
                    if (!_isPersisting)
                        self.persist();
                    else {
                        _timeoutHandle = setTimeout(invokePersist, 500);
                    }
                };
                _timeoutHandle = setTimeout(invokePersist, 500);
            },

            persist: function() {
                var url = (_baseSaveUrl || 'users/savesettings/') + _currentPageName;
                _isPersisting = true;

                $.ajax({
                    url: url,
                    type: 'POST',
                    dataType: 'json',
                    headers: {'Accept': 'application/json', 'contentType': 'application/json; charset=utf-8'},
                    data: JSON.stringify(_pageSettings),
                    beforeSend: function(request) {
                         //console.log("Ajax before send");
                         var token = $("meta[name='_csrf']").attr("content");
                         var header = $("meta[name='_csrf_header']").attr("content");
                         request.setRequestHeader(header, token);
                    },
                    success: function(data) {
                        _isPersisting = false;
                        _isDirty = false;
                        var succeeded = true;
                        if (data.Status != 'Success') {
                            //Logger.error('Save settings failed - ' + data.Status + '. Message - ' + data.Message);
                            succeeded = false;
                        }
                        if (_api.settingsCallback)
                            _api.settingsCallback(succeeded);
                    },
                    error: function() {
                        _isPersisting = false;
                        _isDirty = false;
                        //Logger.error("Unable to save settings for the page due not being able to rearch setting's service or being logged out.");
                        if (_api.settingsCallback)
                            _api.settingsCallback(false);
                    }
                });
            }

        };
    } ());

    /*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function() {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function(val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = '0' + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function(date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == '[object String]' && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError('invalid date');

        mask = String(dF.masks[mask] || mask || dF.masks['default']);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == 'UTC:') {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? 'getUTC' : 'get',
            d = date[_ + 'Date'](),
            D = date[_ + 'Day'](),
            m = date[_ + 'Month'](),
            y = date[_ + 'FullYear'](),
            H = date[_ + 'Hours'](),
            M = date[_ + 'Minutes'](),
            s = date[_ + 'Seconds'](),
            L = date[_ + 'Milliseconds'](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d: d,
                dd: pad(d),
                ddd: dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m: m + 1,
                mm: pad(m + 1),
                mmm: dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                M: M,
                MM: pad(M),
                s: s,
                ss: pad(s),
                l: pad(L, 3),
                L: pad(L > 99 ? Math.round(L / 10) : L),
                t: H < 12 ? 'a' : 'p',
                tt: H < 12 ? 'am' : 'pm',
                T: H < 12 ? 'A' : 'P',
                TT: H < 12 ? 'AM' : 'PM',
                Z: utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
                o: (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S: ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    'default': 'ddd mmm dd yyyy HH:MM:ss',
    shortDate: 'm/d/yy',
    mediumDate: 'mmm d, yyyy',
    longDate: 'mmmm d, yyyy',
    fullDate: 'dddd, mmmm d, yyyy',
    shortTime: 'h:MM TT',
    mediumTime: 'h:MM:ss TT',
    longTime: 'h:MM:ss TT Z',
    isoDate: 'yyyy-mm-dd',
    isoTime: 'HH:MM:ss',
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ],
    monthNames: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ]
};

// For convenience...
Date.prototype.format = function(mask, utc) {
    return dateFormat(this, mask, utc);
};

// global ajax handler
$(document).ajaxError(function(evnt, jqXHR, options, errorThrown) {
    if (jqXHR.status == 0) {
    } else if (jqXHR.status == 404) {
    } else if (jqXHR.status == 500) {
    } else if (jqXHR.status == 401 || jqXHR.status == 408) {
        window.location.reload(true);
    }
    else {
    }
});

//trigering ajax class for other than widgets
var AjaxRequest = {
        send: function(reqURL, reqType, reqContentType, reqDataType, reqData, onSuccess, onError, onComplete, async, cache, setDirty) {
            var _setDirty = (setDirty == 'undefined' || setDirty == null) ? true : setDirty; 
        	
            var stringData = JSON.stringify (reqData);
            stringData = app.stripScripts (stringData);
        	reqData = JSON.parse (stringData);
        	
        	
            var stringData = JSON.stringify (reqData);
            stringData = stringData.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        	reqData = JSON.parse (stringData);
        	
        	var xhr = $.ajax({
                         url: reqURL,
                         type: reqType,
                         async: (typeof async === 'undefined' || async === null) ? true : async,
                         cache: (typeof cache === 'undefined' || cache === null) ? true : cache,
                         headers: {'Accept': 'application/json', 'contentType': 'application/json; charset=utf-8'},
                         contentType: reqContentType || 'application/json; charset=utf-8',
                         dataType: reqDataType || 'json',
                         data: JSON.stringify(reqData) || {},
                         //timeout: 5000, //TODO set it correctly or remove
                         beforeSend: function(request) {
                             //console.log("Ajax before send");
                             var token = $("meta[name='_csrf']").attr("content");
                             var header = $("meta[name='_csrf_header']").attr("content");
                             request.setRequestHeader(header, token);
                         },
                         success: function(dataReceived, textStatus, jqXHR) {
                                    //console.log("Returning ajax success");
                                    if ($.isFunction(onSuccess)) onSuccess(dataReceived);
                         },
                         error: function(data, textStatus, jqXHR) {
                                    //console.log("Returning ajax error");
                                    if ($.isFunction(onError)) onError(data, textStatus, jqXHR);
                         },
                         complete: function() {
                                    //console.log("Returning ajax complete");
                                    if(_setDirty)
                                    	app.setDefaultDirtyBit(CEBWidget.instances);
                                    if ($.isFunction(onComplete)) onComplete();
                         }
                });
                return xhr; 
        }
    };


//Event handling for checking/unchecking the notifications
 $.fn.toggleNotification = function() {
     var isSelected = $(this).is('.selected');
     if (!isSelected) {
       $(this).toggleClass('active', false).find('i.selector')
       .toggleClass('icon-check-empty', false)
       .toggleClass('icon-check-sign blue', true)
       .end()
       .addClass('selected');

       $(this).find('input[data-bind]').prop('checked', true).trigger('change');
     }
     else {
       $(this).toggleClass('active', false).find('i.selector')
       .toggleClass('icon-check-empty', true)
       .toggleClass('icon-check-sign blue', false)
       .end()
       .removeClass('selected');

       $(this).find('input[data-bind]').prop('checked', false).trigger('change');
     }
};


CEBWidget.ready(function() {
      if(!Modernizr.input.placeholder){
        $("input").each(function(){
          if($(this).val()=="" && $(this).attr("placeholder")!=""){
            $(this).val($(this).attr("placeholder"));
            $(this).focus(function(){
              if($(this).val()==$(this).attr("placeholder")) $(this).val("");
            });
            $(this).blur(function(){
              if($(this).val()=="") $(this).val($(this).attr("placeholder"));
            });
          }
        });
      }
    });

String.prototype.htmlReplace = function(strToFind, replaceStartStr, replaceEndStr) {
    var inputStr = this;
    var index = inputStr.indexOf(strToFind);
    while(index >= 0) {
        var nextIndex = inputStr.indexOf(strToFind, index + 1);
        if(nextIndex == -1) break;
        var subStr = inputStr.substring(index + strToFind.length, nextIndex);
        if(subStr.indexOf('<br/>') != -1)  {
            index = inputStr.indexOf(strToFind, index + 1);
            continue;
        }
        var left = inputStr.substring(0, index);
        var right = inputStr.substring(nextIndex + strToFind.length);
        inputStr = left + replaceStartStr;
        var tagStartIndex = subStr.indexOf('<');
        while(tagStartIndex != -1) {
            var tagEndIndex = subStr.indexOf('>', tagStartIndex);
            if(tagEndIndex == -1 || tagEndIndex == subStr.length - 1) break;
            inputStr += subStr.substring(0, tagStartIndex) + replaceEndStr + subStr.substring(tagStartIndex, tagEndIndex + 1);
            inputStr += replaceStartStr;
            subStr = subStr.substring(tagEndIndex + 1);
            tagStartIndex = subStr.indexOf('<');
        }
        inputStr += subStr + replaceEndStr + right;
        //inputStr = inputStr.replace(strToFind, replaceStartStr).replace(strToFind, replaceEndStr);
        index = inputStr.indexOf(strToFind);
    }
    return inputStr;
};

String.prototype.listReplace = function(strToFind, replaceStr) {
    var strBoundData = this;
    var listIndex = strBoundData.indexOf(strToFind);
    if(listIndex >= 0) {
        strBoundData = strBoundData.replace(strToFind, '<' + replaceStr + '><li>');
        var lineIndex = strBoundData.indexOf('\n', listIndex);
        if(lineIndex == -1) strBoundData += '</li></' + replaceStr + '>';
        while(lineIndex != -1) {
            if(lineIndex == -1 || lineIndex == strBoundData.length - 1) {
                break;
            }
            var left = strBoundData.substring(0, lineIndex);
            var right = strBoundData.substring(lineIndex + 1);
            var nextChar = strBoundData.charAt(lineIndex + 1);
            strBoundData = left + '</li>';
            if(nextChar == strToFind) {
                strBoundData += '<li>';
                right = right.substring(1);
                strBoundData += right;
                lineIndex = strBoundData.indexOf('\n', lineIndex + 1);
            } else {
                lineIndex = -1;
                strBoundData += '</li></' + replaceStr + '>';
                strBoundData += right;
            }
            
        }
        
    }
    return strBoundData;
};

function getToPost(url) {
	var questionIndex = url.indexOf('?');
	var formUrl = questionIndex > 0? url.substring(0,questionIndex): url;
	var params = questionIndex > 0? url.substring(questionIndex + 1): "";
	var paramArray = params.split("&");
	var formElem = $("<form/>");
	$("body").append(formElem); 
	formElem.attr("method", "POST").attr("action", formUrl);
	$.each(paramArray, function(i, param) {
		var inputAttr = $("<input/>");
		var tokens = param.split("=");
		inputAttr.attr("type","hidden").attr("name",tokens[0]).attr("value",tokens.length>1?tokens[1]:"").appendTo(formElem);
		
	});
    var token = $("meta[name='_csrf']").attr("content");
    var header = $("meta[name='_csrf_header']").attr("content");
    if(token && header) {
		var inputAttr = $("<input/>");
		inputAttr.attr("type","hidden").attr("name","_csrf").attr("value",token).appendTo(formElem);
		
    }

	formElem.submit();
}


