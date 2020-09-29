// TinyPageManager
// Copyright 2020 Andreas W. Pross (styletronix)
// Version 1.0.2 - 29.09.2020

function tinyPageManager(container) {
    var self = this;

    // Public properties
    self.pageCloseAnimationDelay = 200;
    self.pageOpenAnimationDelay = 200;
    self.disableBackButtonHandling = false;
    self.disableBrowserBackNavigation = false;
    self.startPage = null;
    self.viewPath = "views";
    self.viewPathJs = "views";

    // Public functions
    self.navigate = async function (pageID, data) {
        if (!self.startPage) { self.startPage = pageID };
        var pageList = self.getPageStack();

        self.isPageLoading(true);
        try {
            // Vorhandene Seiten ausblenden
            for (i = 0; i < pageList.length; i++) {
                await self.hidePage(pageList[i]);
            };

            // Lade HTML Datei
            var page = await self.loadPageFromFile(pageID, data, container);

            // Seite anhängen
            //$(container).prepend(page);

            if (page.onInit) { await page.onInit(); }

            // neue Seite einblenden
            await self.showPage(page);

            self.isPageLoading(false);
            return page;
        } catch (error) {
            alert(error.message);
            self.isPageLoading(false);
            return null;
        }
    };
    self.loadPage = async function (pageID, data, e) {
        if (!self.startPage) { self.startPage = pageID };
        var pageList = self.getPageStack();

        // Vorhandene Seiten schließen
        for (var i = 0; i < pageList.length; i++) {
            var p = pageList[i];

            if (!e) {
                e = { closeReason: "loadPage" };
            }

            if (await self.invokeOnClose(p, e) === false) {
                // await self.showPage(p);
                return null;
            } else {
                await self.hidePage(p);
                await self.disposePage(p);
            }
        }

        self.isPageLoading(true);
        try {
            // Lade HTML Datei
            var page = await self.loadPageFromFile(pageID, data, container);

            // Seite anhängen
            //$(container).prepend(page);
            if (page.onInit) { await page.onInit(); }

            // neue Seite einblenden
            await self.showPage(page);
            self.isPageLoading(false);
            return page;

        } catch (error) {
            alert(error.message);
            self.isPageLoading(false);
            return null;
        }
    };
    self.replaceCurrentPage = async function (pageID, data) {
        if (!self.startPage) { self.startPage = pageID };
        var pageList = self.getPageStack();

        // Aktuelle Seite schließen
        if (pageList.length > 0) {
            var p = pageList[0];

            if (await self.invokeOnClose(p, { closeReason: "replaceCurrentPage" }) === false) {
                // await self.showPage(p);
                return null;
            } else {
                await self.hidePage(p);
                await self.disposePage(p);
            }
        }

        self.isPageLoading(false);
        try {
            // Lade HTML Datei
            var page = await self.loadPageFromFile(pageID, data, container);

            // Seite anhängen
            //$(container).prepend(page);
            if (page.onInit) { await page.onInit(); }

            // neue Seite einblenden
            await self.showPage(page);
            self.isPageLoading(false);
            return page;
        } catch (err) {
            alert(err.message);
            self.isPageLoading(false);
            return null;
        }

    };
    self.navigateBack = async function (e) {
        if (!self.getNavigateBackPossible()) { return null; }

        if (self.getPageStack().length <= 1) {
            if (self.getCurrentPage().sx_id !== self.startPage) {
                // if currentPage is not startPage then load start page
                return await self.loadPage(self.startPage, null, { closeReason: "navigateBack" });
            }
            return null;
        }

        var pageList = self.getPageStack();

        // Aktuelle Seite schließen
        var p = pageList[0];
        var page = pageList[1];

        if (!e) {
            e = { closeReason: "navigateBack" };
        }

        if (await self.invokeOnClose(p, e) === false) {
            // await self.showPage(p);
            return null;
        } else {
            await self.hidePage(p);
            await self.disposePage(p);
        }

        await self.showPage(page);

        return page;
    };
    self.getModalResult = async function (pageID, data) {
        var page = await self.navigate(pageID, data);

        return await new Promise(function (resolve, reject) {
            page.sx_modalCallback = function (result, doNotNavigate) {
                page.sx_modalCallback = null;

                if (!doNotNavigate) {
                    self.navigateBack({ closeReason: "returnModalResult" });
                }
                resolve(result);
            }
        });
    };
    self.getNavigateBackPossible = function () {
        if (self.getPageStack().length > 1) {
            return true;

        } else if (self.getPageStack().length === 1 && self.getCurrentPage().sx_id !== self.startPage) {
            return true;

        } else {
            return false;

        }
    };
    self.getPageStack = function () {
        return $(container).children(".sx-page").toArray();
    };
    self.getCurrentPage = function () {
        return self._currentPage;
    };

    // Public event Handlers
    self.onBeforeNavigateBack = null;
    self.currentPage = ko.observable(null);
    self.currentPageTitle = ko.observable(null);
    self.isNavigateBackPossible = ko.observable(false);
    self.isPageLoading = ko.observable(false);

    // Public Page events
    self.onBeforeDisposePage = null;
    self.onAfterDisposePage = null;
    self.onBeforePageLoad = null;
    self.onAfterPageLoad = null;

    // Internal functions
    self.loadScript = function (src) {
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
    };
    self.hidePage = async function (page) {
        if (page.sx_visible) {
            if (page.onHide) { await page.onHide(); }
            page.sx_visible = false;
            page._isShown = false; // Onsen UI compatibility
            await new Promise(function (resolve, reject) {
                $(page).slideUp(self.pageCloseAnimationDelay, function () {
                    resolve();
                });
            });
        }
    };
    self.showPage = async function (page) {
        page.sx_visible = true;
        page._isShown = true; // Onsen UI compatibility
        if (page.onShow) { await page.onShow(); }
        self._currentPage = page;
        if (self.currentPage) { self.currentPage(page); }

        $(page).slideDown(self.pageOpenAnimationDelay, function () {
            if (this.onShown) { this.onShown(); }
        });
    };
    self.disposePage = async function (page) {
        if (self.onBeforeDisposePage) { await self.onBeforeDisposePage(page); }
        if (page.onDestroy) { await page.onDestroy(); } // onDestroy: Compatibility with onsen ui
        if (page.onDispose) { await page.onDispose(); } // Use onDispose over onDestroy
        if (self.onAfterDisposePage) { await self.onAfterDisposePage(page); }

        if (page.sx_modalCallback) { page.sx_modalCallback(null, true); }
        $(page).remove();

    };
    self.loadPageFromFile = async function (pageID, data, container) {
        var page = await new Promise(function (resolve, reject) {
            var page = $("<div class='sx-page'>");
            page.load(self.viewPath + "/" + pageID + ".html", function () {
                resolve(page[0]);
            });
        });

        page.sx_id = pageID;
        page.sx_pageManager = self;
        page.sx_visible = false;
        page._isShown = false; // Onsen UI compatibility
        page.sx_data = data;
        page.sx_setTitle = function (title) {
            page.title = title;
            self.pageTitleUpdated(page);
        }
        $(page).hide(0);
        
        // Lade Javascript Datei
        await self.loadScript(self.viewPathJs + "/" + pageID + ".js");

        // ViewModel erstellen und zuweisen
        var viewModel = tinyPageManager.viewModels[pageID];
        if (!viewModel) { throw new Error("Das ViewModel für die Seite " + pageID + " wurde nicht gefunden."); }

        if (container) {
            $(container).prepend(page);
        }
        if (self.onBeforePageLoad) {
            self.onBeforePageLoad(page);
        }
        page.sx_viewModel = viewModel(page);
        ko.applyBindings(page.sx_viewModel, page);

        if (self.onAfterPageLoad) {
            self.onAfterPageLoad(page);
        }

        return page;
    };
    self.invokeOnClose = async function (page, e) {
        if (page.onBeforeLeave) {
            // onBeforeLeave: Compatibility for onsen ui
            try {
                return await page.onBeforeLeave(e);
            } catch (err) {
                return false;
            }

        } else if (page.onClose) {
            // use onClose over onBeforeLeave
            try {
                return await page.onClose(e);
            } catch (err) {
                return false;
            }
        } else {
            return true;
        }
    };
    self.pageTitleUpdated = function (page) {
        if (page.sx_visible) {
            self.currentPageTitle(page.title);
        }
    };
    self.currentPage.subscribe(function (page) {
        self.currentPageTitle(page.title);
        self.isNavigateBackPossible(self.getNavigateBackPossible());
    })
    self.backNavigation = async function () {
        if (self.disableBackButtonHandling) { return; }

        var exitApp = false;
        var noNavigation = false;

        if (self.disableBrowserBackNavigation) {
            noNavigation = true;
        }

        if (self.onBeforeNavigateBack) {
            if (self.onBeforeNavigateBack()) {
                noNavigation = true;
            }
        }

        if (!noNavigation) {
            if (self.isNavigateBackPossible()) {
                // navigate Back if possible
                window.history.pushState({ noBackExitsApp: true }, '');
                return await self.navigateBack();

            } else if (self.getCurrentPage().sx_id !== self.startPage) {
                // if currentPage is not startPage then load start page
                window.history.pushState({ noBackExitsApp: true }, '');
                return await self.loadPage(self.startPage);

            } else {
                // if currentPage is startPage and navigating Back is not possible, exit app
                exitApp = true;

            }
        }

        if (!exitApp) {
            // add virtual entry to browser history to prevent back navigation of browser.
            window.history.pushState({ noBackExitsApp: true }, '');
        }
    };

    self.init = function () {
        // Internal properties
        self._currentPage = null;
        if (!tinyPageManager.viewModels) { tinyPageManager.viewModels = []; }
        if (!tinyPageManager.managers) { tinyPageManager.managers = []; }
        if (tinyPageManager.firstManagerInitialized) {
            tinyPageManager.firstManagerInitialized = true;
            self.disableBackButtonHandling = true;
        }

        // Navigation events and handlers
        window.addEventListener('load', function () {
            if (self.disableBackButtonHandling) { return; }

            window.history.pushState({ noBackExitsApp: true }, '');
        });
        window.addEventListener('popstate', function (event) {
            self.backNavigation();
        });
    }
    self.init();
};