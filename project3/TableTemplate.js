'use strict';
function TableTemplate(){}


TableTemplate.fillIn = function(id, dict) {

	var table = document.getElementById(id);
	var tbody = table.tBodies[0];
	var row = tbody.firstChild;
	while(row !== null) {
		var cell = row.firstChild;

		while(cell !== null) {
			var tp = new Cs142TemplateProcessor(cell.textContent);
	 		cell.textContent = tp.fillIn(dict);
	 		cell = cell.nextSibling;
	 	}
	 	row = row.nextSibling;
 	}

 	if(table.style.visibility === "hidden"){
 		table.style.visibility = "visible";
 	}
};