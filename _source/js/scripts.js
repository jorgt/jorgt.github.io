jQuery.extend({
	highlight: function(node, re, nodeName, className) {
		if (node.nodeType === 3) {
			var match = node.data.match(re);
			if (match) {
				var highlight = document.createElement(nodeName || 'span');
				highlight.className = className || 'highlight';
				var wordNode = node.splitText(match.index);
				wordNode.splitText(match[0].length);
				var wordClone = wordNode.cloneNode(true);
				highlight.appendChild(wordClone);
				wordNode.parentNode.replaceChild(highlight, wordNode);
				return 1; //skip added node in parent
			}
		} else if ((node.nodeType === 1 && node.childNodes) && // only element nodes that have children
			!/(script|style)/i.test(node.tagName) && // ignore script and style nodes
			!(node.tagName === nodeName.toUpperCase() && node.className === className)) { // skip if already highlighted
			for (var i = 0; i < node.childNodes.length; i++) {
				i += jQuery.highlight(node.childNodes[i], re, nodeName, className);
			}
		}
		return 0;
	}
});

jQuery.fn.unhighlight = function(options) {
	var settings = {
		className: 'highlight',
		element: 'span'
	};
	jQuery.extend(settings, options);

	return this.find(settings.element + "." + settings.className).each(function() {
		var parent = this.parentNode;
		parent.replaceChild(this.firstChild, this);
		parent.normalize();
	}).end();
};

jQuery.fn.highlight = function(words, options) {
	var settings = {
		className: 'highlight',
		element: 'span',
		caseSensitive: false,
		wordsOnly: false
	};
	jQuery.extend(settings, options);

	if (words.constructor === String) {
		words = [words];
	}
	words = jQuery.grep(words, function(word, i) {
		return word != '';
	});
	words = jQuery.map(words, function(word, i) {
		return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	});
	if (words.length == 0) {
		return this;
	};

	var flag = settings.caseSensitive ? "" : "i";
	var pattern = "(" + words.join("|") + ")";
	if (settings.wordsOnly) {
		pattern = "\\b" + pattern + "\\b";
	}
	var re = new RegExp(pattern, flag);

	return this.each(function() {
		jQuery.highlight(this, re, settings.element, settings.className);
	});
};

jQuery(function() {

	(function() {
		if (!("ontouchstart" in document.documentElement)) {
			$('.post-preview').mouseenter(function() {
				$(this).find('.post-time span').show();
				$(this).find('.post-time time').hide();
			}).mouseleave(function() {
				$(this).find('.post-time span').hide();
				$(this).find('.post-time time').show();
			});
		}
	})();

	// site search
	(function() {
		// Initalize lunr with the fields it will be searching on. I've given title
		// a boost of 10 to indicate matches on this field are more important.
		window.idx = lunr(function() {
			this.field('id');
			this.field('title');
			this.field('category');
			this.field('content', {
				boost: 10
			});
		});

		// Download the data from the JSON file we generated
		window.data = $.getJSON('/search_data.json');

		// Wait for the data to load and add it to lunr
		window.data.then(function(loaded_data) {
			$.each(loaded_data, function(index, value) {
				window.idx.add(
					$.extend({
						"id": index
					}, value)
				);
			});
		});

		$('#site-search .start-search').click(function(e) {
			$("#search-box").animate({
				width: 'toggle'
			}, 350);
		});

		// Event when the form is submitted
		$("#search-box").keyup(function(e) {
			if (this.value === '') {
				$('#search-results').html('')
			} else {
				display_search_results(window.idx.search(this.value), this.value);
			}
		});

		function display_search_results(results, search) {
			var $search_results = $("#search-results");

			// Wait for data to load
			window.data.then(function(loaded_data) {

				// Are there any results?
				if (results.length) {
					$search_results.empty(); // Clear any old results

					// Iterate over the results
					results.forEach(function(result) {
						var item = loaded_data[result.ref];

						// Build a snippet of HTML for this result
						var appendString = '<p><a href="' + item.url + '?q=' + search + '">' + item.title + '</a></p>';

						// Add it to the results
						$search_results.append(appendString);
					});
				} else {
					$search_results.html('<p>No results found</p>');
				}
			});
		}
	})();

	(function() {
		location.search.replace(/^\?/, '').split('&').forEach(function(search) {
			search = search.split('=');
			switch (search[0]) {
				case 'q':
					highlight(search[1]);
					break;
			}
		});

		function highlight(phrase) {
			phrase = decodeURIComponent(phrase);
			var phregex = decodeURIComponent(phrase).replace(/\s/, '\\s');
			var $content = $('.content p');
			$('.content').highlight(phrase);
		}
	})();

});