'use strict';

function DatePicker(id, fn) {
	

	this.render = function(dt) {
		var element = document.getElementById(id);
		element.innerHTML="";
		var table = document.createElement("TABLE");
		element.appendChild(table);

		/* Create Table */

		// Create <  > arrows //

		var arrows = table.insertRow(0);
		var arrow0 = arrows.insertCell(0);
		var arrow1 = arrows.insertCell(1);
		var arrow2 = arrows.insertCell(2);
		arrow0.innerHTML = "<div id="+id+id+"> &lt; </div>";
		arrow2.innerHTML = "<div id="+id+id+id+"> &gt; </div>";

		arrow1.colSpan = "5";

		// Add and center inner text //

		var monthNames = ["January", "February", "March", "April", "May", "June", 
			"July", "August", "September", "October", "November", "December"
			];

		var txt = "<center> " + monthNames[dt.getMonth()] + " " + dt.getFullYear() + " </center> ";
		arrow1.innerHTML = txt;

		// Add < > eventlisteners //
		var lt = document.getElementById(id+id);
		lt.addEventListener("click", function() {
			var mo = dt.getMonth();
			if(mo > 0) {
				dt.setMonth(mo-1);
			} else {
				dt.setMonth(11);
				dt.setFullYear(dt.getFullYear() -1);
			}

			this.render(new Date(dt));
		}.bind(this));

		var gt = document.getElementById(id+id+id);
		gt.addEventListener("click", function() {
			var mo = dt.getMonth();
			if(mo < 11) {
				dt.setMonth(mo+1);
			} else {
				dt.setMonth(0);
				dt.setFullYear(dt.getFullYear() + 1);
			}
			this.render(new Date(dt));
		}.bind(this));


		// Create Header for days of week //
		var header = table.insertRow(1);
		var cell0 = header.insertCell(0);
		var cell1 = header.insertCell(1);
		var cell2 = header.insertCell(2);
		var cell3 = header.insertCell(3);
		var cell4 = header.insertCell(4);
		var cell5 = header.insertCell(5);
		var cell6 = header.insertCell(6);

		cell0.innerHTML = "Su";
		cell1.innerHTML = "Mo";
		cell2.innerHTML = "Tu";
		cell3.innerHTML = "We";
		cell4.innerHTML = "Th";
		cell5.innerHTML = "Fr";
		cell6.innerHTML = "Sa";


		// Create rest of calendar //
		var date = new Date(dt.valueOf());
		var month = date.getMonth();

		date.setDate(1);
		var newLine = false;
		var line = table.insertRow(2);
		var lineNum = 2;

		while(true) {
			var dayOfWeek = date.getDay();

			if(newLine) {
				lineNum++;
				line = table.insertRow(lineNum);
				newLine = false;
			}

			// Insert blank cells for first week
			if(date.getDate() === 1) {
				var dat = new Date(date.valueOf());
				dat.setDate(0);
				var numPrevDays =  dat.getDate();
				for(var i = 0; i < dayOfWeek; i++) {
					var k = line.insertCell(i);
					var d = numPrevDays - date.getDay() + i + 1;
					k.innerHTML = "<div class='dim'> " + d + "</div>";

				}
			}

			// Check the day of the week and insert a cell with that number
			if(dayOfWeek === 6){ newLine = true; }
			var cell = line.insertCell(dayOfWeek);
			cell.innerHTML = date.getDate();

			var mm = date.getMonth() + 1;
			var dd = date.getDate();
			var yyyy = date.getFullYear();

			this.createCallbackListener(cell,id,mm,dd,yyyy, fn);

			date.setDate(date.getDate() + 1);
			if(date.getMonth() !== month) {
				if(dayOfWeek === 6){ break; }
				var j = 1;
				for(var s = date.getDay()+1; s < 8; s++) {
					var t = line.insertCell(s-1);
					t.innerHTML = "<div class='dim'> " + j + "</div>";
					j++;
				}
				break;
			}
		}

	};
}

DatePicker.prototype.createCallbackListener = function(cell,id,mm,dd,yyyy, fn) {
	cell.addEventListener("click", function(){	

		fn(id, {"month": mm, "day": dd, "year": yyyy});
	});
};