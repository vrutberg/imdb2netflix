var parseMovieTitle = function(orig) {
	var title = orig.replace(/\s*?\(\d+\)\s*?$/, ""); // removes the year
	var year = /\((\d+)\)/.exec(orig)[1];

	return {
		"title": title,
		"year": year
	};
};

var hasBeenCalled = false;

chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
	var url = details.url;
	if(/^https?/.test(url) && /imdb\.com\/title/.test(url)) {
		chrome.extension.onMessage.addListener(function(msg, sender, cb) {
			if(hasBeenCalled) return;
			var hasBeenCalled = true;

			if(msg) {
				var movie = parseMovieTitle(msg);
				var oauth = OAuthSimple().sign({
					"path": "http://api-public.netflix.com/catalog/titles",
					"parameters": {
						"term": movie.title
					},
					"signatures": {
						"consumer_key": "m9emqnztega45aqp9xqswpmq",
						"shared_secret": "hn7NbaJ3u4"
					}
				});

				jQuery.get(oauth.signed_url, function(data) {
					var catalogTitle = undefined;
					jQuery("catalog_title", data).each(function() {
						var $this = $(this),
							title = $this.find("title").attr("short"),
							release_year = $this.find("release_year").text();

						if(title === movie.title && release_year === movie.year) {
							catalogTitle = this;
							return false;
						}
					});

					if(catalogTitle !== undefined) {
						var url = $(catalogTitle).find("link[title='web page']").attr("href");
						cb(url);
					}
				});
			}

			return true;
		});

		chrome.tabs.executeScript(details.tabId, {"file": "content_imdb.js"});
	}
});