/**
 * The Resize And Move Panel.
 * 
 * @note
 * Combining Bootstrap panel and jQuery UI to achieve movement and size change. 
 * "ResizeMovePanel.js" will cope with troublesome combinations.
 * "ResizeMovePanel.js" simplifies implementation on your system.
 * 
 * @version 1.0
 * @date 2016-12-2 | 2016-12-28
 * @auther kenji uehara
 * 
 * @param param
 * - panel_slt :Panel element selector.
 * - panel_width :Width of Panel element.(When omitted, the HTML side definition is set automatically)
 * - panel_height :Height of Panel element.(When omitted, Same above.)
 * - max_width :Max panel size.
 * - max_height :Same above.
 * - min_width :Min panel size.
 * - min_height :Same above.
 * - panel_top :Initial relative position of panel element.
 * - panel_left :Same above.
 * - free_btn_slt ：Free button element selector.
 * - fixity_btn_slt ：Fixity button element selector.
 * - canvas_slt :A Canvas element selector.
 */
var ResizeMovePanel =function(param){
	
	
	this.param = param;
	
	this.panel; // Panel element object.
	
	this.freeBtnElm; // Free button element.

	this.fixityBtnElm; // Fixity button element.
	
	this.cvs; // Canvas object of html5.
	
	this.ctx; // A Context of canvas.
	
	var myself=this; // Instance of myself.

	/**
	 * initialized.
	 */
	this.constract=function(){
		
		// If Option property is empty, set a value.
		var param = setOptionIfEmpty(this.param);
		this.param = param;
		
		// Create panel element object.
		var panel = $(param.panel_slt);
		this.panel = panel;
		
		this.freeBtnElm = panel.find(param.free_btn_slt); // Free button element
		this.fixityBtnElm = panel.find(param.fixity_btn_slt); // Fixity button element
		
		// Get a canvas element object and a context.
		if(this.param['canvas_slt']){

			myself.cvs = $(this.param.canvas_slt);
			myself.ctx = myself.cvs[0].getContext('2d');
			
		}

		// initialize for panel.
		initPanel();
		
	};
	
	
	/**
	 * If Option property is empty, set a value.
	 * @param param :This class parameters.
	 */
	function setOptionIfEmpty(param){
		
		if(param == undefined){
			param = {};
		}
		
		// Set information on the canvas.
		param['sp_w'] = 16; // Space between panel and canvas.(width)
		param['sp_h'] = 16; // Same above.(height)
		param['head_h'] = 50; // Header height.
		
		
		// Panel element selector.
		if(param['panel_slt'] == undefined){
			throw new Error(" 'panel_slt' is nothing");
		}
		
		// Make panel name from panel selector.
		var panel_name = param['panel_slt'];
		panel_name = panel_name.replace(/[#.]/g, '');
		param['panel_name'] = panel_name;
		
		// Max panel size.(width)
		if(param['max_width'] == undefined){
			param['max_width'] = 1280;
		}

		// Max panel size.(height)
		if(param['max_height'] == undefined){
			param['max_height'] = 960;
		}

		// Min panel size.(width)
		if(param['min_width'] == undefined){
			param['min_width'] = 160;
		}
		
		// Min panel size.(height)
		if(param['min_height'] == undefined){
			param['min_height'] = 120;
		}
		
		// Free button element selector.
		if(param['free_btn_slt'] == undefined){
			param['free_btn_slt'] = '#' + panel_name + '_free_btn' ;
		}

		// Fixity button element selector.
		if(param['fixity_btn_slt'] == undefined){
			param['fixity_btn_slt'] = '#' + panel_name + '_fixity_btn' ;
		}
		
		// Initial relative position of panel element.(top)
		if(param['panel_top'] == undefined){
			param['panel_top'] = 50;
		}

		// Initial relative position of panel element.(left)
		if(param['panel_left'] == undefined){
			param['panel_left'] = 50;
		}
		
		// Canvas element selector.
		if(param['canvas_slt'] == undefined){
			param['canvas_slt'] = null;
		}
		
		return param;
	};
	
	
	
	
	/**
	 * initialize for panel.
	 */
	function initPanel(){
		
		// If the panel size is set,apply to panel.
		if(myself.param['panel_width']){
			myself.panel.outerWidth(myself.param['panel_width']);
		}
		if(myself.param['panel_height']){
			myself.panel.outerHeight(myself.param['panel_height']);
		}
		
		// Get size from panel element.
		myself.param['def_panel_width'] = myself.panel.outerWidth();
		myself.param['def_panel_height'] = myself.panel.outerHeight();
		myself.param['panel_width'] = myself.param['def_panel_width'];
		myself.param['panel_height'] = myself.param['def_panel_height'];

		
		// Change to free mode.（Make it Draggable）
		myself.onDraggable();

		// Make it resizable.
		myself.panel.resizable({
			maxWidth:myself.param.max_width,
			maxHeight:myself.param.max_height,
			minWidth:myself.param.min_width,
			minHeight:myself.param.min_height,
			stop: function( event, ui ) {
				
				//The mouse up event from resize.
				
				// Get the current size.
				var h=ui.size.height;
				var w=ui.size.width;
				
	
				// Calculate canvas size and set parameter.
				setSizeToCanvas(w,h);

				
			}
		});
	};
	
	
	
	
	/**
	 * Change to free mode.（Make it Draggable）
	 */
	this.onDraggable = function(){
		
		// Get a "Draggable" object of jQury.ui.
		var draggableDiv = myself.panel.draggable();
		
		// When making a draggable function, it becomes impossible to select text.
		// So , Make text selectable.
		$('.panel-body',draggableDiv).mousedown(function(ev) {
			  draggableDiv.draggable('disable');
			}).mouseup(function(ev) {
			  draggableDiv.draggable('enable');
			});
		
		// Get panel size.
		var panel_width = myself.param.panel_width;
		var panel_height = myself.param.panel_height;
		
		
		// Set the css style to panel element.
		myself.panel.css({
			'top':myself.param.panel_top + 'px',
			'left':myself.param.panel_left + 'px',
			'width':panel_width + 'px',
			'height':panel_height + 'px',
		});

		// Calculate canvas size and setting.
		setSizeToCanvas(panel_width,panel_height);
		
		// Switch button display.
		this.fixityBtnElm.show();
		this.freeBtnElm.hide();
	}
	
	/**
	 * Change to fixity mode.（Not make draggable.）
	 */
	this.offDraggable = function(){

		// Get a "Draggable" object of jQury.ui.
		var draggableDiv = myself.panel.draggable();
		
		// Not make draggable.
		draggableDiv.draggable('destroy');
		
		// Set css style for fixity mode.
		myself.panel.css({
			'position':'none',
			'top':'0px',
			'left':'0px',
			'width':'100%',
			'height':'100%',
		});

		// Switch button display.
		this.fixityBtnElm.hide();
		this.freeBtnElm.show();
		
		
		// Calculate canvas size and setting.
		setSizeToCanvas(myself.param.panel_width,myself.param.panel_height);
	
	}
	
	
	/**
	 * Calculate canvas size and setting.
	 * @param panel_width
	 * @param panel_height
	 */
	function setSizeToCanvas(panel_width,panel_height){
		
		// Calculate canvas size.
		var sp_w = myself.param.sp_w;
		var sp_h = myself.param.sp_h;
		var head_h = myself.param.head_h;
		var canvas_width = panel_width - (sp_w * 2);
		var canvas_height = panel_height - (sp_h * 2) - head_h;
		
		// Set canvas size to this class parameter.
		myself.param['canvas_width'] = canvas_width;
		myself.param['canvas_height'] = canvas_height;
		
		// Set canvas size to canvas element.
		if(myself.cvs){
			myself.cvs.width(canvas_width);
			myself.cvs.height(canvas_height);
			
		}

	}
	

	/**
	 * Get a context object of canvas.
	 * 
	 * @return Context object of canvas.
	 */
	this.getContext = function(){
		
		return myself.ctx;
	}
	
	
	
	
	
	
	
	
	
	
	// call constractor method.
	this.constract();
};