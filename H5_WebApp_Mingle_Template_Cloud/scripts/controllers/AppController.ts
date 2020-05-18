/**
 * Application controller which will have the global scope functions and models and can be accessed through out the application. 
 * Functions and models shared across one or more modules should be implemented here. 
 * For independent modules create module specific controllers and declare it as a nested controller, i.e under the module specific page.
 */
module h5.application {

    export enum MessageType {
        Information = 0,
        Warning = 1,
        Error = 2,
    }

    export class AppController {

        static $inject = ["$scope", "configService", "AppService", "RestService", "StorageService", "GridService", "m3UserService", "languageService", "$uibModal", "$interval", "$timeout", "$filter", "$q", "$window", "m3FormService", "$location"];

        constructor(private scope: IAppScope, private configService: h5.application.ConfigService, private appService: h5.application.IAppService, private restService: h5.application.RestService, private storageService: h5.application.StorageService, private gridService: h5.application.GridService, private userService: M3.IUserService, private languageService: h5.application.LanguageService, private $uibModal: ng.ui.bootstrap.IModalService, private $interval: ng.IIntervalService, private $timeout: ng.ITimeoutService, private $filter: h5.application.AppFilter, private $q: ng.IQService, private $window: ng.IWindowService, private formService: M3.FormService, private $location: ng.ILocationService) {
            this.init();
        }

        /**
        * The initialize function which will be called when the controller is created
        */
        private init() {
            this.scope.appReady = false;
            this.scope.loadingData = false;
            this.scope.statusBar = [];
            this.scope.statusBarIsCollapsed = true;
            this.scope.statusBarVisible = true;
            this.scope.hasValidlicense = false;

            this.languageService.getAppLanguage().then((val: Odin.ILanguage) => {
                this.scope.languageConstants = this.languageService.languageConstants;
                this.initApplication();
            }, (errorResponse: any) => {
                Odin.Log.error("Error getting language constants " + errorResponse);
                this.scope.statusBar.push({ message: "Error getting language constants" + errorResponse, statusBarMessageType: h5.application.MessageType.Error, timestamp: new Date() });
            });
            if (this.$window.innerWidth < 768) {
                this.scope.showSideNavLabel = false;
            } else {
                this.scope.showSideNavLabel = true;
            }
        }

        /**
        * This function will have any application specific initialization functions
        */
        private initApplication() {
            this.initGlobalConfig();
            this.initAppScope();
            this.initUIGrids();
            this.initScopeFunctions();
            this.$timeout(() => { this.scope.appReady = true; }, 5000);
        }

        /**
        * This function will call the config service and set the global configuration model object with the configured settings 
        */
        private initGlobalConfig() {

            this.configService.getGlobalConfig().then((configData: any) => {
                this.scope.globalConfig = configData;
                this.initLanguage();
                this.initTheme();
                this.getUserContext();
                //for security
                if (this.scope.appConfig.authorizedUser) {
                    this.scope.showSideNavLabel = false;
                } else {
                    this.scope.loadingData = false;
                }
                this.initModule();
            }, (errorResponse: any) => {
                Odin.Log.error("Error while getting global configuration " + errorResponse);
                this.scope.statusBar.push({ message: "Error while getting global configuration " + errorResponse, statusBarMessageType: h5.application.MessageType.Error, timestamp: new Date() });
            });
        }

        /**
        * Codes and function calls to initialize Application Scope model
        */
        private initAppScope() {
            //Initialize data objects
            this.scope.transactionStatus = {
                appConfig: false
            };
            this.scope["errorMessages"] = [];
            this.scope.infiniteScroll = {
                numToAdd: 20,
                currentItems: 20
            };
            this.scope.themes = [
                { themeId: 1, themeIcon: 'leanswiftchartreuse.png', themeName: "Theme1Name", panel: "panel-h5-theme-LC", navBar: "navbar-h5-theme-LC", sideNav: "sideNav-h5-theme-LC", button: "h5Button-h5-theme-LC", h5Grid: "h5Grid-h5-theme-LC", h5Dropdown: "h5Dropdown-h5-theme-LC", navTabs: "navtabs-h5-theme-LC", active: false, available: true },
                { themeId: 2, themeIcon: 'royalinfor.png', themeName: "Theme2Name", panel: "panel-h5-theme-RI", navBar: "navbar-h5-theme-RI", sideNav: "sideNav-h5-theme-RI", button: "h5Button-h5-theme-RI", h5Grid: "h5Grid-h5-theme-RI", h5Dropdown: "h5Dropdown-h5-theme-RI", navTabs: "navtabs-h5-theme-RI", active: false, available: true },
                { themeId: 3, themeIcon: 'summersmoothe.png', themeName: "Theme3Name", panel: "panel-h5-theme-SS", navBar: "navbar-h5-theme-SS", sideNav: "sideNav-h5-theme-SS", button: "h5Button-h5-theme-SS", h5Grid: "h5Grid-h5-theme-SS", h5Dropdown: "h5Dropdown-h5-theme-SS", navTabs: "navtabs-h5-theme-SS", active: false, available: true },
                { themeId: 4, themeIcon: 'pumkinspice.png', themeName: "Theme4Name", panel: "panel-h5-theme-PS", navBar: "navbar-h5-theme-PS", sideNav: "sideNav-h5-theme-PS", button: "h5Button-h5-theme-PS", h5Grid: "h5Grid-h5-theme-PS", h5Dropdown: "h5Dropdown-h5-theme-PS", navTabs: "navtabs-h5-theme-PS", active: false, available: true },
                { themeId: 5, themeIcon: 'visionimpared.png', themeName: "Theme5Name", panel: "panel-h5-theme-VI", navBar: "navbar-h5-theme-VI", sideNav: "sideNav-h5-theme-VI", button: "h5Button-h5-theme-VI", h5Grid: "h5Grid-h5-theme-VI", h5Dropdown: "h5Dropdown-h5-theme-VI", navTabs: "navtabs-h5-theme-VI", active: false, available: true },
                { themeId: 6, themeIcon: 'lipstickjungle.png', themeName: "Theme6Name", panel: "panel-h5-theme-LJ", navBar: "navbar-h5-theme-LJ", sideNav: "sideNav-h5-theme-LJ", button: "h5Button-h5-theme-LJ", h5Grid: "h5Grid-h5-theme-LJ", h5Dropdown: "h5Dropdown-h5-theme-LJ", navTabs: "navtabs-h5-theme-LJ", active: false, available: true },
                { themeId: 7, themeIcon: 'silverlining.png', themeName: "Theme7Name", panel: "panel-h5-theme-SL", navBar: "navbar-h5-theme-SL", sideNav: "sideNav-h5-theme-SL", button: "h5Button-h5-theme-SL", h5Grid: "h5Grid-h5-theme-SL", h5Dropdown: "h5Dropdown-h5-theme-SL", navTabs: "navtabs-h5-theme-SL", active: false, available: true },
                { themeId: 8, themeIcon: 'steelclouds.png', themeName: "Theme8Name", panel: "panel-h5-theme-SC", navBar: "navbar-h5-theme-SC", sideNav: "sideNav-h5-theme-SC", button: "h5Button-h5-theme-SC", h5Grid: "h5Grid-h5-theme-SC", h5Dropdown: "h5Dropdown-h5-theme-SC", navTabs: "navtabs-h5-theme-SC", active: false, available: true }
            ];
            this.scope.textures = [
                { textureId: 1, textureIcon: 'diamond.png', textureName: "Wallpaper1Name", appBG: "h5-texture-one", active: false, available: true },
                { textureId: 2, textureIcon: 'grid.png', textureName: "Wallpaper2Name", appBG: "h5-texture-two", active: false, available: true },
                { textureId: 3, textureIcon: 'linen.png', textureName: "Wallpaper3Name", appBG: "h5-texture-three", active: false, available: true },
                { textureId: 4, textureIcon: 'tiles.png', textureName: "Wallpaper4Name", appBG: "h5-texture-four", active: false, available: true },
                { textureId: 5, textureIcon: 'wood.png', textureName: "Wallpaper5Name", appBG: "h5-texture-five", active: false, available: true }
            ];
            this.scope.supportedLanguages = [{ officialTranslations: false, languageCode: "ar-AR", active: false, available: true }, { officialTranslations: false, languageCode: "cs-CZ", active: false, available: true },
                { officialTranslations: false, languageCode: "da-DK", active: false, available: true }, { officialTranslations: false, languageCode: "de-DE", active: false, available: true },
                { officialTranslations: false, languageCode: "el-GR", active: false, available: true }, { officialTranslations: true, languageCode: "en-US", active: true, available: true },
                { officialTranslations: false, languageCode: "es-ES", active: false, available: true }, { officialTranslations: false, languageCode: "fi-FI", active: false, available: true },
                { officialTranslations: true, languageCode: "fr-FR", active: false, available: true }, { officialTranslations: false, languageCode: "he-IL", active: false, available: true },
                { officialTranslations: false, languageCode: "hu-HU", active: false, available: true }, { officialTranslations: false, languageCode: "it-IT", active: false, available: true },
                { officialTranslations: false, languageCode: "ja-JP", active: false, available: true }, { officialTranslations: false, languageCode: "nb-NO", active: false, available: true },
                { officialTranslations: false, languageCode: "nl-NL", active: false, available: true }, { officialTranslations: false, languageCode: "pl-PL", active: false, available: true },
                { officialTranslations: false, languageCode: "pt-PT", active: false, available: true }, { officialTranslations: false, languageCode: "ru-RU", active: false, available: true },
                { officialTranslations: true, languageCode: "sv-SE", active: false, available: true }, { officialTranslations: false, languageCode: "tr-TR", active: false, available: true },
                { officialTranslations: false, languageCode: "zh-CN", active: false, available: true }, { officialTranslations: false, languageCode: "ta-IN", active: false, available: true }
            ];

            this.scope.views = {
                h5Application: { url: "views/Application.html" },
                //  selection: { url: "views/Selection.html" },
                MingleModule: { url: "views/MingleModule.html" },
                errorModule: { url: "views/Error.html" },
            };
            this.scope.modules = [
                { moduleId: 1, activeIcon: 'SampleModule1.png', inactiveIcon: 'SampleModule1-na.png', heading: 'Mingle Message template', content: this.scope.views.MingleModule.url, active: true, available: true },
            ];
            this.scope.appConfig = {};
            this.scope.userContext = new M3.UserContext();
            this.scope["dateRef"] = new Date();

            //Function calls which initialize module specific data objects
            this.initGlobalSelection();
            this.initMingleModule();
        }

