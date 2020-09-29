fn = {
    loadScript: function (src) {
        return new Promise(function (resolve, reject) {
            if ($("script[src='" + src + "']").length === 0) {
                var script = document.createElement('script');
                script.onload = function () {
                    resolve();
                };
                script.onerror = function () {
                    reject();
                };
                script.src = src;
                document.body.appendChild(script);
            } else {
                resolve();
            }
        });
    },
    loadScripts: function (srcList) {
        var p = Promise.resolve();
        var index = 0;


        srcList.forEach(function (item) {
            p = p.then(function () {
                return loadScript(item);
            });
        });

        return p
    }
}

//Init pageManager with container.
var pageManager = new tinyPageManager($("#view"));

pageManager.onBeforeNavigateBack = function () {
    // Invoked when back navigation is used. 
    // Either by pressing back button in browser, android back button or using pageManager.navigateBack();

    // Close popups or stuff like that and return true, to cancel  navigation.
    // Otherwise return false or null

    // onClose inside the page is evaluated before calling this function. 
    return false;
};
pageManager.onBeforePageLoad = function (page) {
    // invoked after the html of the page has been loaded, added to the view-container and before viewModel is applied.
};
pageManager.onAfterPageLoad = function (page) {
    // invoked after the viewModel has been applied to the page.
    // var viewModel = page.sx_viewModel;
};

// If you use multiple page managers for nested pages, disable back handling in nested page handlers:
// this is done automatically after the first pageManager is initialized for all additional pageManagers
// but you can overwrite this behaviour per pageManager:
// pageManager.disableBackButtonHandling = true; // default for additional page managers
// pageManager.disableBackButtonHandling = false; // default for first page Manager

// pageManager.viewPath = "views"; // path to views (.html) defaults to views
// pageManager.viewPathJs = "views"; // path to JS (.js) defaults to views

$(function () {
    $("#button_back").click(function (event) {
        // navigate back
        pageManager.navigateBack();
    });
    $("#button_page1").click(function (event) {
        // goto page "start" and clearing pageStack.
        pageManager.loadPage("start");

        // optional sending data to target page
        // data is accepted by any navigation function except navigateBack.
        // pageManager.loadPage("start", data);
    });
    $("#button_page2").click(function (event) {
        // goto page "test" and clearing pageStack.
        pageManager.loadPage("test");
    });
    $("#button_page3").click(function (event) {
        // navigate to page "test2".
        pageManager.navigate("test2");
    });


    // knockout observable:
    pageManager.isNavigateBackPossible.subscribe(function (value) {
        if (value) {
            $("#button_back").show();
        } else {
            $("#button_back").hide();
        }
    });
    if (!pageManager.isNavigateBackPossible()) {
        $("#button_back").hide();
    }

    // knockout observable:
    pageManager.currentPage.subscribe(function (page) {
        // Current Page changed...
    });

    // knockout observable:
    pageManager.currentPageTitle.subscribe(function (value) {
        // Current Page Title changed...
        window.title = value;
    });

    // knockout observable:
    pageManager.isPageLoading.subscribe(function (value) {
        // show or hide loading indicator
    });

    // load first page
    pageManager.loadPage("start");
})