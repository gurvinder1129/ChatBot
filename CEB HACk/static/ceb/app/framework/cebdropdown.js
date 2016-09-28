/*
Usage Notes: 
===========
To convert a select element into cebdropdown
$('selectElement').cebdropdown();

To get selected items
$('selectElement').cebdropdown('getSelects');

To set selected items
$('selectElement').cebdropdown('setSelects', [array of values]); -> May pass empty array to deselect all

To select all items
$('selectElement').cebdropdown('selectAll');

To deselect all items
$('selectElement').cebdropdown('deselectAll');

If option elements are added/removed to the original select element during runtime, we might need to rebuild the plugin using the below method
$('selectElement').cebdropdown('rebuild');

To reflect the selected values from original select element
$('selectElement').cebdropdown('refreshSelection');

To disable
$('selectElement').cebdropdown('disable');

To enable it back
$('selectElement').cebdropdown('enable');

To completely destroy this plugin and show the select element back
$('selectElement').cebdropdown('destroy');
*/

(function ($) {

    $.widget("ceb.cebdropdown", {
        //default options
        options: {
            dropRight: false,
            hasFilter: false,
            enableCaseInsensitiveFiltering: true,
            buttonWidth: '200px',
            labelMaxLength: 40,
            includeSelectAllOption: false,
            placeholder: 'Please Select...'
        },

        _getPluginOptions: function () {
            var $this = this;

            return $.extend({}, $this.options, {
                enableFiltering: $this.options.hasFilter,
                enableCaseInsensitiveFiltering: ($this.options.hasFilter) ? $this.options.enableCaseInsensitiveFiltering : (($this.element.children('option').length > 10) ? true : false),
                buttonClass: 'form-control ceb-dropdown' + (($this.options.buttonWidth == '100%') ? ' align-left' : ''),
                selectAllText: app.getLocalizedText('App.Cebdropdown.All', 'All'),
                maxHeight: ($this.element.children('option').length > 20) ? 200 : null,
                filterPlaceholder: app.getLocalizedText('App.Cebdropdown.Search', 'Search'),
                buttonContainer: '<div class="btn-group ceb-dropdown-container" />',
                //modify default implementation of how options are displayed to enhance screen reader accessibility
                templates:
                {
                    button: '<button type="button" aria-expanded="false" aria-labeledby="' + ($this.element.attr("aria-labeledby") || ' ') + '" class="multiselect dropdown-toggle" data-toggle="dropdown"></button>',
                    ul: '<ul class="multiselect-container dropdown-menu"></ul>',
                    li: '<li data-itemtype = "option-item-wrap"><a class = "dropdown-item" tabindex="0" role="listitem"><label></label></a></li>',
                //filter: '<li class="multiselect-item filter"> <label class="sr-only" for="cebdropdown-search">' + app.getLocalizedText("App.Cebdropdown.Search", "Search") + '</label> <input id="cebdropdown-search" class="form-control multiselect-search" type="text" /></li>' + ($this.element.attr('multiple') ? ('<li><a class = "multiselect-clear-filter" href = "#">' + app.getLocalizedText('App.Cebdropdown.Clear', 'Clear selected items') + '</a></li>') : '')
                    filter: '<li class="multiselect-item filter"><input class="form-control multiselect-search" type="text" /></li>' + ($this.element.attr('multiple') ? ('<li><a class = "multiselect-clear-filter" href = "#">' + app.getLocalizedText('App.Cebdropdown.Clear', 'Clear selected items') + '</a></li>') : '')
                },
                //set placeholder text for when no options are selected and display 'N options selected' when there is small space on screen and all options cannot be displayed.
                nonSelectedText: $this.element.attr("placeholder") || $this.options.placeholder,
                buttonText:
                    function(options, select) {
                        var $_button = null,
                            labels = [];
                        if ($this.element.data('multiselect'))
                            $_button = $this.element.data('multiselect').$button || null;
                        if (options.length === 0) {
                            return $this.element.attr("placeholder") || $this.options.placeholder;
                        } else {
                            options.each(function() {
                                if ($(this).attr('label') !== undefined) {
                                    labels.push($(this).attr('label'));
                                } else {
                                    labels.push($(this).html());
                                }
                            });
                            if ($_button)
                                $_button.attr('aria-label', labels.join(', '));
                            return labels.join(', ') + ' ';
                        }
                    },
                onDropdownHidden: function(event) { 
                	this.$button.focus();
                	this.$button.attr("aria-expanded", false);
                	},
                onDropdownShown: function(event) { 
                	$(this.$filter).find('input').focus();
                	this.$button.attr("aria-expanded", true);
                	},
                label: function(element) {
                    var val = $(element).text();
                    if (val && val.length > $this.options.labelMaxLength) {
                        return val.substr(0, $this.options.labelMaxLength) + '...';
                    }
                    return val;
                }
            });
        },

        _initializePlugin: function () {
            var selectElement = this.element;
            $.each ($(this.element).children ('option'), function (index, option){
            	$(option).text(app.stripScripts ($(option).text()));
            });
            var settings = this._getPluginOptions();
            selectElement.multiselect(settings);
            $('a.multiselect-clear-filter', selectElement.next('.btn-group')).on('click', this.deselectAll);
        },

        _create: function () {
            this._initializePlugin();
            this._trigger('complete', null, null);
            if (typeof _dtInitCompleteFired === 'function') {
         	   try {
         		   _dtInitCompleteFired(this.element);
         	   }
         	   catch (err) {};
            }
        },

        _init: function() {
            this._initializePlugin();
        },

        _destroy: function() {
            this.element.multiselect('destroy');
        },

        deselectAll: function(event) {
            var selectElement = (event) ? $(event.target).parents('div.ceb-dropdown-container').prev('select') : this.element;

            selectElement.multiselect('deselectAll', false);
            selectElement.multiselect('updateButtonText');
            selectElement.trigger('change');
        },

        selectAll: function() {
            var selectElement = this.element;

            selectElement.multiselect('selectAll', false);
            selectElement.multiselect('updateButtonText');
            selectElement.trigger('change');
        },

        setSelects: function (values) {
            var selectElement = this.element;

            selectElement.multiselect('deselectAll', false);
            selectElement.multiselect('select', values);
            selectElement.trigger('change');
        },

        getSelects: function() {
            return this.element.val();
        },

        disable: function() {
            this.element.multiselect('disable');
        },

        enable: function() {
            this.element.multiselect('enable');
        },

        refreshSelection: function() {
            this.element.multiselect('refresh');
        },

        rebuild: function() {
            this.element.multiselect('rebuild');
        }
    });
})(jQuery);