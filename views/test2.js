tinyPageManager.viewModels["test2"] = function (page) {
    function viewModel() {
        var self = this;

        page.title = "Test";
    }

    return new viewModel();
};