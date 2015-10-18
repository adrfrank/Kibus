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



