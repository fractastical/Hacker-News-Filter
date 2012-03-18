
var filters = Object();
	filters["default"] = 100; 
	filters["rails"] = 40;
	filters["python"] = 10;	
	filters["linux"] = 10;	
	filters["bitcoin"] = 150;	
	filters["heroku"] = 5;
	filters["salesforce"] = 5;
	
				
var tds = document.getElementsByTagName('td');
var tdsToRemove = Array();
for(var index = 0; index < tds.length; index++)
{
	console.log(index + ":" + tds.length);

	var td = tds[index];
	var score = 0;
	
	if (td.getAttribute('class') &&
		td.getAttribute('class').indexOf('title') != -1 && 
		td.firstChild && 
		td.firstChild.tagName == 'A')
	{
		console.log(td.firstChild.text);
		
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

		if(score == 0)
			console.log("err" + td.firstChild.text);
		//console.log(td.firstChild.text);

		if(score == 0 && td.firstChild.text == "More")
			console.log("load morrrrr");

		if(score != 0 && hn_filter_match(td.firstChild.text, score)) 
		{
			tdsToRemove.push(td);
		}
	}
}
for (x in tdsToRemove) {

	var td = tdsToRemove[x];
	var tr1 = td.parentNode;
	var tr2 = tr1.nextSibling;
	var tr3 = tr2.nextSibling;

	tr1.parentNode.removeChild(tr1);
	tr2.parentNode.removeChild(tr2);
	tr3.parentNode.removeChild(tr3);
	
}
function hn_filter_match(text, score)
{			
		var remove = false;
		
		if(score < filters["default"])
			remove = true;
			
		for (x in filters) {
			
			if(x != "default" && text.toLowerCase().match(x)) {
				if(score < filters[x])
					remove = true;
				else
					remove = false;
				}
		}
		if(remove == true)
			console.log(text);
		return remove;
}

