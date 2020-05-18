var h5;
(function (h5) {
    var application;
    (function (application) {
        function m3Date($filter) {
            return function (m3DateString, dateFormat) {
                if (angular.isString(m3DateString) && m3DateString.length == 8) {
                    var dateString = m3DateString.substring(4, 6) + "/" + m3DateString.substring(6, 8) + "/" + m3DateString.substring(0, 4);
                    var date = Date.parse(dateString);
                    if (isNaN(date)) {
                        return m3DateString;
                    }
                    else {
                        return $filter('date')(date, dateFormat);
                    }
                }
                else {
                    return m3DateString;
                }
            };
        }
        application.m3Date = m3Date;
        function rollingDate($filter) {
            return function (m3DateString) {
                var rollingDate = "6";
                if (angular.isString(m3DateString) && m3DateString.length == 8) {
                    var dateString = m3DateString.substring(4, 6) + "/" + m3DateString.substring(6, 8) + "/" + m3DateString.substring(0, 4);
                    var time = Date.parse(dateString);
                    var date = new Date(time);
                    var currentDate = new Date();
                    var monthDiff = (currentDate.getDate() - date.getDate()) / 30 + currentDate.getMonth() - date.getMonth() + (12 * (currentDate.getFullYear() - date.getFullYear()));
                    if (monthDiff <= 6) {
                        rollingDate = "6";
                    }
                    else if (monthDiff <= 12) {
                        rollingDate = "12";
                    }
                    else if (monthDiff <= 24) {
                        rollingDate = "24";
                    }
                    else if (monthDiff <= 36) {
                        rollingDate = "36";
                    }
                    else if (monthDiff <= 48) {
                        rollingDate = "48";
                    }
                    else if (monthDiff <= 60) {
                        rollingDate = "60";
                    }
                    else if (monthDiff > 60) {
                        rollingDate = "NOK";
                    }
                    return rollingDate;
                }
                else {
                    return rollingDate;
                }
            };
        }
        application.rollingDate = rollingDate;
        function m3DateFilter($filter) {
            return function (condition, searchTerm, cellValue) {
                var term = searchTerm.replace(/\\/g, '');
                if (angular.isString(term) && term.length >= 8) {
                    var parseDate = Date.parse(term);
                    var m3DateString = $filter('date')(parseDate, "yyyyMMdd");
                    if (condition == 64) {
                        return parseInt(cellValue) >= parseInt(m3DateString);
                    }
                    else if (condition == 256) {
                        return parseInt(cellValue) <= parseInt(m3DateString);
                    }
                }
                else {
                    return cellValue.indexOf(term.replace(/\//g, '')) != -1;
                }
                return false;
            };
        }
        application.m3DateFilter = m3DateFilter;
        function numberStringFilter($filter) {
            return function (condition, searchTerm, cellValue) {
                var term = searchTerm.replace(/\\\./, '.').replace(/\\\-/, '-');
                if (!isNaN(parseFloat(term))) {
                    if (condition == 64) {
                        return parseFloat(cellValue) >= parseFloat(term);
                    }
                    else if (condition == 256) {
                        return parseFloat(cellValue) <= parseFloat(term);
                    }
                }
                else {
                    return cellValue.toString().indexOf(term) != -1;
                }
                return false;
            };
        }
        application.numberStringFilter = numberStringFilter;
    })(application = h5.application || (h5.application = {}));
})(h5 || (h5 = {}));
