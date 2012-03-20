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
		// Follows the More links, adds them to the table, and deletes them
		expand_more_link(
			function(d){ return d.querySelector('a[href^="/x?fnid"]'); },
			5
			);
		
		var links = document.querySelectorAll('td[class="title"] a');

		for(var i = 0, l = links.length; i < l; i++)
		{
			var link = links[i];

			var score = get_headline_score(link);
			
			if(score !== 0 && hn_filter_match(link.textContent, score, filters)) {
				remove_headline(link);
			}
		}
	}


	function expand_more_link(search, count){
		if(count < 1) return;

		var link = search(document);
		if(!link) return;

		var href = link.href;
		link.parentNode.removeChild(link);

		//var tablebody = link.parentNode.parentNode;
		//$(td).remove();
		//jQuery.get(td.firstChild.href, function(data) {
		//	$(data).find('table table tr').slice(4).appendTo(tablebody);
		//});

		//expand_more_link(search, --count);
	}

	function get_headline_score(link) {
		var subtext = link.parentNode.parentNode.nextSibling;
		if(!subtext) console.log(link);
		var scoretext = subtext.querySelector('span[id^="score"]');
		if(!scoretext) return 0;

		return parseInt(scoretext.textContent.split(' ')[0].textContent, 10);
	}

	function remove_headline(link) {
		var headline = link.parentNode.parentNode;
		var parent = headline.parentNode;
		var subtext = headline.nextSibling;
		var spacer = subtext.nextSibling;

		parent.removeChild(headline);
		parent.removeChild(subtext);
		parent.removeChild(spacer);
	}

	function hn_filter_match(text, score, filters) {

			var remove = score < filters["default"];
			//console.log('score:' + score + ' defaults:' + filters['default']);
			var t = text.toLowerCase();

			for (var x in filters) {
				if(x != "default" && t.match(x)) {
					remove = score < filters[x];
				}
			}

			return remove;
	}
