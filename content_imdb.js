var title = document.querySelectorAll("h1.header")[0].innerText;

chrome.extension.sendMessage(title, function (url) {
  if (url) {
    var link = '<a href="' + url + '" target="_blank">Watch Now!</a>';
    var header = document.querySelectorAll("h1.header")[0];
    header.innerHTML = header.innerHTML + link;
  }
});
