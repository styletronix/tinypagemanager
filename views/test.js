tinyPageManager.viewModels["test"] = function (page) {
    function viewModel() {
        var self = this;

        // set page title in viewModel
        page.title = "Test";

        // optional change page title
        page.sx_setTitle("new Test");



        self.addText = function (text) {
            var t = $(page).find("#message");
            t.html(t.html() + text + "<br>");
        }

        $(page).find("#button1").click(async function (e) {
            self.addText("getModalResult invoked");
            // open dialog, send data to dialog and wait for result

            // always use page.sx_pageManager.... to access functions of the pageManager from within a page.
            // this prevents problems if multiple pageManagers are used.
            var dataToSend = { index: 1 };
            var result = await page.sx_pageManager.getModalResult("dialog", dataToSend);

            self.addText("getModalResult: " + JSON.stringify(result));
        });

        $(page).find("#button2").click(async function (e) {
            self.addText("navigateBack invoked");
            var targetPage = await page.sx_pageManager.navigateBack();
            if (targetPage) {
                self.addText("new page: " + targetPage.sx_id);
                // all navigation functions are returning the new page after onShowing of the new page is called.
            } else {
                self.addText("navigation canceled");
                // navigation to a page was not possible
            }
        });

        self.backNavigateCount = 4;

        // all page events are allowing functions, async functions and the return of awaitables
        page.onInit = async function () {
            // Is raised when page is first initialized
            // after page has been added to the DOM and viewModel is applied
            // the page is hidden at that point
            self.addText("onInit");
        }
        page.onShow = async function () {
            // is raised every time the page is showing. For example after first load or when navigating back to the page.
            // the show animation starts right before onShow.
            self.addText("onShow");
        };
        page.onShown = async function () {
            // is raised after onShow when the page animation for displaying the page has finished.
            self.addText("onShown");
        };
        page.onClose = async function (e) {
            // return false to cancel page close
            // return false;
            // or return true or null to continue
            // return true;


            if (e.closeReason === "navigateBack") {
                // you may handle local back navigation here and return false to  cancel global navigation.
                // otherwise return true;
                if (self.backNavigateCount > 0) {
                    self.backNavigateCount -= 1;
                    self.addText("onClose closeReason: " + e.closeReason + " - Count:" + self.backNavigateCount);
                    return false;
                }
            }


            self.addText("onClose closeReason: " + e.closeReason + " (delayed 4 Seconds...)");
            return await new Promise(function (resolve, reject) {
                //Show dialog if page exit is allowed...
                // return true to leave page
                //return false to stay on page
                setTimeout(function () {
                    self.addText("onClose (end)");
                    resolve(true);
                }, 4000);
            });
        };
        page.onHide = async function () {
            // raised every time the page is hidden.
            // for example if navigating
            self.addText("onHide");
        };
        page.onDispose = async function () {
            //raised before the page is removed from DOM to cleanup
            self.addText("onDispose");
        };

        self.addText("viewModel loaded");
    }

    return new viewModel();
};