        /**
        * Initialize Global Selection model
        */
        private initGlobalSelection() {
            this.scope.globalSelection = {
                reload: true,
                transactionStatus: {
                    MingleTableList: false,
                },

                division: {},//objects curly braces cause there objects
                //list square brackets cause there array   

            };
        }

        /**
        * Initialize the Mingle Master module
        */
        private initMingleModule() {
            this.scope.MingleModule = {
                reload: true,
                transactionStatus: {
                    MingleList: false,
                    MingleRecord: false,
                    isMultipleAdd: false,
                    userGUIDList: false,
                    user: false,
                    toUser: false

                },
                MingleList: {},
                messageToSend: {},
                messages: "",
                MingleListGrid: {},//added
                selectedMingleListRow: {},
                MingleRecord: {},
                userGUIDList: [],
                user: {},
                toUser: {},
                loadMingleRecordModule: {},
                isMultipleAdd: false
                //scope.MingleModule.MingleRecord.messages : "This is where all the messages will go " 
            };
            this.loadMingleList();

        }

        private loadUserGUIDList(): void {
            console.log("loadUserGUIDList");
            this.getUserDetails();
            this.scope.loadingData = true;
            this.scope.MingleModule.transactionStatus.userGUIDList = true;
            this.appService.lstUserGUID().then((val: M3.IMIResponse) => {
                console.log(">-------------------------------------------val ");
                console.log(val);
                this.scope.MingleModule.userGUIDList = val.items;
                this.scope.MingleModule.toUser = val.item.A121;

 
 
                this.scope.loadingData = false;
               

                this.scope.MingleModule.transactionStatus.userGUIDList = false;
                this.scope.MingleModule.transactionStatus.user = false;
                this.refreshTransactionStatus();
            }, (err: M3.IMIResponse) => {
                this.scope.MingleModule.transactionStatus.userGUIDList = false;
                this.scope.MingleModule.transactionStatus.user = false;
                this.refreshTransactionStatus();
                let error = "API: " + err.program + "." + err.transaction + ", Input: " + JSON.stringify(err.requestData) + ", Error Code: " + err.errorCode;
                this.showError(error, [err.errorMessage]);
                this.scope.statusBar.push({ message: error + " " + err.errorMessage, statusBarMessageType: h5.application.MessageType.Error, timestamp: new Date() });
                this.refreshTransactionStatus();
            });
        }
        private loadColleagueList(): void {
            console.log("loadColleagueList");
 
        }
        /**
        * Initialize the application constants/labels
        */
        private initApplicatMinglestants() {
        }

        /**
        * Initialize the binding of controller function mapping with the module scope
        */
        private initScopeFunctions() {
            //Add function binding to the scope models which are required to access from grid scope           
            this.scope.MingleModule.loadMingleRecordModule = (fieldName, rowEntity) => { this.displayDetailScreen(fieldName, rowEntity); }
        }

        /**
        * Initialize UI grids objects defined in all modules
        */
        private initUIGrids() {
            //Initialize the grid objects via gridService 
            this.scope.MingleModule.MingleListGrid = this.gridService.getMingleListGrid();
            this.initUIGridsOnRegisterApi();
        }

