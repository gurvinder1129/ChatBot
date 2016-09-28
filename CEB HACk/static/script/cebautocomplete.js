  $( function() {

    // the widget definition, where "custom" is the namespace,
    // "cebautocomplete" the widget name
    var setttings=null;
    $.widget( "custom.cebautocomplete", {
      options: {
        method:'GET',
        minLength: 2,
        delay:100,
        datafrom:[],
        getData:null,
      },


      _create: function() {
          setttings = this.options;
          getData =setttings.getData;



          this._bulid()
      },

      _bulid: function(){
        // _autocomplete.callData(this,config.getData);
        // console.log('config.getData ' , config.getData);
        this.element.autocomplete({
          // delay:config.delay,
          // minLength:config.minLength,
          // source : config.datafrom,
          source:function(request, callback){
                console.log('getData ' ,setttings.getData);

                var searchParam  = request.term;
                init(searchParam, callback)
              }
          // source: this._callBack(this),

        });
      },
      _callBack:function(request,response){




        // if (typeof config.datafrom === 'string' || config.datafrom instanceof String){  
        //   $.ajax({
        //        type: config.method,
        //        url:  config.datafrom,
        //        success: function (msg) {
        //            response(msg);
        //        },
        //        error: function (msg) {
        //        console.log('msg error' , msg);
        //            alert(msg.status + ' ' + msg.statusText);
        //        }
        //    })
        // }
        // else{
        //     var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
        //     var matching = $.grep(config.datafrom, function (value) {
        //         return matcher.test(value) ;
        //     });
        //   response(matching);
        //  }
      },

    });
 
    function log( message ) {
      $( "<div>" ).text( message ).prependTo( "#log" );
      $( "#log" ).scrollTop( 0 );
    }
  } );

  function init(query, callback) {
    var response = [];
    response = [ "IBM", "CISCO", "CTS", "CEB", "DELL", "INTELL", "REGUS" ];
  // console.log('callback ' , callback);
  // console.log('query ' , query);
  callback(response);
}