function TopNavWidget(target, model, name) {
    this.init('TopNavWidget', target, model, name);
}



if (!TopNavWidget.prototype.init) {
    var pop = null;

    TopNavWidget.prototype = $.extend(true, {}, new CEBWidget(), {
        onLoad: function(e) {
        	
            
            var self = this;
            //If you want the framework to automatically manage fetching of data
            //and binding the data in UI, then uncomment the below line and specify
            //the URI that provides the JSON data. Leave this line commented if
            //you want to manually manage fetching and rendering of data.
           // self.dataURI = "";
            self.dataURI = "topnav";
            
            self.chromeStyle = CHROMESTYLE.NONE;
            //self.dataLoadParams = {}; //Here we can pass any fiters

            //IMPORTANT! Need to call the loaded method to let the framework know
            //that the widget has finished all initializations and ready to go!
            self.loaded();
            
            
        },
      
        onContextChanged: function(old, ctx) {
            // This event handler is invoked when the context of the widget changes. Use this to set the dataLoadPrams
        
            if (ctx) {
                this.bind2(ctx, this, ctx);
                return false;
            }

            return true; //If this method does not return true, then the data is not re-loaded automatically on context change!
        },

        customBind: function(data, instance) {
            //This method is invoked after data is bound to the page.
            //This can be used to customize the data. For ex: Convert a table to a grid and etc
        }
    });
}