        /**
        * Initialize UI Grid On Register API if required
        */
        private initUIGridsOnRegisterApi() {
            this.scope.MingleModule.MingleListGrid.onRegisterApi = (gridApi) => {
                this.gridService.adjustGridHeight("MingleListGrid", this.scope.MingleModule.MingleListGrid.data.length, 500);
                gridApi.core.on.renderingComplete(this.scope, (handler: any) => { this.gridService.restoreGridState("MingleListGrid", gridApi); });
                gridApi.core.on.sortChanged(this.scope, (handler: any) => { this.gridService.saveGridState("MingleListGrid", gridApi); });
                gridApi.core.on.columnVisibilityChanged(this.scope, (handler: any) => { this.gridService.saveGridState("MingleListGrid", gridApi); });
                gridApi.core.on.filterChanged(this.scope, (handler: any) => { this.gridService.saveGridState("MingleListGrid", gridApi); });
                gridApi.colMovable.on.columnPositionChanged(this.scope, (handler: any) => { this.gridService.saveGridState("MingleListGrid", gridApi); });
                gridApi.colResizable.on.columnSizeChanged(this.scope, (handler: any) => { this.gridService.saveGridState("MingleListGrid", gridApi); });
                gridApi.cellNav.on.viewPortKeyDown(this.scope, (event: any) => {
                    if ((event.keyCode === 67) && (event.ctrlKey || event.metaKey)) {
                        let cells = gridApi.cellNav.getCurrentSelection();
                        this.copyCellContentToClipBoard(cells);
                    }
                });
                gridApi.selection.on.rowSelectionChanged(this.scope, (row: any) => {
                    this.gridService.saveGridState("MingleListGrid", gridApi);
                    this.MingleListRowSelected(row);
                });
                gridApi.selection.on.rowSelectionChangedBatch(this.scope, (row: any) => {
                    this.gridService.saveGridState("MingleListGrid", gridApi);
                });
            }
        }

        /**
        * Reset UI Grid Column Definitions (Required to reflect if the user changed the application language)
        */
        private resetUIGridsColumnDefs() {
            //Reset UI grids columnDefs
        }

        /**
        * Initialize theme on application start
        */
        private initTheme() {
            let themeId = this.storageService.getLocalData('h5.app.appName.theme.selected');
            let textureId = this.storageService.getLocalData('h5.app.appName.texture.selected');
            themeId = angular.isNumber(themeId) ? themeId : angular.isNumber(this.scope.globalConfig.defaultThemeId) ? this.scope.globalConfig.defaultThemeId : 1;
            textureId = angular.isNumber(textureId) ? textureId : angular.isNumber(this.scope.globalConfig.defaultTextureId) ? this.scope.globalConfig.defaultTextureId : 1;
            this.themeSelected(themeId);
            this.textureSelected(textureId);

            this.scope.themes.forEach((theme) => {
                if (this.scope.globalConfig.excludeThemes.indexOf(theme.themeId) > -1) {
                    theme.available = false;
                } else {
                    theme.available = true;
                }
            });
            this.scope.textures.forEach((texture) => {
                if (this.scope.globalConfig.excludeWallpapers.indexOf(texture.textureId) > -1) {
                    texture.available = false;
                } else {
                    texture.available = true;
                }
            });
        }

        /**
        * Initialize module on application start
        */

        private initModule() {
            window.addEventListener("contextmenu", e => {
                e.preventDefault();
                this.openContextMenu();

            });

            let moduleId = this.storageService.getLocalData('h5.app.appName.module.selected');
            moduleId = angular.isNumber(moduleId) ? moduleId : 1;
            this.scope.activeModule = moduleId;
            this.scope.modules.forEach((appmodule) => {
                if (angular.equals(moduleId, appmodule.moduleId)) {
                    appmodule.active = true;
                } else {
                    appmodule.active = false;
                }
                if (this.scope.globalConfig.excludeModules.indexOf(appmodule.moduleId) > -1) {
                    appmodule.available = false;
                } else {
                    appmodule.available = true;
                }
            });
        }

        /**
        *  Initialize language on application start
        */
        private initLanguage() {
            let languageCode = this.storageService.getLocalData('h5.app.appName.language.selected');
            languageCode = angular.isString(languageCode) ? languageCode : angular.isString(this.scope.globalConfig.defaultLanguage) ? this.scope.globalConfig.defaultLanguage : "en-US";
            this.scope.currentLanguage = languageCode;
            if (!angular.equals(this.scope.currentLanguage, "en-US")) {
                this.languageService.changeAppLanguage(languageCode).then((val: Odin.ILanguage) => {
                    this.resetUIGridsColumnDefs();
                }, (errorResponse: any) => {
                    Odin.Log.error("Error getting language " + errorResponse);
                    this.scope.statusBar.push({ message: "Error getting language " + errorResponse, statusBarMessageType: h5.application.MessageType.Error, timestamp: new Date() });

                });
            }
            this.scope.supportedLanguages.forEach((language) => {
                if (angular.equals(language.languageCode, languageCode)) {
                    language.active = true;
                } else {
                    language.active = false;
                }
                if (this.scope.globalConfig.excludeLanguages.indexOf(language.languageCode) > -1) {
                    language.available = false;
                } else {
                    language.available = true;
                }
            });
        }

        /**
        * Set the application theme
        * @param themeId the theme id
        */
        private themeSelected(themeId: number) {
            this.scope.themes.forEach((theme) => {
                if (angular.equals(theme.themeId, themeId)) {
                    theme.active = true;
                    this.scope.theme = theme;
                } else {
                    theme.active = false;
                }
            });
            this.storageService.setLocalData('h5.app.appName.theme.selected', themeId);
        }

        /**
        * Set the application background
        * @param textureId the texture id
        */
        private textureSelected(textureId: number) {
            this.scope.textures.forEach((texture) => {
                if (angular.equals(texture.textureId, textureId)) {
                    texture.active = true;
                    this.scope.texture = texture;
                } else {
                    texture.active = false;
                }
            });
            this.storageService.setLocalData('h5.app.appName.texture.selected', textureId);
        }

        /**
        * Get User Context for the logged in H5 user
        */
        private getUserContext() {
            Odin.Log.debug("is H5 " + this.userService.isH5() + " is Iframe " + Odin.Util.isIframe());
            this.scope.loadingData = true;
            this.userService.getUserContext().then((val: M3.IUserContext) => {
                this.scope.userContext = val;
                this.loadGlobalData();
            }, (reason: any) => {
                Odin.Log.error("Can't get user context from h5 due to " + reason.errorMessage);
                this.scope.statusBar.push({ message: "Can't get user context from h5 " + [reason.errorMessage], statusBarMessageType: h5.application.MessageType.Error, timestamp: new Date() });

                this.showError("Can't get user context from h5 ", [reason.errorMessage]);
                this.loadGlobalData();
            });
        }

        /**
        * Launch the H5 program or H5 link when the app runs inside the H5 client
        */
        private launchM3Program(link: string): void {
            Odin.Log.debug("H5 link to launch -->" + link);
            this.formService.launch(link);
        }

