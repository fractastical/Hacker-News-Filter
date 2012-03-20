chrome.extension.sendRequest({method: "getLocalStorage", key: "filterValues"}, function(response) {
	var options = response.data ? JSON.parse(response.data) : { };
	var defaultmin = options['default'] || 1;
	delete options['default'];

	expand_more_links(
			function(d){ return d.querySelector('a[href^="/x?fnid"]'); },
			8,
			function(){ filterDocument(defaultmin, options); }
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
	if(count < 1){
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
			remove = score < filters[x];
		}
	}

	return remove;
}
