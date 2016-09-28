function CountriesWidget(target, model, name) {	
	this.init('CountriesWidget', target, model, name);
}

if (!CountriesWidget.prototype.init) {
	var isCountriesWidgetMutipleDropDown = false;

	CountriesWidget.prototype = $.extend(true, {}, new CEBWidget(), {
		onLoad : function(e) {
			var self = this;
			// self.dataURI = "http://localhost:3000/countries"; //Set this values in refered page
			// 
			self.chromeStyle = CHROMESTYLE.NONE;
			// self.dataLoadParams = {"Success":true,"Message":"success","StatusCode":200,"IsError":false,"IgnoreLocalCache":true,"Data":[{"countryName":"Argentina","countryId":"14"},{"countryName":"Australia","countryId":"30"},{"countryName":"Belgium","countryId":"58"},{"countryName":"Brazil","countryId":"12"},{"countryName":"Bulgaria","countryId":"34"},{"countryName":"Canada","countryId":"4"},{"countryName":"China","countryId":"3"},{"countryName":"Colombia","countryId":"21"},{"countryName":"Czech Republic","countryId":"11"},{"countryName":"Denmark","countryId":"27"},{"countryName":"Egypt","countryId":"6"},{"countryName":"Finland","countryId":"71"},{"countryName":"France","countryId":"23"},{"countryName":"Germany","countryId":"49"},{"countryName":"Hungary","countryId":"29"},{"countryName":"India","countryId":"2"},{"countryName":"Ireland","countryId":"25"},{"countryName":"Israel","countryId":"31"},{"countryName":"Italy","countryId":"66"},{"countryName":"Japan","countryId":"17"},{"countryName":"Latvia","countryId":"90"},{"countryName":"Malaysia","countryId":"7"},{"countryName":"Mexico ","countryId":"15"},{"countryName":"Morocco","countryId":"32"},{"countryName":"Netherlands","countryId":"64"},{"countryName":"New Zealand","countryId":"59"},{"countryName":"Northern Ireland","countryId":"70"},{"countryName":"Panama","countryId":"55"},{"countryName":"Peru","countryId":"20"},{"countryName":"Philippines","countryId":"53"},{"countryName":"Poland","countryId":"10"},{"countryName":"Puerto Rico","countryId":"97"},{"countryName":"Qatar","countryId":"69"},{"countryName":"Romania","countryId":"19"},{"countryName":"Russia","countryId":"8"},{"countryName":"Saudi Arabia","countryId":"57"},{"countryName":"Scotland","countryId":"68"},{"countryName":"Singapore","countryId":"22"},{"countryName":"Slovakia","countryId":"56"},{"countryName":"South Africa","countryId":"18"},{"countryName":"Spain","countryId":"44"},{"countryName":"Sri Lanka","countryId":"101"},{"countryName":"Sweden","countryId":"67"},{"countryName":"Switzerland","countryId":"26"},{"countryName":"Taiwan ","countryId":"5"},{"countryName":"Thailand","countryId":"28"},{"countryName":"UAE","countryId":"41"},{"countryName":"United Kingdom","countryId":"24"},{"countryName":"United States","countryId":"1"},{"countryName":"Vietnam","countryId":"45"}]};
			// self.dataLoadParams = 
			self.loaded();
		},

		onContextChanged : function(old, ctx) {
			if (ctx != null && ctx.dataLoadParams != null
					&& ctx.dataLoadParams.isMultiple) {
				isCountriesWidgetMutipleDropDown = true
			}
			return true;
		},

		customBind : function(data, instance) {
			console.log('data', data);
			if (isCountriesWidgetMutipleDropDown) {
				$('#countryContainer').attr('multiple', 'multiple');
			}

			$.each(data, function(index, obj) {
				var key = obj.countryId
				var value = obj.countryName;
				$("#countryContainer").append(
						'<option value="{0}">{1}</option>'.replace("{0}", key)
								.replace("{1}", value));
			});

			
			EventManager.raiseEvent('OnSelectionChange', 'CountryWidget',
					function(args, event) {
						console.log('event ' , event);
					console.log('args ' , args);
						// Not sure what to do now, Do we need to update the
						// context of all the widgets..
						return false;
					});
		}
	});
}