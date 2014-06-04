var parseTitle = function (orig) {
  var title = orig.replace(/\s*?\(.+\)\s*?$/, ''); // removes the year
  var year = /\(\s*(\d{4})[\s-]*(?:\d{4})?\)/.exec(orig.replace('–', '-'))[1];

  return {
    'title': title,
    'year': year
  };
};

chrome.webNavigation.onDOMContentLoaded.addListener(function (details) {
  var url = details.url;
  if (/^https?/.test(url) && /imdb\.com\/title/.test(url)) {
    chrome.extension.onMessage.addListener(function (msg, sender, cb) {
      if (typeof msg !== 'undefined') {
        var title = parseTitle(msg);
        var oauth = OAuthSimple().sign({
          'path': 'http://api-public.netflix.com/catalog/titles',
          'parameters': {
            'term': title.title
          },
          'signatures': {
            'consumer_key': 'm9emqnztega45aqp9xqswpmq',
            'shared_secret': 'hn7NbaJ3u4'
          }
        });

        jQuery.get(oauth.signed_url, function (data) {
          var catalogTitle = undefined;
          jQuery('catalog_title', data).each(function () {
            var $this = $(this),
              netflixTitle = $this.find('title').attr('short'),
              netflixYear = $this.find('release_year').text();

            if (netflixTitle === title.title && netflixYear === title.year) {
              catalogTitle = this;
              return false;
            }
          });

          if (typeof catalogTitle !== 'undefined') {
            var url = $(catalogTitle).find('link[title="web page"]').attr('href');
            cb(url);
          }
        });
      }

      return true;
    });

    chrome.tabs.executeScript(details.tabId, { 'file': 'content_imdb.js' });
  }
});