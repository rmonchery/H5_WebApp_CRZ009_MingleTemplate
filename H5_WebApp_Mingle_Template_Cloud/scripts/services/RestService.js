var h5;
(function (h5) {
    var application;
    (function (application) {
        var RestService = (function () {
            function RestService($http, $q, configService, odinMIService) {
                this.$http = $http;
                this.$q = $q;
                this.configService = configService;
                this.odinMIService = odinMIService;
                this.init();
            }
            RestService.prototype.init = function () {
                var _this = this;
                this.configService.getGlobalConfig().then(function (configData) {
                    _this.globalConfig = configData;
                    if (angular.isDefined(_this.globalConfig.inforIONAPI) && (angular.isDefined(_this.globalConfig.inforIONAPI.URL) || _this.globalConfig.inforIONAPI.useSessionOAuth)) {
                        _this.setOAuthInfoIONAPI();
                    }
                }, function (errorResponse) {
                    console.log("Error while getting global configurations " + errorResponse);
                });
            };
            RestService.prototype.setOAuthInfoIONAPI = function () {
                var _this = this;
                var deferred = this.$q.defer();
                if (this.globalConfig.inforIONAPI.useSessionOAuth && angular.isDefined(this.globalConfig.inforIONAPI.sessionOAuthURL)) {
                    this.$http.get(this.globalConfig.inforIONAPI.sessionOAuthURL).then(function (response) {
                        _this.authInfoION = { access_token: response.data, token_type: "Bearer", refresh_token: null, expires_in: null, scope: null };
                        deferred.resolve(response);
                    });
                }
                else if (angular.isDefined(this.globalConfig.inforIONAPI) && angular.isDefined(this.globalConfig.inforIONAPI.URL)) {
                    var tokenURL = this.globalConfig.inforIONAPI.URL + "/" + this.globalConfig.inforIONAPI.access_token_url;
                    var formData = "grant_type=" + this.globalConfig.inforIONAPI.grant_type + "&username=" + this.globalConfig.inforIONAPI.username + "&password=" + this.globalConfig.inforIONAPI.password + "&client_id=" + this.globalConfig.inforIONAPI.client_id + "&client_secret=" + this.globalConfig.inforIONAPI.client_secret;
                    this.$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                    var response = this.$http.post(tokenURL, formData);
                    response.then(function (response) {
                        _this.authInfoION = response.data;
                        deferred.resolve(response);
                    });
                }
                else {
                    deferred.reject("Required ION REST API configurations are not available. Please contact support.");
                }
                return deferred.promise;
            };
            RestService.prototype.executeMingleGetRestService = function (transaction, requestData, requestMethod, contentType) {
                if (angular.isUndefined(this.globalConfig.inforMingleAPI) || angular.isUndefined(this.globalConfig.inforMingleAPI.URL)) {
                    var deferred = this.$q.defer();
                    var reason = {};
                    reason.status = 500;
                    reason.statusText = "Required Mingle REST API configurations are not available. Please contact support.";
                    deferred.reject(reason);
                    return deferred.promise;
                }
                else {
                    return this.executeIONRestService(this.globalConfig.inforMingleAPI.URL, transaction, requestData, "GET");
                }
            };
            RestService.prototype.executeMinglePOSTRestService = function (transaction, requestData, requestMethod, contentType) {
                if (angular.isUndefined(this.globalConfig.inforMingleAPI) || angular.isUndefined(this.globalConfig.inforMingleAPI.URL)) {
                    var deferred = this.$q.defer();
                    var reason = {};
                    reason.status = 500;
                    reason.statusText = "Required Mingle REST API configurations are not available. Please contact support.";
                    deferred.reject(reason);
                    return deferred.promise;
                }
                else {
                    return this.executeIONRestService(this.globalConfig.inforMingleAPI.URL, transaction, requestData, "POST");
                }
            };
            RestService.prototype.executeM3RestService = function (transaction, requestData) {
                if (angular.isUndefined(this.globalConfig.inforM3API) || angular.isUndefined(this.globalConfig.inforM3API.URL)) {
                    var deferred = this.$q.defer();
                    var reason = {};
                    reason.status = 500;
                    reason.statusText = "Required M3 REST API configurations are not available. Please contact support.";
                    deferred.reject(reason);
                    return deferred.promise;
                }
                else {
                    return this.executeIONRestService(this.globalConfig.inforM3API.URL, transaction, requestData);
                }
            };
            RestService.prototype.executeIONRestService = function (baseURL, transaction, requestData, requestMethod, contentType) {
                var _this = this;
                if (requestMethod === void 0) { requestMethod = "POST"; }
                if (contentType === void 0) { contentType = "application/json"; }
                var retries = 0;
                var maxRetry = 1;
                var deferred = this.$q.defer();
                if (angular.isUndefined(baseURL) || baseURL.length == 0) {
                    var reason = {};
                    reason.status = 500;
                    reason.statusText = "Required ION REST API configurations are not available. Please contact support.";
                    deferred.reject(reason);
                }
                else {
                    var URL_1 = baseURL + transaction;
                    var authInfo_1 = this.authInfoION;
                    Odin.Log.debug("Execute ION REST API " + transaction + " Is authInfo present " + Odin.Util.hasValue(authInfo_1) + ": " + JSON.stringify(authInfo_1));
                    var config_1 = null;
                    if (Odin.Util.hasValue(authInfo_1)) {
                        config_1 = {
                            headers: { 'Authorization': authInfo_1.token_type + ' ' + authInfo_1.access_token }
                        };
                    }
                    var response = null;
                    if (angular.equals("GET", requestMethod)) {
                        response = this.$http.get(URL_1, config_1);
                    }
                    else if (angular.equals("POST", requestMethod)) {
                        this.$http.defaults.headers.post['Content-Type'] = contentType;
                        response = this.$http.post(URL_1, requestData, config_1);
                    }
                    else if (angular.equals("PUT", requestMethod)) {
                        this.$http.defaults.headers.put['Content-Type'] = contentType;
                        response = this.$http.put(URL_1, requestData, config_1);
                    }
                    else if (angular.equals("DELETE", requestMethod)) {
                        response = this.$http.delete(URL_1, config_1);
                    }
                    response.then(function (response) {
                        deferred.resolve(response.data);
                    }, function (reason) {
                        reason.data = requestData;
                        Odin.Log.debug("Execute ION REST API '" + transaction + "' failed " + reason.status + ":" + reason.statusText);
                        if (reason.status == 401) {
                            while (retries < maxRetry) {
                                Odin.Log.debug("Retrying " + retries + ", as previous call to ION REST API '" + transaction + " failed due to token expired");
                                _this.setOAuthInfoIONAPI().then(function (response) {
                                    config_1 = {
                                        headers: { 'Authorization': authInfo_1.token_type + ' ' + authInfo_1.access_token }
                                    };
                                    var response1 = null;
                                    if (angular.equals("GET", requestMethod)) {
                                        response1 = _this.$http.get(URL_1, config_1);
                                    }
                                    else if (angular.equals("POST", requestMethod)) {
                                        _this.$http.defaults.headers.post['Content-Type'] = contentType;
                                        response1 = _this.$http.post(URL_1, requestData, config_1);
                                    }
                                    else if (angular.equals("PUT", requestMethod)) {
                                        _this.$http.defaults.headers.put['Content-Type'] = contentType;
                                        response1 = _this.$http.put(URL_1, requestData, config_1);
                                    }
                                    else if (angular.equals("DELETE", requestMethod)) {
                                        response1 = _this.$http.delete(URL_1, config_1);
                                    }
                                    response1.then(function (response) { deferred.resolve(response.data); }, function (reason) { deferred.reject(reason); });
                                });
                                retries++;
                            }
                        }
                        else {
                            if (reason.status == 0) {
                                reason.statusText = "An unexpected error occurred. Please check your network connection and try again in a moment. Contact support if the problem persists.";
                            }
                            deferred.reject(reason);
                        }
                    });
                }
                return deferred.promise;
            };
            RestService.prototype.executeIDMRestService = function (transaction, requestData, requestMethod, contentType) {
                if (angular.isUndefined(this.globalConfig.inforIDMAPI) || angular.isUndefined(this.globalConfig.inforIDMAPI.URL)) {
                    var deferred = this.$q.defer();
                    var reason = {};
                    reason.status = 500;
                    reason.statusText = "Required IDM REST API configurations are not available. Please contact support.";
                    deferred.reject(reason);
                    return deferred.promise;
                }
                else {
                    return this.executeIONRestService(this.globalConfig.inforIDMAPI.URL, transaction, requestData, requestMethod, contentType);
                }
            };
            RestService.prototype.executeM3MIRestService = function (program, transaction, requestData, maxReturnedRecords) {
                var deferred = this.$q.defer();
                return this.odinMIService.callWebService(program, transaction, requestData, maxReturnedRecords).then(function (val) {
                    val.requestData = requestData;
                    deferred.resolve(val);
                    return deferred.promise;
                }, function (val) {
                    val.requestData = requestData;
                    deferred.reject(val);
                    return deferred.promise;
                });
            };
            RestService.$inject = ["$http", "$q", "configService", "OdinMIService"];
            return RestService;
        }());
        application.RestService = RestService;
    })(application = h5.application || (h5.application = {}));
})(h5 || (h5 = {}));