        /**
        * Trigger load application data when the user hit a specific key
        */
        private mapKeyUp(event: any) {
            //F4 : 115, ENTER : 13
            if (event.keyCode === 115) {
                this.loadApplicationData();
            }
        }

        /**
        * Used by infinite scroll functionality in the ui-select dropdown with large number of records
        */
        private addMoreItemsToScroll() {
            this.scope.infiniteScroll.currentItems += this.scope.infiniteScroll.numToAdd;
        };

        /**
        * Hack function to facilitate copy paste shortcut in ui grid cells
        */
        private copyCellContentToClipBoard(cells: any) {
            let hiddenTextArea = angular.element(document.getElementById("gridClipboard"));
            hiddenTextArea.val("");
            let textToCopy = '', rowId = cells[0].row.uid;
            cells.forEach((cell: any) => {
                textToCopy = textToCopy == '' ? textToCopy : textToCopy + ",";
                let cellValue = cell.row.entity[cell.col.name];
                if (angular.isDefined(cellValue)) {
                    if (cell.row.uid !== rowId) {
                        textToCopy += '\n';
                        rowId = cell.row.uid;
                    }
                    textToCopy += cellValue;
                }

            });
            hiddenTextArea.val(textToCopy);
            hiddenTextArea.select();
        }

        /**
        * Opens About Page in a modal window
        */
        private openAboutPage() {
            let options: any = {
                animation: true,
                templateUrl: "views/About.html",
                size: "md",
                scope: this.scope
            }
            this.scope.modalWindow = this.$uibModal.open(options);
        }

        /**
        * Opens the module window where user can change the application theme
        */
        private openChangeThemePage() {
            let options: any = {
                animation: true,
                templateUrl: "views/ChangeThemeModal.html",
                size: "md",
                scope: this.scope
            }
            this.scope.modalWindow = this.$uibModal.open(options);
        }

        /**
        * Opens the module window where user can change the application wallpaper
        */
        private openChangeWallpaperPage() {
            let options: any = {
                animation: true,
                templateUrl: "views/ChangeWallpaperModal.html",
                size: "md",
                scope: this.scope
            }
            this.scope.modalWindow = this.$uibModal.open(options);
        }

        /**
        * Opens the module window where user can change the application language
        */
        private openChangeAppLanguagePage() {
            let options: any = {
                animation: true,
                templateUrl: "views/ChangeLanguageModal.html",
                size: "md",
                scope: this.scope
            }
            this.scope.modalWindow = this.$uibModal.open(options);
        }

        /**
        * Change the application language
        * @param languageCode the language code to change
        */
        private changeAppLanguage(languageCode: string) {
            this.scope.supportedLanguages.forEach((language) => {
                if (angular.equals(language.languageCode, languageCode)) {
                    language.active = true;
                    this.scope.currentLanguage = languageCode;
                } else {
                    language.active = false;
                }
            });
            this.languageService.changeAppLanguage(languageCode).then((val: Odin.ILanguage) => {
                this.scope.appReady = false;
                this.closeModalWindow();
                this.resetUIGridsColumnDefs();
                this.$timeout(() => { this.scope.appReady = true; }, 1000);
            }, (errorResponse: any) => {
                Odin.Log.error("Error getting language " + errorResponse);
                this.scope.statusBar.push({ message: "Error getting language " + errorResponse, statusBarMessageType: h5.application.MessageType.Error, timestamp: new Date() });
            });
            this.storageService.setLocalData('h5.app.appName.language.selected', languageCode);
        }

        /**
        * Close the modal window if any opened
        */
        private closeModalWindow() {
            this.scope.MingleModule.MingleRecord.PK01 = "";
            this.scope.MingleModule.MingleRecord.PK02 = "";
            this.scope.MingleModule.MingleRecord.PK03 = "";
            this.scope.MingleModule.MingleRecord.PK04 = "";
            this.scope.modalWindow.close("close");
            this.loadMingleList();
            this.refreshTransactionStatus();
            this.hideMyError();
        }

        private statusBarClose() {
            this.scope.statusBarIsCollapsed = true;
            this.scope.statusBar = [];
        }

        private formatTime = function(statusBarItem: IStatusBarObj) {
            return statusBarItem.timestamp.getHours() + ':' + Odin.NumUtil.pad(statusBarItem.timestamp.getMinutes(), 2);
        };

        private removeAt = function(index) {
            if (index || index == 0) {
                this.scope.statusBar.splice(this.scope.statusBar.length - 1 - index, 1);
            }
            this.scope.statusBarIsCollapsed = this.scope.statusBar.length == 0;
        };

        /**
        * Function to parse the error response and display the error message in application error panel
        * @param errorResponse the error response of type ng.IHttpPromiseCallbackArg<any>
        */
        private parseError(errorResponse: ng.IHttpPromiseCallbackArg<any>) {
            let error = "Error occurred while processing below request(s)";
            let errorMessages: string[] = this.scope["errorMessages"];
            let errorMessage = "Request URL: " + errorResponse.config.url + ", Status: " + errorResponse.status +
                " (" + errorResponse.statusText + ")";
            if (angular.isObject(errorResponse.data) && angular.isObject(errorResponse.data.eLink)) {
                errorMessage = errorMessage + ", Error : " + errorResponse.data.eLink.code + " (" + errorResponse.data.eLink.message + ") ";
                if (angular.isString(errorResponse.data.eLink.details)) {
                    errorMessage = errorMessage + errorResponse.data.eLink.details;
                }
            }
            if (errorMessages.indexOf(errorMessage) == -1) {
                errorMessages.push(errorMessage);
            }
            this.showError(error, errorMessages);
            this.scope.statusBar.push({ message: error + " " + errorMessages, statusBarMessageType: h5.application.MessageType.Error, timestamp: new Date() });
        }

        /**
        * Show the error message in application error panel
        * @param error the error prefix/description to show
        * @param errorMessages array of error messages to display
        */
        private showError(error: string, errorMessages: string[]) {
            this.scope["hasError"] = true;
            this.scope["error"] = error;
            this.scope["errorMessages"] = errorMessages;
            if (angular.isObject(this.scope["destroyErrMsgTimer"])) {
                this.$timeout.cancel(this.scope["destroyErrMsgTimer"]);
            }
            this.scope["destroyErrMsgTimer"] = this.$timeout(() => { this.hideError(); }, 30000);
        }

        /**
        * Function to hide/clear the error messages
        */
        private hideError() {
            this.scope["hasError"] = false;
            this.scope["error"] = null;
            this.scope["errorMessages"] = [];
            this.scope["destroyErrMsgTimer"] = undefined;
        }

        /**
         * Show the warning message in application error panel
         * @param warning the warning prefix/description to show
         * @param warningMessages array of warning messages to display
         */
        private showWarning(warning: string, warningMessages: string[]) {
            this.scope["hasWarning"] = true;
            this.scope["warning"] = warning;
            this.scope["warningMessages"] = warningMessages;
            if (angular.isObject(this.scope["destroyWarnMsgTimer"])) {
                this.$timeout.cancel(this.scope["destroyWarnMsgTimer"]);
            }
            this.scope["destroyWarnMsgTimer"] = this.$timeout(() => { this.hideWarning(); }, 10000);
        }

