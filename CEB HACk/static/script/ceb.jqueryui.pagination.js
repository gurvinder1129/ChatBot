/**
 * Pagination plugin
 *
 * Call Ajax Call And Display Pagination
 *
 * Options:
 *	- maxNumberDispaly (integer): how many no to show
 *	- selectionCallback (function): callBack Function
 *	- perPage (integer) : result Display per Page
 *	- totalResult (integer) : total find record
 *	- numberInLastPostionDispaly(integer) : form last display data
 *
 */
$.widget("ceb.cebpagination", {
	options : {
		maxNumberDispaly:5,
		perPage:null,
		totalResult:null,
		selectionCallback:null,
		numberInLastPostionDispaly:0
	},
	_create : function() {

		var $pagination = this,
			startPage =1,
			maxNumberDispaly = this.options.maxNumberDispaly,
			perpage = this.options.perPage,
			total = this.options.totalResult,
			endPage =  Math.ceil(total/perpage);
			if (endPage >maxNumberDispaly) {
				 this._displayPagination(startPage,endPage);
			} else {
				 getCurrentPageNo=1;
				 console.log('without arrow function')
				 this._simplePaginationWithOutPattern(startPage,endPage);
			}
	},
	_curentPaginationWithOutPattern:function(){
		var startPage =parseInt(event.currentTarget.textContent, 10);
		var	perpage = this.options.perPage;
		var	totalPages = this.options.totalResult;
		var	endPage =  Math.ceil(totalPages/perpage);
    	this._simplePaginationWithOutPattern(startPage,endPage);
	},
	_simplePaginationWithOutPattern:function(startPage,endPage){
			selectionCallback = this.options.selectionCallback;	
			$element=$(this.element).html('').show();
			for (var i = 1; i <= endPage; i++) {
					var span = $("<span/>").click(selectionCallback);
								this._on(span, {
									click: "_curentPaginationWithOutPattern" 
								});	

					if (i==startPage) {
						span.addClass('active')
					}	
					$('<a>',{
					    text: i+' ',
					    title: i+' ',
					    href: '#',
					}).appendTo(span)
					$element.append(span)
			}
	},
	_pageClick: function (event) {
		var startPage =parseInt(event.currentTarget.textContent, 10);

		var	perpage = this.options.perPage;
		var	totalPages = this.options.totalResult;
		var	endPage =  Math.ceil(totalPages/perpage);
    	this._displayPagination(startPage,endPage);
	},
	_goBack:function(event){
		this._displayPagination(this.lastClick-1,this.endPage)
	},
	_goNext:function(event){
		this._displayPagination(this.lastClick+1,this.endPage)		
	},
	_clickNextFunc:function(event){
			var span = $("<span/>").click(selectionCallback);
				this._on(span, {
					click: "_goNext" 
				});		
			$('<a>',{
			    text: '> ',
			    title: '> ',
			    href: '#',
			}).appendTo(span)
			$element.append(span)	

	},
	_clickPerviousFunc:function(){
			var span = $("<span/>").click(selectionCallback);
						this._on(span, {
							click: "_goBack" 
						});		
			$('<a>',{
			    text: '< ',
			    title: '< ',
			    href: '#',
			}).appendTo(span)
			$element.append(span)	

	},
	_addPattern:function(){
		var span = $("<span/>").click(selectionCallback);
				this._on(span, {
					click: "_pageClick" 
				});		

		$('<a>',{
		    text: '...',
		    title: '...',
		    href: '#',
		}).appendTo(span)
		$element.append(span)
	},
	_renderNumber:function(i,startPage,activePage){
					var span = $("<span/>").click(selectionCallback);
						this._on(span, {
							click: "_pageClick" 
						});		

					if (i==activePage) {
						span.addClass('active')
					}
					$('<a>',{
					    text: i+' ',
					    title: i+' ',
					    href: '#',
					}).appendTo(span)
					$element.append(span)
	},
	_displayPagination: function(startPage,endPage){
				selectionCallback = this.options.selectionCallback;				
				perpage = this.options.perPage,
				total = this.options.totalResult,
				numberInLastPostionDispaly = this.options.numberInLastPostionDispaly,
				$element=$(this.element).html('').show();

				totalPages =  Math.ceil(total/perpage);
				maxNumberDispaly = this.options.maxNumberDispaly;
				this.endPage=endPage;
				this.lastClick=startPage;
				var leftArrow=0;
				var rightArrow=0;
				var dotArrow=0;
				var liList;
				var middlePostionCheck=(totalPages/2);
				activePage =startPage;
				if(startPage>=middlePostionCheck){
					startPage =middlePostionCheck
				}
				for (var i = startPage; i <= endPage; i++) {

					// for FirstIndex 
					if(totalPages>maxNumberDispaly && leftArrow==0 && startPage!==1){
						this._clickPerviousFunc();
						leftArrow=1;
					}

					// for half-FISRT... 
					// if(totalPages-maxNumberDispaly<startPage && dotArrow==0){
					if(totalPages-maxNumberDispaly-1<startPage && dotArrow==0){
						this._addPattern()
						dotArrow=1;
					}
					// for half-second... 
					if (startPage+maxNumberDispaly==i && startPage+maxNumberDispaly<totalPages-1 ){
						this._addPattern()
					}

					// for starting no ...
					// totalPages-1==i ONLY FOR LAST index (BEFORE >> symboles nUMBER )
					// render Number
					// if(startPage+maxNumberDispaly>i -last how many want to dispaly || totalPages-1==i){ in this if condition do minus with startPage+maxNumberDispaly>i-no of postion
					if(startPage+maxNumberDispaly>i-numberInLastPostionDispaly  || totalPages-1==i){
						this._renderNumber(i,startPage,activePage)
					}
					// // for _lastIndex 
					if(totalPages-1==i && rightArrow==0 && activePage+1!=totalPages){
							this._clickNextFunc(selectionCallback);
							rightArrow=1;
					}
				}
				//END FOR LOOP
	},



		
});
