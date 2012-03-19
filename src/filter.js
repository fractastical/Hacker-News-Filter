//TODO: Crazy namespacing here...
chrome.extension.sendRequest({method: "getLocalStorage", key: "filterValues"}, function(response) {
	var options = response.data ? JSON.parse(response.data) : { "default" : 1 };
	if(!options["default"])
		options["default"] = 1;
	filterDocument(options);
});


	NodeList.prototype.map = function(m){
		var result = [];
		for (var i = 0, l = this.length; i < l; i++) {
			result.push(m(this[i]));
		}
		return result;
	};
/*
	params:
		doc: document for items to be appended to
		data: data to be used
*/
	function filterDocument(filters) {
		expand_more_link(
			function(d){ return d.querySelector('a[href^="/x?fnid"]'); },
			5
			);
				
		var tds = document.querySelectorAll('td[class="title"]');
		var rows = document.querySelectorAll('td[class="title"]')
			.map(function(node){ return node.parentNode; });
		
		

		for(var i = 0, l = tds.length; i < l; i++)
		{
			var td = tds[i];

			if (td.firstChild && td.firstChild.tagName == 'A')
			{
				var score = get_headline_score(td);
				
				if(score !== 0 && hn_filter_match(td.firstChild.text, score, filters)) {
					remove_headline(td);
				}
			}
		}
	}


	function expand_more_link(search, count){
		if(count < 1) return;

		/*
		if(score === 0 && td.firstChild.text == "More")
		{
			var tablebody = td.parentNode.parentNode;
			$(td).remove();
			jQuery.get(td.firstChild.href, function(data) {
				$(data).find('table table tr').slice(4).appendTo(tablebody);
				if(counter < 8) {
					filterDocument(counter,filters);
				}
			});
		
		}
		*/
	}

	function get_headline_score(td) {
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
		{
				return parseInt(td.parentNode.nextSibling.firstChild.nextSibling.firstChild.innerText.split(' ')[0]);
		}
		return 0;
	}

	function remove_headline(td) {
		var tr1 = td.parentNode;
		var tr2 = tr1.nextSibling;
		var tr3 = tr2.nextSibling;

		tr1.parentNode.removeChild(tr1);
		tr2.parentNode.removeChild(tr2);
		tr3.parentNode.removeChild(tr3);
	}

	function hn_filter_match(text, score, filters) {

			var remove = score < filters["default"];
			console.log('score:' + score + ' defaults:' + filters['default']);
			var t = text.toLowerCase();

			for (var x in filters) {
				if(x != "default" && t.match(x)) {
					remove = score < filters[x];
				}
			}

			return remove;
	}