        /**
        * Function to hide/clear the warning messages
        */
        private hideWarning() {
            this.scope["hasWarning"] = false;
            this.scope["warning"] = null;
            this.scope["warningMessages"] = null;
            this.scope["destroyWarnMsgTimer"] = undefined;
        }

        /**
        * Show the info message in application error panel
        * @param info the warning prefix/description to show
        * @param infoMessages array of info messages to display
        */
        private showInfo(info: string, infoMessages: string[]) {
            this.scope["hasInfo"] = true;
            this.scope["info"] = info;
            this.scope["infoMessages"] = infoMessages;
            if (angular.isObject(this.scope["destroyInfoMsgTimer"])) {
                this.$timeout.cancel(this.scope["destroyInfoMsgTimer"]);
            }
            this.scope["destroyInfoMsgTimer"] = this.$timeout(() => { this.hideInfo(); }, 10000);
        }

        /**
        * Function to hide/clear the info messages
        */
        private hideInfo() {
            this.scope["hasInfo"] = false;
            this.scope["info"] = null;
            this.scope["infoMessages"] = null;
            this.scope["destroyInfoMsgTimer"] = undefined;
        }

        /**
        * Add function calls which are required to be called during application load data for the first time 
        */
        private loadGlobalData() {
            let userContext = this.scope.userContext;
            let globalConfig = this.scope.globalConfig;
            this.loadAppConfig(userContext.company, userContext.division, userContext.m3User, globalConfig.environment).then((val: any) => {
                if (this.scope.appConfig.authorizedUser === true) { // added for security
                    // CHECK DIVISON RECORD
                    /*   this.appService.getCHGDIVAlphaRecord(userContext.m3User, userContext.division).then((valAlpha: M3.IMIResponse) => {
                           let newDivi = valAlpha.item.AL30;
                           if (newDivi != "") {
                               console.log("Division doesn't need to be changed");
                               userContext.division = newDivi;
                               userContext.company = newDivi;
                           } else {
   
                               console.log("Division doesn't need to be changed");
   
                           }
   
                           this.scope.MingleModule.transactionStatus.MingleRecord = false;
                           this.refreshTransactionStatus();
                       }, (err: M3.IMIResponse) => {
                           console.log("err");
                           console.log(err);
                       });*/
                    this.loadData(this.scope.activeModule);
                    this.loadDefaultFields();
                    this.hideWarning();
                } else {// added for security

                    window.alert("NOT Authorized, Please Contact Security"); // added for security

                }
            });
        }

        /**
        * Auto selecting an option based on the query parameters or logged in user's details
        */
        private loadDefaultFields() {
            let userContext = this.scope.userContext;
            let appConfig = this.scope.appConfig;
            let division = angular.isString(appConfig.searchQuery.divi) ? appConfig.searchQuery.divi : userContext.division;
            let warehouse = angular.isString(appConfig.searchQuery.whlo) ? appConfig.searchQuery.whlo : userContext.WHLO;
            let facility = angular.isString(appConfig.searchQuery.faci) ? appConfig.searchQuery.faci : userContext.FACI; //added
            this.scope.globalSelection.division = { selected: division };
            this.getUserDetails();
            this.loadUserGUIDList();
        }

        /**
        * Upon calling this function will reset the application data for all modules/tabs and load the application data for the active module/tab
        */
        private loadApplicationData() {
            let categories = ['globalSelection', 'MingleModule', 'customerMasterModule', 'MingleModule'];
            this.clearData(categories);
            this.resetReloadStatus();
            this.loadData(this.scope.activeModule);
        }

        /**
        * Re-initializing or clearing the data based on modules or categories/business logic should be implemented here
        * @param categories the categories to clear data
        */
        private clearData(categories: string[]) {
            categories.forEach((category) => {
                if (category == "globalSelection") {
                    //Reset data from the global selection object
                }
                if (category == "MingleModule") {
                    //Reset data from the specific module or category
                    this.scope.MingleModule.MingleList = [];
                }
            });
        }

        /**
        * Code for resetting reload status of all module's to stop showing loading indicator should be implemented here
        */
        private resetReloadStatus() {
            this.scope.MingleModule.reload = true;

        }

        /**
        * Call this function from the view when a tab/module is selected to load
        * @param moduleId the selected module id
        */
        private moduleSelected(moduleId: number) {
            this.scope.activeModule = moduleId;
            this.scope.modules.forEach((appmodule) => {
                if (angular.equals(moduleId, appmodule.moduleId)) {
                    appmodule.active = true;
                } else {
                    appmodule.active = false;
                }
            });
            this.storageService.setLocalData('h5.app.appName.module.selected', moduleId);
            this.loadData(this.scope.activeModule);
        }

        /**
        * This function will be called whenever the tab is selected, so add the functions calls with respect to the tab id
        * @param activeModule the module to activate/load
        */
        private loadData(activeModule: number) {
            this.refreshTransactionStatus();
            switch (activeModule) {
                case 1:
                    this.loadMingleModule(this.scope.MingleModule.reload);
                    break;
                case 2:
                    // this.loadCustomerMasterModule(this.scope.customerMasterModule.reload);
                    break;
                case 3:
                    //  this.loadItemGroupModule(this.scope.itemGroupModule.reload);
                    break;
                case 4:
                    break;
            }
        }

        /**
        * This function will be called to iterate over the transactions states of a tab and set the loading indicator to true if there any running transactions
        */
        private refreshTransactionStatus() {
            //Global Status
            let isLoading = false;
            for (let transaction in this.scope.transactionStatus) {
                let value = this.scope.transactionStatus[transaction];
                if (value == true) {
                    isLoading = true;
                    break;
                }
            }

            for (let transaction in this.scope.globalSelection.transactionStatus) {
                let value = this.scope.globalSelection.transactionStatus[transaction];
                if (value == true) {
                    isLoading = true;
                    break;
                }
            }
            this.scope.loadingData = isLoading;
            if (isLoading) { return; }

            switch (this.scope.activeModule) {
                case 1:
                    for (let transaction in this.scope.MingleModule.transactionStatus) {
                        let value = this.scope.MingleModule.transactionStatus[transaction];
                        if (value == true) {
                            isLoading = true;
                            break;
                        }
                    }
                    this.scope.loadingData = isLoading;
                    break;
                case 2:

                    break;
                case 3:

                    break;
                case 4:
                    break;
            }
        }

        //************************************************Application specific functions starts************************************************

