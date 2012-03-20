chrome.extension.sendRequest({method: "getLocalStorage", key1: "activeFilter", key2: "filterValues"}, function(response) {


	var activeFilter = response.data1 ? response.data1 : "standard";
	var options = response.data2 ? JSON.parse(response.data2)[activeFilter] : { };
	
	var defaultmin = options['data']['default'] || (Object.keys(options).length > 0 ? 99999 : 1);
	var pagesToDisplay = options['pages'] || 1;
	if(options['data']['default'] ) delete options['data']['default'] ;

	expand_more_links(
			function(d){ return d.querySelector('a[href^="/x?fnid"]'); },
			pagesToDisplay,
			function(){ filterDocument(defaultmin, options['data']); }
			);
});

function filterDocument(defaultmin, filters) {
	
	var links = document.querySelectorAll('td[class="title"] a');

	for(var i = 0, l = links.length; i < l; i++)
	{
		var link = links[i];
		var score = get_headline_score(link);
		if(score && hn_filter_match(link.textContent, score, filters, defaultmin)) {
			remove_headline(link);
		}
	}
}


function expand_more_links(search, count, success){
	if(count < 2){
		success();
		return;
	}

	var link = search(document);
	if(!link) return;

	var href = link.href;
	var table = link.parentNode.parentNode.parentNode.parentNode;
	
	// Remove link and spacer
	var row = link.parentNode.parentNode;
	var parent = link.parentNode.parentNode.parentNode;
	parent.removeChild(row.previousSibling);
	parent.removeChild(row);

	// Follow more link and add results to the table
	jQuery.get(href, function(data) {
		table.appendChild($(data).find('table table tbody')[1]);
		expand_more_links(search, --count, success);
	});
}

function get_headline_score(link) {
	var subtext = link.parentNode.parentNode.nextSibling;
	if(!subtext) return 0;
	var scoretext = subtext.querySelector('span[id^="score"]');
	if(!scoretext) return 0;

	return parseInt(scoretext.textContent.split(' ')[0], 10);
}

function remove_headline(link) {
	var headline = link.parentNode.parentNode;
	var parent = headline.parentNode;
	
	parent.removeChild(headline.nextSibling.nextSibling);
	parent.removeChild(headline.nextSibling);
	parent.removeChild(headline);
}

function hn_filter_match(text, score, filters, defaultmin) {
	var remove = score < defaultmin;

	var t = text.toLowerCase();

	for (var x in filters) {
		if(t.match(x)) {
			if(score > filters[x])
				remove = false;
			else
				remove = true;
		}
	}

	return remove;
}
