var fs = require('fs');


module.exports.saveMap = function(req,res){
	
	console.log(JSON.stringify(req.body));
	if(!req.body.name){
		msj = "El mapa no tiene nombre!";
		console.log(msj);
		res.send(msj);
	}else{
		fs.writeFile("./maps/"+req.body.name+".json", JSON.stringify(req.body), function(err) {
	    if(err) {
	    	res.send("Error saving map");
	        return console.log(err);
	    }
	    res.send("The file was saved!");
	    console.log("The file was saved!");
	}); 
	}
	
};

module.exports.loadMap= function(req,res){
	if(!req.params.name){
		res.status(500).json({error:'No se especifico el nombre'});
		return;
	}
	var filename = "./maps/"+req.params.name+".json";
	console.log(filename);
	fs.exists(filename,function(exist){
		if(exist){
			fs.readFile(filename,"utf8",function(err,data){
				var map = JSON.parse(data);
				res.json(map);
			});
		}else{
			res.status(404).json({error:'El mapa '+req.params.name+' no existe'});
		}
	});

}

module.exports.deleteMap=function  (req,res) {
	if(!req.params.name){
		res.status(500).json({error:'No se especifico el nombre'});
		return;
	}
	var filename = "./maps/"+req.params.name+".json";
	console.log(filename);
	fs.exists(filename,function(exist){
		if(exist){
			fs.unlink(filename,function(err){
				if(err) {res.status(500).json({error:"Error eliminado el mapa '"+req.params.name+"'"})}
				res.json({message:"Mapa eliminado"});
			});
		}else{
			res.status(404).json({error:'El mapa '+req.params.name+' no existe'});
		}
	});
}

module.exports.listMaps=function(req,res){
	fs.readdir('./maps/',function(err,files){
		if(err){
			res.status(500).json({error:"Error mostrando los archivos"});
			return;
		}
		res.json(files);
	});

}