        /**
         * Load Application Configurations
         */
        private loadAppConfig(company: string, division: string, user: string, environment: string): ng.IPromise<any> {

            let deferred = this.$q.defer();
            this.scope.appConfig = this.scope.globalConfig.appConfig;
            this.scope.appConfig.searchQuery = this.$location.search();
            this.scope.appConfig.enableM3Authority = true //added for security
            if (this.scope.appConfig.enableM3Authority) {

                this.scope.loadingData = true;
                this.scope.transactionStatus.appConfig = true;
                let programName = "CRZ009";
                let promise1 = this.appService.getAuthority(company, division, user, programName, 1).then((result: boolean) => {
                    this.scope.appConfig.authorizedUser = result;// added for security
                });

                let promises = [promise1];
                this.$q.all(promises).finally(() => {
                    deferred.resolve(this.scope.appConfig);
                    this.scope.transactionStatus.appConfig = false;
                    this.refreshTransactionStatus();
                });
            } else {
                deferred.resolve(this.scope.appConfig);
            }
            return deferred.promise;
        }


        /** //added
        * Load the ItemList (MITMAS)
        * @param company the company
        */

        private loadMingleList(): void {
            console.log("----------------------loadMingleList-------------------");

            this.scope.loadingData = true;
            this.scope.MingleModule.transactionStatus.MingleList = true;

            this.appService.lstUserGUID().then((val: M3.IMIResponse) => {
                console.log("----------------------lstUserGUID-------------------");
                console.log(val);
                this.scope.MingleModule.MingleRecord.userGUIDList = val.items;
                this.scope.MingleModule.user.selected = val.items[0];
                this.scope.MingleModule.transactionStatus.userGUIDList = false;

                this.refreshTransactionStatus();
            }, (err: M3.IMIResponse) => {
                this.scope.MingleModule.transactionStatus.MingleList = false;
                this.refreshTransactionStatus();
                let error = "API: " + err.program + "." + err.transaction + ", Input: " + JSON.stringify(err.requestData) + ", Error Code: " + err.errorCode;
                this.showError(error, [err.errorMessage]);
                this.scope.statusBar.push({ message: error + " " + err.errorMessage, statusBarMessageType: h5.application.MessageType.Error, timestamp: new Date() });

            }).finally(() => {
                this.refreshTransactionStatus();//must be in both statements IF NOT IN FANALLY
            });

        }
        private filterMingle(fileName: string, val: M3.IMIResponse): any {

            let filteredValues: Array<M3.IMIResponse> = [];
            val.items.forEach(function(value) {
                if (value.KPID === fileName) {
                    filteredValues.push(value);
                }
            });

            return filteredValues;

        }

        private displayDetailScreen(fieldName: string, selectedRow: any): void {
            this.loadMingleRecord(fieldName, selectedRow);
            this.openRecordDetailModal(fieldName, selectedRow);

        }
        private loadMingleRecord(fieldName: string, selectedRow): void {
            let pk01 = selectedRow.PK01;
            let pk02 = selectedRow.PK02;
            let pk03 = selectedRow.PK03;

            this.scope.loadingData = true;
            this.scope.MingleModule.transactionStatus.MingleRecord = true;
            this.appService.getMingleAlphaRecord(pk01, pk02, pk03).then((val: M3.IMIResponse) => {
                this.scope.MingleModule.MingleRecord = val.items[0];

                this.scope.MingleModule.transactionStatus.MingleRecord = false;
                this.refreshTransactionStatus();
            }, (err: M3.IMIResponse) => {
                this.scope.MingleModule.transactionStatus.MingleRecord = false;
                this.refreshTransactionStatus();
                let error = "API: " + err.program + "." + err.transaction + ", Input: " + JSON.stringify(err.requestData) + ", Error Code: " + err.errorCode;
                this.showError(error, [err.errorMessage]);
                this.scope.statusBar.push({ message: error + " " + err.errorMessage, statusBarMessageType: h5.application.MessageType.Error, timestamp: new Date() });
            });

            this.appService.getMingleNumericRecord(pk01, pk02, pk03).then((valNumeric: M3.IMIResponse) => {

                let n096 = (parseInt(valNumeric.item.N096) === 1) ? true : false;
                let n196 = (parseInt(valNumeric.item.N196) === 1) ? true : false;
                let n396 = (parseInt(valNumeric.item.N396) === 1) ? true : false;
                this.scope.MingleModule.MingleRecord.N096 = n096;
                this.scope.MingleModule.MingleRecord.N196 = n196;
                this.scope.MingleModule.MingleRecord.N396 = n396;
                this.scope.MingleModule.MingleRecord.N296 = parseInt(valNumeric.item.N296);
                this.scope.MingleModule.MingleRecord.N496 = parseInt(valNumeric.item.N496);
                this.scope.MingleModule.MingleRecord.N596 = parseInt(valNumeric.item.N596);
                this.scope.MingleModule.MingleRecord.N696 = parseInt(valNumeric.item.N696);
                this.scope.MingleModule.MingleRecord.N796 = parseInt(valNumeric.item.N796);
                this.scope.MingleModule.MingleRecord.N896 = parseInt(valNumeric.item.N896);
                this.scope.MingleModule.MingleRecord.N996 = parseInt(valNumeric.item.N996);
                this.scope.MingleModule.transactionStatus.MingleRecord = false;
                this.refreshTransactionStatus();
            }, (err: M3.IMIResponse) => {

            });
        }



        public saveMingleRecord(): void {

            // Needed keys
            let pk01 = this.scope.MingleModule.MingleRecord.PK01;
            let pk02 = this.scope.MingleModule.MingleRecord.PK02;
            let pk03 = this.scope.MingleModule.MingleRecord.PK03;
            // alpha fileds to save 
            let al30 = this.scope.MingleModule.MingleRecord.AL30;
            let al31 = this.scope.MingleModule.MingleRecord.AL31;
            al30 = al30.substring(0, 29);
            al31 = al31.substring(0, 14);
            let al32 = this.scope.MingleModule.MingleRecord.AL32;
            let al33 = ":";//this.scope.MingleModule.MingleRecord.AL33;
            let al34 = this.scope.MingleModule.MingleRecord.AL34;
            let al35 = this.scope.MingleModule.MingleRecord.AL35;
            let al36 = this.scope.MingleModule.MingleRecord.AL36;
            //NUMERIC
            let n096 = this.scope.MingleModule.MingleRecord.N096;
            let n196 = this.scope.MingleModule.MingleRecord.N196;
            let n296 = this.scope.MingleModule.MingleRecord.N296;
            let n396 = this.scope.MingleModule.MingleRecord.N396;
            let n496 = this.scope.MingleModule.MingleRecord.N496;
            let n596 = this.scope.MingleModule.MingleRecord.N596;
            let n696 = this.scope.MingleModule.MingleRecord.N696;
            let n796 = this.scope.MingleModule.MingleRecord.N796;
            let n896 = this.scope.MingleModule.MingleRecord.N896;
            let n996 = this.scope.MingleModule.MingleRecord.N996;




            //validation
            if (this.isValid() === false) {
                let error = "Invalid";
                this.showError(error, [error]);
            }
            else {
                this.appService.saveMingleAlphaRecord(pk01, pk02, pk03, al30, al31, al32, al33, al34, al35, al36).then((val: M3.IMIResponse) => {
                    this.appService.saveMingleNumericRecord(pk01, pk02, pk03, n096, n196, n296, n396, n496, n596, n696, n796, n896, n996).then((valNumerc: M3.IMIResponse) => {
                    }, (err: M3.IMIResponse) => {

                    });

                    this.scope.MingleModule.transactionStatus.MingleRecord = false;
                    this.loadMingleList();
                    this.refreshTransactionStatus();
                    this.closeModalWindow();
                }, (err: M3.IMIResponse) => {
                    console.log(err);
                    this.myError(err);
                });
            }
        }

