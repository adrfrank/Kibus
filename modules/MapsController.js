var fs = require('fs');


module.exports.saveMap = function(req,res){
	
	console.log(JSON.stringify(req.body));
	    
	fs.writeFile("./map.json", JSON.stringify(req.body), function(err) {
	    if(err) {
	        return console.log(err);
	    }
	    res.send(JSON.stringify(req.body));
	    console.log("The file was saved!");
	}); 
};



