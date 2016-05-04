'use strict';

 function Cs142TemplateProcessor(template) {

 	this.fillIn = function(dict) {
 		var str = template;
 		for(var i = 0; i < Object.keys(dict).length; i++) {
 			var key = Object.keys(dict)[i];
 			var reg = "\\{\\{" + key + "\\}\\}";
 			var rgxp = new RegExp(reg, "ig");
 			str = str.replace(rgxp, dict[key] );
 		}

 		return str;
 	};

}