        private closeWindow() {
            window.close();
        }
        public myError(err: M3.IMIResponse): void {
            this.scope.MingleModule.transactionStatus.MingleRecord = false;
            this.refreshTransactionStatus();
            let error = "API: " + err.program + "." + err.transaction + ", Input: " + JSON.stringify(err.requestData) + ", Error Code: " + err.errorCode;
            // let error = err.errorMessage;
            let field = err.errorField;
            if (field === "AL30") {
                field = "Description";
            }
            this.showMyError(err.errorMessage, [field]);
            this.scope.statusBar.push({ message: err.errorMessage + " " + err.errorMessage, statusBarMessageType: h5.application.MessageType.Error, timestamp: new Date() });

        }
        private showMyError(error: string, errorMessages: string[]) {
            this.scope["hasMyError"] = true;
            this.scope["myError"] = error;
            this.scope["myErrorMessages"] = errorMessages;
            if (angular.isObject(this.scope["destroyMyErrMsgTimer"])) {
                this.$timeout.cancel(this.scope["destroyMyErrMsgTimer"]);
            }
            this.scope["destroyMyErrMsgTimer"] = this.$timeout(() => { this.hideMyError(); }, 10000);
        }
        private hideMyError() {
            this.scope["hasMyError"] = false;
            this.scope["myError"] = null;
            this.scope["myErrorMessages"] = [];
            this.scope["destroyMyErrMsgTimer"] = undefined;
        }


        public displayDialog() {

            let r = confirm("Are you sure you want to delete " + this.scope.MingleModule.MingleRecord.PK01 + "?");
            if (r == true) {
                this.deleteRecord();
            }
            //document.getElementById("demo").innerHTML = txt;
        }

        public addRecord(): void {
            this.hideError();
            this.scope.MingleModule.transactionStatus.MingleRecord = true;
            // Needed keys
            //    let pk01 = this.scope.MingleModule.MingleRecord.PK01;
            let pk01 = this.scope.MingleModule.MingleRecord.PK02 + "_" + this.scope.MingleModule.MingleRecord.AL35;
            let pk02 = this.scope.MingleModule.MingleRecord.PK02;
            let pk03 = this.scope.MingleModule.MingleRecord.PK03;

            // alpha FIELDS to save 
            let al30 = this.scope.MingleModule.MingleRecord.AL30;
            let al31 = this.scope.MingleModule.MingleRecord.AL31;
            if (al31 == "" || al31 == null) {
                al31 = al30;
            }
            al30 = al30.substring(0, 29);
            al31 = al31.substring(0, 14);
            let al32 = this.scope.MingleModule.MingleRecord.AL32;
            let al33 = ":";//this.scope.MingleModule.MingleRecord.AL33;
            let al34 = this.scope.MingleModule.MingleRecord.AL34;
            let al35 = this.scope.MingleModule.MingleRecord.AL35;
            let al36 = this.scope.MingleModule.MingleRecord.AL36;
            //NUMERIC
            let n096 = this.scope.MingleModule.MingleRecord.N096;
            let n196 = this.scope.MingleModule.MingleRecord.N196;
            let n296 = this.scope.MingleModule.MingleRecord.N296;
            let n396 = this.scope.MingleModule.MingleRecord.N396;
            let n496 = this.scope.MingleModule.MingleRecord.N496;
            let n596 = this.scope.MingleModule.MingleRecord.N596;
            let n696 = this.scope.MingleModule.MingleRecord.N696;
            let n796 = this.scope.MingleModule.MingleRecord.N796;
            let n896 = this.scope.MingleModule.MingleRecord.N896;
            let n996 = this.scope.MingleModule.MingleRecord.N996;




            this.appService.addMingleAlphaRecord(pk01, pk02, pk03, al30, al31, al32, al33, al34, al35, al36).then((val: M3.IMIResponse) => {

                this.appService.addMingleNumeric(pk01, pk02, pk03, n096, n196, n296, n396, n496, n596, n696, n796, n896, n996).then((valNumerc: M3.IMIResponse) => {

                }, (err: M3.IMIResponse) => {

                });
                this.loadMingleList();
                this.refreshTransactionStatus();
                if (this.scope.MingleModule.isMultipleAdd === false) {
                    this.closeModalWindow();
                    this.scope.MingleModule.transactionStatus.MingleRecord = false;
                } else {
                    this.clearFileds();
                    this.scope.MingleModule.transactionStatus.MingleRecord = false;

                }
                // this.focusOn('AL30');
            }, (err: M3.IMIResponse) => {

                this.myError(err);
                this.scope.MingleModule.transactionStatus.MingleRecord = false;
            });



            //next call start here
        }


