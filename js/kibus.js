// get mouse pos relative to canvas (yours is fine, this is just different)
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function lineaBres(x0, y0, x1, y1){

    var x, y, dx, dy,p, incE, incNE, stepx, stepy,cont=0;
    linea = [];
    dx = Math.abs(x1 - x0);
    dy = Math.abs(y1 - y0);
    /* determinar que punto usar para empezar, cual para terminar */
    if ( y0 > y1) stepy = -1;
    else stepy = 1;

    if (x0 > x1) stepx = -1;
    else stepx = 1;

    x = x0;
    y = y0;
    ++cont;
    //linea.push({x:x,y:y});

    /* se cicla hasta llegar al extremo de la línea */
    if(dx>dy){
        p = 2*dy - dx;
        incE = 2*dy;
        incNE = 2*(dy-dx);
        while (x != x1){
          x = x + stepx;
          if (p < 0){
            p = p + incE;
          }
          else {
            y = y + stepy;
            p = p + incNE;
          }
          ++cont;
    	  linea.push({x:x,y:y});
        }
    }
    else{
        p = 2*dx - dy;
        incE = 2*dx;
        incNE = 2*(dx-dy);
        while (y != y1){
          y = y + stepy;
          if (p < 0){
            p = p + incE;
          }
          else {
            x = x + stepx;
            p = p + incNE;
          }
          ++cont;
    	  linea.push({x:x,y:y});
        }
    }
    return linea;
  }

function Sprite(options){
	var that = $.extend({
		width: 16,
		height: 16,
		x: 0,
		y: 0,
		sx:0,
		sy:0,
		context: null,
		image: null,
		squareBase: 16,
		offset: 4,
		repaint: null,
		movements: [],
	},options);

    that.render = function (){
    	that.context.drawImage(
    		that.image,
    		that.sx,
    		that.sy,
    		that.width,
    		that.height + that.offset,  
    		that.x * that.squareBase ,
    		that.y * that.squareBase - that.offset,
    		that.width,
    		that.height + that.offset		
    	);
    };
    that.clearActual=function(){
    	if(that.repaint){
    		that.repaint(that.x,that.y,false);
    		that.repaint(that.x,that.y-1,false)
    	}
    };
    that.saveMove = function(move){
    	that.movements.push(move);
    };
    that.undoMove = function(){
    	if(that.movements.length == 0) return;
    	var move = that.movements.pop();
    	switch(move){
    		case 'U':
    			that.moveDown(true);
    			break;
    		case 'D':
    			that.moveUp(true);
    			break;
    		case 'L':
    			that.moveRight(true);
    			break;
    		case 'R':
    			that.moveLeft(true);
    			break;
    	}
    }
    that.moveRight= function  (ignoreMove) {
    	that.clearActual();
    	if(that.x < that.parent.cols-1 && !that.parent.obstacleOnCoord(that.x+1,that.y)){ 
    		that.x++;
    		if(!ignoreMove)
    		that.saveMove('R');
    	}
    	that.render();
    };
    that.moveLeft= function  (ignoreMove) {
    	that.clearActual();
    	if(that.x > 0 && !that.parent.obstacleOnCoord(that.x-1,that.y)){
    		that.x--;
    		if(!ignoreMove)
    		that.saveMove('L');
    	}
    	that.render();
    };
    that.moveUp= function  (ignoreMove) {
    	that.clearActual();
    	if(that.y > 0 && !that.parent.obstacleOnCoord(that.x,that.y-1)){
    		that.y--;
    		if(!ignoreMove)
    		that.saveMove('U');
    	}
    	that.render();
    }
    that.moveDown= function  (ignoreMove) {
    	that.clearActual();
    	if(that.y < that.parent.rows-1 && !that.parent.obstacleOnCoord(that.x,that.y+1)){
    		that.y++;
    		if(!ignoreMove)
    		that.saveMove('D');
    	}
    	that.render();
    };
    that.setCoord = function(x,y){
    	that.clearActual();
    	that.x = x;
    	that.y = y;
    	that.lastPos = {x:x,y:y};
    }
	return that;
};

var auxdy = [-1,-1,-1,0,0,0,1,1,1];
var auxdx = [-1,0,1,-1,0,1,-1,0,1];

