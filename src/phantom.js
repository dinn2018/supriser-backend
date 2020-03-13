var page = require('webpage').create();
page.open('https://manhua.fzdm.com/2/959/index_4.html', function (status) {
    if (status == 'success') {
        page.loadFinished(status);
        phantom.exit();
    } else {
        console.log('error');
        phantom.exit();
    }
});
page.onLoadFinished = function (status) {
    console.log(page.content);
    phantom.exit();
}