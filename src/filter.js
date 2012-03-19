//TODO: Crazy namespacing here...
chrome.extension.sendRequest({method: "getLocalStorage", key: "filterValues"},

	 function(response) {
	   
	 	   var filters = JSON.parse(response.data);
		   if(!filters["default"])
				filters["default"] = 1;
		
			filterDocument(document,document,0,filters);
		
	});
	
/*
	params:
	 	doc: document for items to be appended to
		data: data to be used 
		counter: number of times performed
	
*/
	function filterDocument(doc,data,counter,filters) {	
		console.log(counter);
		counter++;
		var tds = data.getElementsByTagName('td');
		var tdsToRemove = Array();
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

				if(score == 0 && td.firstChild.text == "More")
				{
					jQuery.get(td.firstChild.href, function(data) {
						$(data).find('tr').appendTo(td.parentNode.parentNode);
						
						if(counter < 3)
							filterDocument(document,data,counter,filters);
					})		
				
				}
			
				if(score != 0 && hn_filter_match(td.firstChild.text, score, filters)) 
					tdsToRemove.push(td);
			}
		}
		for (x in tdsToRemove) 
		{
			var td = tdsToRemove[x];
			var tr1 = td.parentNode;
			var tr2 = tr1.nextSibling;
			var tr3 = tr2.nextSibling;

			tr1.parentNode.removeChild(tr1);
			tr2.parentNode.removeChild(tr2);
			tr3.parentNode.removeChild(tr3);	
		}


	}

	function hn_filter_match(text, score, filters)
	{		
		    console.log(filters);
		
			var remove = false;
		
			if(score < filters["default"])
				remove = true;
			
			for (x in filters) {
				console.log(x);
			
				if(x != "default" && text.toLowerCase().match(x)) {
					if(score < filters[x])
						remove = true;
					else
						remove = false;
					}
			}
			return remove;
	}

