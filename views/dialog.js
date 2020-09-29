tinyPageManager.viewModels["dialog"] = function (page) {
    function viewModel() {
        var self = this;

        //Init data;
        self.data = [];



        // init controls
        $(page).find("#clickMe").click(function (e) {
            if (page.sx_modalCallback) {
                // Return data to calling page
                page.sx_modalCallback(self.data);
            } else {
                // navigate Back if dialog was not called by getModalResult()
                page.sx_pageManager.navigateBack();
            }
        });

        $(page).find("#clickMe2").click(async function (e) {
            var result = await page.sx_pageManager.getModalResult("dialog", { index: self.index + 1 });
            self.data.push(result);
            $(page).find("#message").text("Value returned from Dialog: " + JSON.stringify(result));
        });



        // Page properties
        page.title = "Dialog";
        //var self.isVisible = page.sx_visible 


        // Page events
        page.onInit = function () {
            // Read data passed from parent page
            if (page.sx_data) {
                $(page).find("#message").text(JSON.stringify(page.sx_data));

                self.data.push("Dialog Index " + page.sx_data.index);
                self.index = page.sx_data.index;
            }
        };
        page.onShow = function () {

        };
        page.onShown = function () {

        };
        page.onClose = function () {

        };
        page.onHide = function () {

        };
        page.onDispose = function () {

        };
    }

    return new viewModel();
};