var kbw = {
	$container : null,
	$canvas : null,
	ctx: null,
	cols:50,
	rows:30,	
	squareBase: 16,
	phase: 3,
	isPlaying: false,
	assets: {},
	houseCoords: {x:1,y:1},
	lastPointer: {x:0,y:0},
	backgroundMatrix: [],
	obstacleMatrix: [],
	flags: {},
	heat: {},
	calculateHeat: true,
	maxHeat: 50,
	flagsForObstacle:3,
	isDown: false,
	kibus: null,
	sleepTime: 1,
	evaluateFlags: true,
	keysEnabled: false,
	moveKibusWithHouse: false,
	renderHeat: true,
	pause :true,
	nit:3,
	testCtx: function(){
		this.ctx.moveTo(0,0);
		this.ctx.lineTo(200,100);
		this.ctx.stroke();
	},
	bindings: function(){
		this.$container.find("#Phase").on("change",function  (evt) {
			var ctrl = $(evt.target);
			kbw.changePhase(ctrl.val())
		});
		this.$canvas.off('mousedown').on('mousedown', function(e){
			if(!kbw.pause)return;
		    var pos = getMousePos(kbw.$canvas[0], e);
		    var x= Math.floor( pos.x / kbw.squareBase );
		    var y= Math.floor( pos.y / kbw.squareBase );
		    
		    var tool = kbw.getToolSelected();
		    switch(tool){
		    	case "house":
		    		kbw.setHouse(x,y);
		    		if(kbw.calculateHeat == true){
		    			kbw.fillHeat();
		    		}
		    		if(kbw.moveKibusWithHouse ==true)
		    		{
		    			kbw.kibus.setCoord(x,y);
		    			kbw.kibus.render();
		    		}
		    		break;
		    	case "bg":
		    		kbw.clearOn(x,y);
		    		break;
		    	case "obs":
		    		kbw.setObstacle(x,y);
		    		break;
		    	case "kibus":
		    		if(kbw.moveKibusWithHouse == true)
		    			kbw.setHouse(x,y);
		    		kbw.kibus.setCoord(x,y);
		    		kbw.kibus.render();
		    		break;
		    }
		    kbw.isDown = true;
		});
		this.$canvas.off('mouseup').on('mouseup',function  (e) {
			if(!kbw.pause)return;
			var pos = getMousePos(kbw.$canvas[0], e);
		    var x= Math.floor( pos.x / kbw.squareBase );
		    var y= Math.floor( pos.y / kbw.squareBase );
		    kbw.isDown = false;
		})
		this.$canvas.off('mousemove').on('mousemove', function(e){
			if(!kbw.pause)return;
		    var pos = getMousePos(kbw.$canvas[0], e);
		    var x= Math.floor( pos.x / kbw.squareBase );
		    var y= Math.floor( pos.y / kbw.squareBase );
		    
		    var tool = kbw.getToolSelected();
		    if(kbw.isDown)
		    switch(tool){
		    	case "house":
		    		kbw.setHouse(x,y);
		    		if(kbw.calculateHeat == true){
		    			kbw.fillHeat();
		    		}
	    			if(kbw.moveKibusWithHouse == true)
	    				kbw.kibus.setCoord(x,y);
		    		break;
		    	case "bg":
		    		kbw.clearOn(x,y);		    			
		    		break;
		    	case "obs":
		    		kbw.setObstacle(x,y);		    			
		    		break;
		    	case "kibus":
		    		if(kbw.moveKibusWithHouse == true)
		    			kbw.setHouse(x,y);
		    		kbw.kibus.setCoord(x,y);		    		
		    		break;

		    }
		    kbw.showPointer(x,y);
		});
		this.$container.find("#btnReset").off("click").on("click",function  (e) {
			kbw.initPhase();
		});
		this.$container.find("#btnObs").off("click").on("click",function  (e) {
			kbw.generateObstacles(parseInt(kbw.$container.find("#PercObs").val()));
		})
		this.$container.find("#PercObs").off("change").on("change",function  (e) {
			kbw.$container.find("#txtPercObs").text($(e.target).val() +"%");
		});
		this.$container.find("#btnHome").off("click").on("click",function  (e) {
			console.log("Get back kibus!!");
			kbw.getBack();
		})
		this.$container.find("#btnStep").on("click",kbw.phase2Step);
		this.$container.find("#btnPause").on("click",kbw.pausePhase);

		this.$container.find("#Vel").off("change").on("change",function  (e) {
			kbw.sleepTime =  parseInt($(e.target).val());
		})
		this.$container.find("#btn-load-map").on("click",kbw.loadMaps);
		this.$container.find("#btn-save-map").on("click",kbw.saveMap);
		$("#tbl-maps").on("click",".btn-load",kbw.loadMap);
		$("#tbl-maps").on("click",".btn-delete",kbw.deleteMap);
		$(document).off("keydown").on("keydown",function  (e) {
			if(kbw.keysEnabled==false) return true	;
			//console.log(e.keyCode);
			//console.log(e);
			switch(e.keyCode){
				case 37:
					kbw.kibus.moveLeft();
					break;
				case 38:
					kbw.kibus.moveUp();
					break;
				case 39:
					kbw.kibus.moveRight();
					break;
				case 40:
					kbw.kibus.moveDown();
					break;	
			}
		})
	},

	init: function(){
		this.$container = $("#container");
		this.$canvas = this.$container.find("canvas");		
		
		this.ctx = this.$canvas[0].getContext("2d");
		this.$canvas[0].width = this.cols * this.squareBase;
		this.$canvas[0].height = this.rows * this.squareBase;
		this.$canvas.css("height", this.squareBase * this.rows);
		this.$canvas.css("width", this.squareBase * this.cols);
		this.loadAssets();
		this.initPhase();
		this.bindings();
	},
	initPhase: function(){
		this.kibus = new Sprite({
			image: kbw.assets['girl'], 
			context: this.ctx, 
			x:this.houseCoords.x,
			y:this.houseCoords.y,
			repaint: kbw.repaint,
			parent: kbw
		});
		this.flagsForObstacle = 3;
		this.flags = {};
		this.heat = {};
		this.bees = [];
		this.loadBackground();
		this.initObstacleMatrix();
		this.drawHouse();		
		if(kbw.calculateHeat == true){
			kbw.fillHeat();
		}
		this.kibus.render();
		kbw.enableDisableControls();
	},
	enableDisableControls: function(){
		var ctrls = $("#Phase")
			.add($(".btn-tools .btn"))
			.add($("#btn-save-map"))
			.add($("#btnHome"))
			.add($("#PercObs"))
			.add($("#btn-load-map"))
			.add($("#btnObs"))
			.add($("#btnReset"))
		var other = $("#btnPause")
		if(!kbw.pause){
			ctrls.prop("disabled",true).addClass("disabled");
			other.prop("disabled",false).removeClass("disabled");
		}else
		{
			ctrls.prop("disabled",false).removeClass("disabled");
			other.prop("disabled",true).addClass("disabled");
		}
	},
	changePhase: function(phase){
		console.log("Phase changed: "+phase);
		kbw.phase = parseInt(phase);
		kbw.initPhase();
		kbw.keysEnabled = false;
		kbw.moveKibusWithHouse = false;
		kbw.evaluateFlags = true;
		kbw.calculateHeat = false;
		kbw.renderHeat = false;
		switch(kbw.phase){
			case 1:
				kbw.keysEnabled = true;
				kbw.moveKibusWithHouse = true;
				kbw.evaluateFlags = false;
				break;
			case 2: 

				break;
			case 3:
				kbw.evaluateFlags = false;
				kbw.calculateHeat = true;
				kbw.renderHeat = true;
				break;
		}		
	},
	getToolSelected: function  (e) {
		return kbw.$container.find("input[name=elem]:checked").val();
	},
	load:function  (name) {
		var img = new Image();
			img.src = name+'.png';
			kbw.assets[name] = img;
	},
	loadAssets: function  () {
		for(var i=0; i <6 ; ++i){
			var title = 'bg'+i;
			kbw.load(title);
		}
		for(var i=1; i <=8 ; ++i){
			var title = 'house'+i;
			kbw.load(title);
		}
		kbw.load('houseCenter');
		kbw.load('houseCenterTop');
		kbw.load('rock');
		kbw.load('pointer');
		kbw.load('cave');
		kbw.load('girl');
		kbw.load('bee');
	},
	initObstacleMatrix: function(){
		for(var i=0; i < kbw.cols; ++i){
			for(var j=0; j < kbw.rows; ++j){
				if(!kbw.obstacleMatrix[i]) kbw.obstacleMatrix[i] = [];
				kbw.obstacleMatrix[i][j] = false;
			}
		}
	},
	loadBackground: function(){
		//debugger;
		this.backgroundMatrix = [];
		for(var i=0; i < kbw.cols; ++i){
			for(var j=0; j < kbw.rows; ++j){
				var num = Math.floor(Math.random()*26);
				if(num < 6)
					num = 0
				else if(num < 12)
					num = 1
				else if(num < 18)
					num = 2
				else if(num < 24)
					num = 3
				else if(num < 25)
					num = 4
				else 
					num = 0
				if(!this.backgroundMatrix[i]) this.backgroundMatrix[i] = []
				this.backgroundMatrix[i][j]=num;
				kbw.imageOn('bg'+num,i,j);				
			}
		}		
	},
	imageOn:function(asset,x,y){
		kbw.ctx.drawImage(
			kbw.assets[asset],
			0,
			0,
			kbw.squareBase,
			kbw.squareBase,
			x*kbw.squareBase, 
			y*kbw.squareBase,
			kbw.squareBase,
			kbw.squareBase
			);
	},
	getBack: function  () {
		kbw.pause = false;
		kbw.enableDisableControls();
		switch(kbw.phase){
			case 1:
				kbw.getBackPhase1();
				break;
			case 2: 
				kbw.getBackPhase2();
				break;
			case 3:
				kbw.getBackPhase3();
				break;
		}
	},
	getBackPhase1:function(){
		if(kbw.kibusInHome()){
			kbw.movements=[];
			return;
		}else if(kbw.kibus.movements.length > 0){
			kbw.kibus.undoMove();
			setTimeout(kbw.getBackPhase1,kbw.sleepTime);
		}
	},	
	getBackPhase3: function(){
		if(kbw.pause)
		{
			return;
		}
		if(kbw.kibusInHome()){
			kbw.bees = [];
			kbw.c = null;			
			return;
		}else {		
			kbw.phase3Step();
			setTimeout(kbw.getBackPhase3,kbw.sleepTime);
		}

	},
	phase3Step:function(){
		if(!kbw.iteration) kbw.iteration =0;
		if(kbw.iteration <= 5){
			if(kbw.iteration == 0){
				kbw.dy = [-1,-1,-1, 0,0, 1,1,1];
				kbw.dx = [-1, 0, 1,-1,1,-1,0,1];				
				kbw.movements= [];
				kbw.c = {x:kbw.kibus.x,y:kbw.kibus.y};
				kbw.prop = false;
				kbw.retroprop = false;
				kbw.propCount = 0;
				kbw.retropropCount =0;
				kbw.bees = [[],[],[],[],[]];
			}
			if(!kbw.prop&& !kbw.retroprop){
				for(var i=0; i < 5;++i){
					var n={};
					do{
						if(kbw.iteration > 0){
							kbw.c = kbw.bees[i][kbw.iteration-1];
						}
						var x= parseInt(Math.random()*8);
						n = {
							x: kbw.c.x +kbw.dx[x],
							y: kbw.c.y +kbw.dy[x],
						}
					}while(n.x<0||n.x>=kbw.cols||n.y<0||n.y>=kbw.rows|| kbw.obstacleOnCoord(n.x,n.y));
					kbw.bees[i].push(n);
				}
				//verify home
				for(var i in kbw.bees){
					for(var j in kbw.bees[i]){
						var bc =  kbw.bees[i][j];
						if(bc.x == kbw.houseCoords.x && bc.y == kbw.houseCoords.y){
							kbw.iteration = 6;
							kbw.movements = jQuery.extend([],kbw.bees[i]);
							return;
						}
					}
				}	

				//compare last position
				for(var i in kbw.bees){
					var eq=false;
					var last = kbw.bees[i][kbw.bees[i].length-1];
					for(var j=0; j < kbw.bees[i].length-1; ++j){
						if(kbw.bees[i][j].x == last.x && kbw.bees[i][j].y == last.y){
							kbw.heat[ kbw.bees[i][j].x+','+kbw.bees[i][j].y ] -= kbw.nit;
							kbw.heat[ last.x+','+last.y ] -= kbw.nit;
							eq = true;
							break;
						}
					}
					if(eq) break;
				}

				kbw.prop = true;
				kbw.iteration ++;
				kbw.retropropCount = kbw.iteration;
				kbw.propCount = 0;
				kbw.kibus.render();
			}else if(kbw.prop&& !kbw.retroprop){
				for(var i in kbw.bees){
					var bee = kbw.bees[i][kbw.propCount];
					if(kbw.propCount>0)
						kbw.repaint(kbw.bees[i][kbw.propCount-1].x,kbw.bees[i][kbw.propCount-1].y);
					kbw.imageOn('bee',bee.x,bee.y);
					kbw.kibus.render();
				}
				
				kbw.propCount ++;
				if(kbw.propCount == kbw.iteration){
					kbw.retroprop=true;
				}
			}else if(kbw.prop&& kbw.retroprop){
				for(var i in kbw.bees){
					var bee = kbw.bees[i][kbw.retropropCount-1];
					kbw.repaint(bee.x,bee.y);
					if(kbw.retropropCount>1){
						bee = kbw.bees[i][kbw.retropropCount-2]
						kbw.imageOn('bee',bee.x,bee.y);
					}
					kbw.kibus.render();
				}
				kbw.retropropCount --;
				if(kbw.retropropCount==0){
					kbw.prop = false;
					kbw.retroprop = false;	
					//debugger;
					//get best bee
					var bestbee = [];
					var bestHeat=-999;
					for(var i in kbw.bees){
						var bee = kbw.bees[i];
						if(kbw.heat[bee[kbw.iteration-1].x+','+bee[kbw.iteration-1].y]==bestHeat){
							var exist = false;
							for(var j in bestbee){
								if(bestbee[j][kbw.iteration-1].x ==  bee[kbw.iteration-1].x 
									&&bestbee[j][kbw.iteration-1].y ==  bee[kbw.iteration-1].y)
								{exist = true; break;}
							}
							if(!exist)
								bestbee.push(jQuery.extend({}, bee));							
						}else if(kbw.heat[bee[kbw.iteration-1].x+','+bee[kbw.iteration-1].y]>bestHeat){
							bestbee = [jQuery.extend({}, bee)];
							bestHeat = kbw.heat[bee[kbw.iteration-1].x+','+bee[kbw.iteration-1].y]
						}
					}
					kbw.movements = jQuery.extend([], bestbee[parseInt(Math.random()*bestbee.length)]) ;
					for(var i in kbw.bees){
						kbw.bees[i] = jQuery.extend([], bestbee[parseInt(Math.random()*bestbee.length)]);
					}

				}
			}			
		}else{
			if(kbw.movements.length>0){
				kbw.kibus.setCoord(kbw.movements[0].x,kbw.movements[0].y);
				kbw.kibus.render();
				kbw.movements.splice(0,1);
			}else{
				kbw.iteration =0;
			}		
			
		}
		
		

	},
	fillHeat: function(){
		var dy = [-1,-1,-1,0,0,1,1,1];
		var dx = [-1,0,1,-1,1,-1,0,1];
		kbw.iteration =0;
		kbw.movements= [];
		visited = {};
		kbw.heat[kbw.houseCoords.x+','+kbw.houseCoords.y] = kbw.maxHeat;
		queue = [];
		queue.push(kbw.houseCoords);
		while(queue.length > 0){
			var c =  queue[0];
			queue.splice(0,1);
			for(var i=0; i < 8;++i){
				var n = {
					x: c.x +dx[i],
					y: c.y +dy[i],
				}
				if(n.x>=0 && n.x < kbw.cols && n.y>=0 && n.y < kbw.rows  && !visited[n.x+','+n.y] ){
					visited[n.x+','+n.y] = true;
					kbw.heat[n.x+','+n.y] = kbw.heat[c.x+','+c.y]-1;
					kbw.repaint(n.x,n.y);
					queue.push(n);
				}
			}

		}
		console.log("Heat generated");
	},
	setFlag:function(n){
		if(!n)n=1
		if(!kbw.flags[kbw.kibus.x+","+kbw.kibus.y])
			kbw.flags[kbw.kibus.x+","+kbw.kibus.y]=0;
		kbw.flags[kbw.kibus.x+","+kbw.kibus.y]+=n;
	},
	isSurroundedByObstacles: function  () {
		var surrounded = true;
		var x = kbw.kibus.x, y= kbw.kibus.y;
		return kbw.obstacleOnCoord(x-1,y-1)	
			&& kbw.obstacleOnCoord(x-1,y)
			&& kbw.obstacleOnCoord(x-1,y+1)
			&& kbw.obstacleOnCoord(x,y-1)
			&& kbw.obstacleOnCoord(x,y+1)
			&& kbw.obstacleOnCoord(x+1,y-1)
			&& kbw.obstacleOnCoord(x+1,y)
			&& kbw.obstacleOnCoord(x+1,y+1);
	},
	phase2Step: function(){
		if(kbw.kibus.movements.length > 0){
			var nextm = kbw.kibus.movements[0];
			kbw.kibus.movements.splice(0,1);
			if(kbw.obstacleOnCoord(nextm.x,nextm.y)){
				kbw.setFlag();				
				var rmove = {};
				if(kbw.isSurroundedByObstacles()){
					//alert("paso algo malo");
					kbw.setFlag(1000); // this place is very bad
					//kbw.flagsForObstacle++; // second chance for all
					//get best coord
					rmove = kbw.getRandomBest();
				}else{
					var contLastCoord=0;
					do{						
						rmove =  kbw.getRandomBest();
						if(kbw.kibus.lastPos.x == rmove.x && kbw.kibus.lastPos.y == rmove.y && contLastCoord++ < 10)continue;
					}while(!kbw.isSurroundedByObstacles() && kbw.obstacleOnCoord(rmove.x,rmove.y));
				}
				kbw.kibus.setCoord(rmove.x,rmove.y);
				kbw.kibus.render();
				kbw.kibus.movements = lineaBres(kbw.kibus.x, kbw.kibus.y, kbw.houseCoords.x, kbw.houseCoords.y);
			}else{
				kbw.kibus.setCoord(nextm.x, nextm.y);
				kbw.kibus.render();
			}			
		}else{ //calculate next movements
			kbw.kibus.movements = lineaBres(kbw.kibus.x, kbw.kibus.y, kbw.houseCoords.x, kbw.houseCoords.y);
			
		}
	},
	getRandomBest:function(){
		var rbest = null, fbest=Infinity;
		for(var i=0; i <9; ++i){
			if(auxdx[i] != 0 || auxdy[i] != 0){
				var c = { 	x:kbw.kibus.x + auxdx[i],
							y:kbw.kibus.y + auxdy[i], }
				c.x = Math.min(kbw.cols-1,Math.max(c.x,0));
				c.y = Math.min(kbw.rows-1,Math.max(c.y,0));
				if(!kbw.obstacleMatrix[c.x][c.y] && kbw.flagsOnCoord(c.x,c.y)<fbest){
					fbest = kbw.flagsOnCoord(c.x,c.y);
					rbest = [c];
				}else if(!kbw.obstacleMatrix[c.x][c.y] && kbw.flagsOnCoord(c.x,c.y) == fbest){
					rbest.push(c);
				}
			}
		}
		return rbest[parseInt(Math.random()*rbest.length)];
	},
	pausePhase: function(){
		if(kbw.pause){
			kbw.pause = false;
			kbw.enableDisableControls();
			kbw.getBack();
		}else{			
			kbw.pause = true;
			kbw.enableDisableControls();
		}

	},
	getBackPhase2: function(){
		if(kbw.pause)
		{
			return;
		}
		if(kbw.kibusInHome()){
			kbw.movements=[];
			return;
		}else {
			kbw.phase2Step();
			setTimeout(kbw.getBackPhase2,kbw.sleepTime);
		}
	},
	kibusInHome: function  () {
		return kbw.houseOnCoord(kbw.kibus.x,kbw.kibus.y);
	},
	randomMove:function(){
		return {
			x: Math.min(kbw.cols-1, Math.max(0,kbw.kibus.x + Math.floor(Math.random()*3)-1)),
			y: Math.min(kbw.rows-1, Math.max(0,kbw.kibus.y + Math.floor(Math.random()*3)-1))
		}
	},
	setHouse: function(x,y){
		kbw.clearHouse();
		kbw.houseCoords.x = x;
		kbw.houseCoords.y = y;
		if(!kbw.isDown && x >= 0 && y >= 0)
			kbw.obstacleMatrix[x][y] = false;
		kbw.drawHouse();
	},
	clearHouse: function(){
		var x = kbw.houseCoords.x, y = kbw.houseCoords.y;		
		for(var i=x-1; i<=x+1;++i){
			for(var j=y-1; j <= y+1; ++j)
				if(i>=0 && j>=0 && i < kbw.cols && j < kbw.rows){
					kbw.imageOn('bg'+kbw.backgroundMatrix[i][j],i,j);
					if(kbw.obstacleMatrix[i][j] == true)
						kbw.imageOn('rock',i,j);
				}
		}		
	},
	drawHouse: function(){
		var x = kbw.houseCoords.x, y = kbw.houseCoords.y;
		kbw.imageOn('house1',x-1,y-1);
		kbw.imageOn('house2',x,y-1);
		kbw.imageOn('house3',x+1,y-1);
		kbw.imageOn('house4',x-1,y);
		kbw.imageOn('house5',x+1,y);
		kbw.imageOn('house6',x-1,y+1);
		kbw.imageOn('house7',x,y+1);
		kbw.imageOn('house8',x+1,y+1);
		kbw.imageOn('cave',x,y);
		//kbw.imageOn('houseCenterTop',x,y-1);
		for(var i=x-1; i<=x+1;++i){
			for(var j=y-1; j <= y+1; ++j){
				if(i>=0 && j>=0 && i < kbw.cols && j < kbw.rows){
					if(kbw.obstacleMatrix[i][j] == true){
						kbw.imageOn('rock',i,j);						
					}
				}
				kbw.drawHeat(i,j);
			}
		}

	},
	setObstacle: function function_name (x,y) {
		if(x<0||x>kbw.cols||y<0||y>kbw.rows) return;
		kbw.obstacleMatrix[x][y] = true;
		if(kbw.houseCoords.x == x && kbw.houseCoords.y == y )
			kbw.setHouse(-2,-2);
		kbw.imageOn('rock',x,y);
	},
	obstacleOnCoord: function(x,y){
		if(x<0||x>=kbw.cols||y<0||y>=kbw.rows) return true;
		return kbw.obstacleMatrix[x][y] == true || (kbw.evaluateFlags && kbw.flags[x+","+y] >= kbw.flagsForObstacle);
	},
	flagsOnCoord: function(x,y){
		return kbw.flags[x+","+y]?kbw.flags[x+","+y]:0;
	},
	houseOnCoord: function(x,y){
		return kbw.houseCoords.x == x && kbw.houseCoords.y == y;
	},
	generateObstacles: function(perc){

		var n = parseInt( perc / 100 * kbw.cols * kbw.rows );
		console.log("Porcentaje: ",perc);
		console.log("Total: ",  kbw.cols * kbw.rows);
		console.log("Porcentaje",perc / 100);
		console.log("Perc n",perc / 100 * kbw.cols * kbw.rows)
		kbw.initObstacleMatrix();
		kbw.loadBackground();

		for(var i=0; i < n; ++i){
			var rx=0,ry=0;
			var maxtry=10000;
			do{
				rx = parseInt(Math.random() * kbw.cols);
				ry = parseInt(Math.random() *  kbw.rows);
				if(maxtry-- < 0) break;
			}while(kbw.houseOnCoord(rx,ry) || kbw.obstacleOnCoord(rx,ry));
			kbw.setObstacle(rx,ry);
		}
		kbw.drawHouse();
		kbw.kibus.setCoord(kbw.houseCoords.x,kbw.houseCoords.y);
		kbw.kibus.movements = [];
		kbw.kibus.render();
	},
	clearOn: function  (x,y) {
		if(x<0||x>kbw.cols||y<0||y>kbw.rows) return;
		kbw.obstacleMatrix[x][y] = false;
		if(kbw.houseCoords.x == x && kbw.houseCoords.y == y )
			kbw.setHouse(-2,-2);
	},
	showPointer: function(x,y){		
		kbw.repaint(kbw.lastPointer.x,kbw.lastPointer.y);
		if(x>=0 && y>=0 && x < kbw.cols && y < kbw.rows){
			kbw.imageOn('pointer',x,y);
			kbw.lastPointer = {x:x,y:y};
		}
		kbw.kibus.render();
	},
	repaint: function(x,y,avoidKibus){
		if(x<0||x>kbw.cols||y<0||y>kbw.rows) return;
		kbw.imageOn('bg'+kbw.backgroundMatrix[x][y],x,y);
		kbw.drawHouse();
		if(kbw.obstacleMatrix[x][y] === true)
			kbw.imageOn('rock',x,y);
		if(kbw.flags[x+","+y] >= kbw.flagsForObstacle)
			kbw.imageOn('bg5',x,y);
		kbw.drawHeat(x,y);
		//kbw.kibus.render();
	},
	drawHeat: function(x,y){
		if(kbw.renderHeat){
			var heat = kbw.heat[x+','+y] / kbw.maxHeat * 0.6;
			var color = 'rgba(255,0,0,'+heat+')';
			kbw.ctx.fillStyle = color;
			kbw.ctx.fillRect(x*kbw.squareBase,y*kbw.squareBase,kbw.squareBase,kbw.squareBase);
		}
	},
	saveMap: function(){
		
		var d = {
				rows: kbw.rows,
				cols: kbw.cols,
				obstacles:JSON.stringify(kbw.obstacleMatrix),
				house: kbw.houseCoords,
				kibus: {x: kbw.kibus.x, y: kbw.kibus.y},
				name: prompt("Nombre del mapa")
			};

		
		console.log(d);
		$.ajax({
			url:'/saveMap',
			data: d,
			type:'POST',
			contenType: 'application/json'
		}).done(function  (xhr) {
			console.log(xhr);
		}).error(function  (err) {
			console.log("Error",err);
		});
	},
	loadMap: function(e){
		var name = $(e.target).closest("tr").find(".map-name").html();
		console.log("load: "+name);
		$.ajax({
			url:'/loadMap/'+name,
			type:'POST',
			dataType:'json',
			contenType: 'application/json'
		}).done(function  (map) {
			kbw.rows = parseInt(map.rows);
			kbw.cols = parseInt(map.cols); 
			kbw.initPhase();
			kbw.obstacleMatrix = JSON.parse(map.obstacles);
			for(var i=0; i < kbw.rows; ++i){
				for(var j=0; j < kbw.cols; ++j){
					if(kbw.obstacleMatrix[j][i] == true)
						kbw.setObstacle(j,i);
				}
			}
			kbw.setHouse(parseInt(map.house.x), parseInt(map.house.y));
			kbw.fillHeat();
			kbw.kibus.setCoord(parseInt(map.kibus.x), parseInt( map.kibus.y));
			kbw.kibus.render();			
			$("#maps-modal").modal("hide");
			
			
		}).error(function  (err) {
			console.log("Error",err);
		});
	},
	loadMaps: function(e){
		$.ajax({
			url:'/maps',
			type:'POST',
			dataType:'json',
			contenType: 'application/json'
		}).done(function  (data) {
			if(data.error){
				console.log(data.error)
			}else{
				console.log(data);
				var tpl = $($("#map-tpl").html());
				var table = $("#tbl-maps tbody").empty();
				var maps=[]
				for(var i in data){
					var map = data[i];
					var maprow = tpl.clone();
					maprow.find(".map-name").html(map.split('.')[0]);
					maps.push(maprow);
				}
				table.html(maps);

			}
		}).error(function  (err) {
			console.log("Error",err);
		});
	},
	deleteMap: function(e){
		var name = $(e.target).closest("tr").find(".map-name").html();
		console.log("deleting: "+name);
		$.ajax({
			url:'/deleteMap/'+name,
			type:'POST',
			dataType:'json',
			contenType: 'application/json'
		}).done(function  (map) {
			if(map , map.message) alert(map.message);
			$(e.target).closest("tr").remove();
			console.log(map);			
		}).error(function  (err) {
			console.log("Error: ",err);
		});

	}
};



 // $(window.applicationCache).on('cached error noupdate',function  (e) {
 // 	console.log("!!: "+e.type,e);
	// kbw.init();
 // });

// $(document).ready(function  (e) {
// kbw.init();
// })

kbw.init();
