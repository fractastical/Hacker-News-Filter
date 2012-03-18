
var filters = Object();
	filters["default"] = 70; 
	filters["rails"] = 40;
	filters["heroku"] = 5;
	filters["salesforce"] = 4;
	filters["sap"] = 2;	
	filters["bitcoin"] = 150;	
	filters["python"] = 333;	
	filters["linux"] = 333;	
	
				
var tds = document.getElementsByTagName('td');
for(var index = 0; index < tds.length; index++)
{
	var td = tds[index];
	
	var score = 0;
	
	if (td.getAttribute('class') &&
		td.getAttribute('class').indexOf('title') != -1 && 
		td.firstChild && 
		td.firstChild.tagName == 'A')
	{
		
		if(td.parentNode &&
		   td.parentNode.nextSibling &&
		   td.parentNode.nextSibling.firstChild &&
		   td.parentNode.nextSibling.firstChild.nextSibling &&
		   td.parentNode.nextSibling.firstChild.nextSibling.getAttribute('class') &&
		   td.parentNode.nextSibling.firstChild.nextSibling.getAttribute('class').indexOf('subtext') != -1 &&
	       td.parentNode.nextSibling.firstChild.nextSibling.firstChild &&
	       td.parentNode.nextSibling.firstChild.nextSibling.firstChild.tagName == 'SPAN' &&
	       td.parentNode.nextSibling.firstChild.nextSibling.firstChild.innerText &&
	       td.parentNode.nextSibling.firstChild.nextSibling.firstChild.innerText.indexOf(' ') != -1 )
			  score = parseInt(td.parentNode.nextSibling.firstChild.nextSibling.firstChild.innerText.split(' ')[0]);



		if(hn_filter_match(td.firstChild.text, score)) 
		{
			var tr1 = td.parentNode;
			var tr2 = tr1.nextSibling;
			var tr3 = tr2.nextSibling;
			tr1.parentNode.removeChild(tr1);
			tr2.parentNode.removeChild(tr2);
			tr3.parentNode.removeChild(tr3);
		}
	}
}
function hn_filter_match(text, score)
{
		//console.log(text);
		//console.log(score);
		if(text.match("Best Ultrabook"))
			console.log("utra");
			
		var remove = false;
		
		if(score < filters["default"])
			remove = true;
			
		for (x in filters) {
			//console.log(x);
			if(x != "default" && text.match(x)) {
				console.log("MATCH" + x + " " + filters[x]);
				if(score < filters[x])
					remove = true;
				else
					remove = false;
				}
		}
		console.log(score + " " + remove);

		return remove;
}