        focusOn(field): void {
            document.forms['submitForm'].elements[field].focus();

        }
        focusOnAL30(field): void {
            document.forms['submitForm'].elements['AL30'].focus();

        }
        public isValid(): boolean {

            return true;
        }
        public deleteRecord(): void {
            this.scope.MingleModule.transactionStatus.MingleRecord = true;
            // Needed keys
            let pk01 = this.scope.MingleModule.MingleRecord.PK01;//constant

            let pk02 = this.scope.MingleModule.MingleRecord.PK02;
            let pk03 = this.scope.MingleModule.MingleRecord.PK03;
            let pk04 = this.scope.MingleModule.MingleRecord.PK04;
            this.appService.deleteMingleAlphaRecord(pk01, pk02, pk03, pk04).then((val: M3.IMIResponse) => {
                this.loadMingleList();
                this.closeModalWindow();
                this.scope.MingleModule.transactionStatus.MingleRecord = false;
                this.refreshTransactionStatus();
            }, (err: M3.IMIResponse) => {
                this.myError(err);
            });
            //delete numeric
            this.appService.deleteMingleNumericRecord(pk01, pk02, pk03, pk04).then((val: M3.IMIResponse) => {
                this.loadMingleList();
                this.closeModalWindow();
                this.scope.MingleModule.transactionStatus.MingleRecord = false;
                this.refreshTransactionStatus();
            }, (err: M3.IMIResponse) => {


            });
        }
        public clearFileds(): void {
            this.scope.MingleModule.MingleRecord.KPID = "Mingle";
            this.scope.MingleModule.MingleRecord.PK01 = "";
            this.scope.MingleModule.MingleRecord.PK02 = "";//this.scope.userContext.division;
            this.scope.MingleModule.MingleRecord.PK03 = "";
            this.scope.MingleModule.MingleRecord.PK04 = "";//this.scope.userContext.language;
            this.scope.MingleModule.MingleRecord.AL30 = "";
            this.scope.MingleModule.MingleRecord.AL31 = "";
        }
        public sendMessage(): void {
            //get message to send
            // call API to send message
            //populate textare with messageOk 
        }
        public openAddRecordwindow(): void {
            let stco = this.scope.MingleModule.MingleRecord.PK01;

            this.scope.MingleModule.MingleRecord.PK01 = stco;


            this.scope.MingleModule.MingleRecord.KPID = "Mingle";
            this.scope.MingleModule.MingleRecord.PK01 = "";//
            this.scope.MingleModule.MingleRecord.PK02 = "";
            this.scope.MingleModule.MingleRecord.PK03 = "";
            this.scope.MingleModule.MingleRecord.AL30 = "";
            this.scope.MingleModule.MingleRecord.AL31 = "";
            this.scope.MingleModule.MingleRecord.AL32 = "";
            this.scope.MingleModule.MingleRecord.AL33 = "";
            this.scope.MingleModule.MingleRecord.AL34 = "";
            this.scope.MingleModule.MingleRecord.AL35 = "";
            this.scope.MingleModule.MingleRecord.AL36 = "";
            this.scope.MingleModule.MingleRecord.N096 = 0;
            this.scope.MingleModule.MingleRecord.N196 = 0;
            this.scope.MingleModule.MingleRecord.N296 = 0;
            this.scope.MingleModule.MingleRecord.N396 = 0;
            this.scope.MingleModule.MingleRecord.N496 = 0;
            this.scope.MingleModule.MingleRecord.N596 = 0;
            this.scope.MingleModule.MingleRecord.N696 = 0;
            this.scope.MingleModule.MingleRecord.N796 = 0;
            this.scope.MingleModule.MingleRecord.N896 = 0;
            this.scope.MingleModule.MingleRecord.N996 = 0;
            this.openMingleAddRecordModal();



        }
        public getUserDetails(): void {
            console.log("getUserDetails-------------------------");
            // call api for email
             this.scope.loadingData = true;
                     this.scope.MingleModule.transactionStatus.userGUIDList = true;
            this.appService.getEmailFromMingle().then((mingleResponse: M3.IMIResponse) => {
                console.log(" ---------getUserDetails--mingleResponse--------------");
                console.log(mingleResponse["UserDetailList"][0]);

                this.scope.MingleModule.MingleRecord.fromUserGUID  = mingleResponse["UserDetailList"][0].UserGUID
                this.scope.MingleModule.MingleRecord.fromUserEmail = mingleResponse["UserDetailList"][0].Email
                 this.scope.loadingData = false;
                     this.scope.MingleModule.transactionStatus.userGUIDList = false;
            }, (err: M3.IMIResponse) => {
                console.log("err-------------------------");
                console.log(err);
            });

        }
        private updToUser(item: string) {
            console.log("item ");
            console.log(item);
            this.scope.MingleModule.toUser = item;
            this.getUserDetails();
        }
        public sendMessageToUser(): void {
 
            let toUser = this.scope.MingleModule.toUser;
            console.log("  toUser --------------------------- " + toUser);
            let messageToSend = this.scope.MingleModule.MingleRecord.messageToSend;
            if (messageToSend != '') {

                //call api
                this.appService.sendMingleMessageToUser(this.scope.MingleModule.MingleRecord.fromUserGUID, toUser, messageToSend).then((mingleResponse: M3.IMIResponse) => {
                    console.log(" -----------sendMingleMessageToUser-mingleResponse-------------");
                    console.log(mingleResponse);
                    this.getCollegueFeed();

                }, (err: M3.IMIResponse) => {
                    console.log("err-------------------------");
                    console.log(err);

                });
            } else {
                this.getCollegueFeed();
            }

        }
        public getCollegueFeed(): void {
            this.clearMessages();
            let toUser = this.scope.MingleModule.toUser;
            let fromUser = this.scope.MingleModule.MingleRecord.fromUserGUID;
            //call api
            this.appService.getCollegueFeed(fromUser, toUser, 0, 0).then((mingleResponse: M3.IMIResponse) => {
                console.log(" -----------getCollegueFeed-mingleResponse-feeds------------");
                console.log(mingleResponse["Feeds"]);
                let feeds = mingleResponse["Feeds"];
                if (feeds != null) {
                    for (let i = feeds.length - 1; i > -1; i--) {
                        let feed = feeds[i];
                        let feedReplies = feed["CommentList"];
                        console.log("Message #" + " " + i + " " + feeds[i].MsgText);
                        this.scope.MingleModule.MingleRecord.messages += (feeds[i].MsgText + " \n ");
                        //Check for replies
                        if (feedReplies != null) {
                            for (let i = feedReplies.length - 1; i > -1; i--) {
                                console.log("        Replies #" + " " + i + " " + feedReplies[i].CommentText);//  console.log("Reply #" + " " + i + "        " +  );
                                this.scope.MingleModule.MingleRecord.messages += ("        Reply# " + i + " " + feedReplies[i].CommentText + " \n ");
                            }
                        }

                    }
                }
            }, (err: M3.IMIResponse) => {
                console.log("err-------------------------");
                console.log(err);

            });
        }
        public clearMessages(): void {
            this.scope.MingleModule.MingleRecord.messages = "";
            this.getUserDetails();
        }
        /**
        * Load the Mingle
        * @param reLoad the reLoad flag reference
        */
        private loadMingleModule(reLoad: boolean): void {
            let userContext = this.scope.userContext;

            if (reLoad) {
                this.clearData(["MingleModule"]);
                //                this.loadRecordList();
                this.loadMingleList();
            }
            this.scope.MingleModule.reload = false;
        }




        private openRecordDetailModal(fieldName: string, rowEntity: any): void { //POPUP
            let options: any = {
                animation: true,
                templateUrl: "views/MingleRecordDetail.html",
                size: "lg",
                scope: this.scope,
                backdrop: "static"
            }
            this.scope.modalWindow = this.$uibModal.open(options);
            // this.scope.itemGroupModule.selectedItemGroupListRow = rowEntity;
            this.scope.MingleModule.selectedMingleListRow = rowEntity;

        }
        private openMingleAddRecordModal(): void { //POPUP
            let options: any = {
                animation: true,
                templateUrl: "views/AddMingleRecordModal.html",
                size: "lg",
                scope: this.scope,
                backdrop: "static"
            }

            this.scope.modalWindow = this.$uibModal.open(options);
            //this.scope.itemGroupModule.selectedItemGroupListRow = rowEntity;
        }
        private openContextMenu(): void { //POPUP
            let options: any = {
                animation: true,
                templateUrl: "views/ContextMenu.html",
                size: "xs",
                scope: this.scope
            }
        }

        private MingleListRowSelected(selectedRow: any) {
            // console.log("selectedRow" + JSON.stringify(selectedRow.entity));
            this.scope.MingleModule.selectedMingleListRow = selectedRow.entity;
        }
    }
}