$.fn.PlaceHolder = function (options) {
    var divObj = $(this);
    divObj.empty();
    var settings = $.extend({
        key:"",
		type:"",
        value: "",
        spanId:"",
        selectionChange: null,
        done:null
    }, options);
    _controlPlaceHolder.properties.clickEvent = settings.selectionChange;
    _controlPlaceHolder.properties.doneEvent = settings.done;
    _controlPlaceHolder.createControl(divObj, settings.key, settings.type, settings.value, settings.spanId);
}

var _controlPlaceHolder = {	
    properties: {
        clickEvent: null,
        doneEvent: null
    },
    catchSelectionChanges: function () {
        var selectionFromSource = _controlPlaceHolder.properties.clickEvent;
		selectionFromSource.apply(this, arguments);
        $(this).parent().parent().parent().empty();
		
    },
    createControl: function (divObj, key, type, value, spanId) {
        var divTop = $("<div/>").css("float", "left").appendTo(divObj);
        var divMain = $("<div/>").attr("class", "rectangleRadius").appendTo(divTop);
        var divWrapper = $("<div/>").attr("class", "rectanglebox").appendTo(divMain);
		var spanType = $("<span/>").attr("class", "typeIcon").appendTo(divWrapper);
		switch(type) {
			case "city":
				img = "images/location.png";
				break;
			case "Skill":
				img = "images/skill.png";
				break;
			default:
				img = "images/setting.png";
			}
		var iconspan = $("<img  />").attr('src', img).width('16px').height('16px').appendTo(spanType);
		var spanItem = $("<span/>").text(key).appendTo(divWrapper);
		var pattern = /^\-/;
		if( key.match(pattern)) { 
			spanItem.attr("class", "placeHolderExcludedText");
		}
		else{
			spanItem.attr("class", "placeHolderText");
		}
        var spanRemove = $("<span/>").attr("id", spanId).attr("rel", value).attr("class", "removeIcon").appendTo(divWrapper);
        var imgspan = $("<img  src=\"Images/remove2.png\" height=\"11px\" width=\"11px\">").appendTo(spanRemove);
        $("#" + spanId).click(_controlPlaceHolder.catchSelectionChanges);
        if (_controlPlaceHolder.properties.doneEvent!=null) _controlPlaceHolder.properties.doneEvent();
    }
}