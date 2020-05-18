module h5.application {

    export interface IAppService {
        getAuthority(company: string, division: string, m3User: string, programName: string, charAt: number): ng.IPromise<boolean>;
        getDivisionList(company: string, division: string): ng.IPromise<M3.IMIResponse>;
        getWarehouseList(company: string): ng.IPromise<M3.IMIResponse>;
        getFacilityList(company: string, division: string): ng.IPromise<M3.IMIResponse>;
        getMingleTableNames(): ng.IPromise<M3.IMIResponse>;
        lstUserGUID(): ng.IPromise<M3.IMIResponse>;
        saveMingleAlphaRecord(pk01: string, pk02: string, pk03: string, al30: string, al31: string, al32: string, al33: string, al34: string, al35: string, al36: string): ng.IPromise<M3.IMIResponse> ;
        saveMingleNumericRecord(pk01: string, pk02: string,pk03: string, n096: number, n196: number, n296: number, n396: number, n496: number, n596: number, n696: number, n796: number, n896: number, n996: number): ng.IPromise<M3.IMIResponse> 
        addMingleAlphaRecord(pk01: string, pk02: string, pk03: string, al30: string, al31: string, al32: string, al33: string, al34: string, al35: string, al36: string): ng.IPromise<M3.IMIResponse>; 
        addMingleNumeric(pk01: string, pk02: string,pk03: string, n096: boolean, n196: boolean, n296: number, n396: boolean, n496: number, n596: number, n696: number, n796: number, n896: number, n996: number): ng.IPromise<M3.IMIResponse> ;
        getMingleAlphaRecord(pk01: string,pk02: string,pk03: string): ng.IPromise<M3.IMIResponse> ;
        getMingleNumericRecord(pk01: string,pk02: string,pk03: string): ng.IPromise<M3.IMIResponse> ;
        deleteMingleAlphaRecord(pk01: string, pk02: string, pk03: string, pk04: string): ng.IPromise<M3.IMIResponse> ;
        deleteMingleNumericRecord(pk01: string, pk02: string, pk03: string, pk04: string): ng.IPromise<M3.IMIResponse> ;
        getCHGDIVAlphaRecord(pk01: string,pk02: string): ng.IPromise<M3.IMIResponse>;
         saveCHGDIVIAlphaRecord(pk01: string, pk02: string, al30: string, al31: string, al32: string, al33: string, al34: string, al35: string, al36: string): ng.IPromise<M3.IMIResponse> ;
        getEmailFromMingle(): ng.IPromise<M3.IMIResponse>;
        sendMingleMessageToUser(fromUserGUID: string, toUserGUID: string, messageRequest: any): ng.IPromise<M3.IMIResponse>;
        getCollegueFeed(fromUserGUID: string, toUserGUID: string, fromDate: number, toDate: number): ng.IPromise<M3.IMIResponse>;
        lstColleagues(userGUID: string): ng.IPromise<M3.IMIResponse> ;
    }

    export class AppService implements IAppService {

        static $inject = ["RestService", "$filter", "$q"];

        constructor(private restService: h5.application.IRestService, private $filter: h5.application.AppFilter, private $q: ng.IQService) {
        }

        public getAuthority(company: string, division: string, m3User: string, programName: string, charAt: number): ng.IPromise<boolean> {
            let request = {
                DIVI: division,
                USID: m3User,
                PGNM: programName
            };

            return this.restService.executeM3MIRestService("MDBREADMI", "SelCMNPUS30", request).then((val: M3.IMIResponse) => {
                if (angular.equals([], val.items)) {
                    request.DIVI = "";

                    return this.restService.executeM3MIRestService("MDBREADMI", "SelCMNPUS30", request).then((val: M3.IMIResponse) => {

                        if (angular.equals([], val.items)) {

                            return false;
                        } else {
                            let test = val.item.ALO;
                            if (charAt < test.length && '1' == test.charAt(charAt)) {
                                return true;
                            } else {
                                return false;
                            }

                        }
                    });
                } else {

                    let test = val.item.ALO;
                    if (charAt < test.length && '1' == test.charAt(charAt)) {
                        return true;
                    } else {

                        return false;
                    }
                }
            });
        }
        public getEmailFromMingle(): ng.IPromise<M3.IMIResponse> {

            let requestData = {
             
            };

            return this.restService.executeMingleGetRestService( "/SocialService.Svc/User/Detail", requestData).then((val: M3.IMIResponse) => { return val; });
        }
            public sendMingleMessageToUser(fromUserGUID: string, toUserGUID: string, messageRequest: string): ng.IPromise<M3.IMIResponse> {

            let requestData = {
        
                 "MessageText":  messageRequest
                
            };

            return this.restService.executeMinglePOSTRestService("/SocialService.Svc/User/"+fromUserGUID+"/ColleagueFeeds/"+toUserGUID, requestData).then((val: M3.IMIResponse) => { return val; });
        }
          public getCollegueFeed(fromUserGUID: string, toUserGUID: string, fromDate: number, toDate: number): ng.IPromise<M3.IMIResponse> {

            let requestData = {
                "BeforeDate": fromDate,
                "AfterDate": toDate                
                
            };

            return this.restService.executeMingleGetRestService("/SocialService.Svc/User/"+fromUserGUID+"/ColleagueFeeds/"+toUserGUID, requestData).then((val: M3.IMIResponse) => { return val; });
        }
             public lstColleagues(userGUID: string): ng.IPromise<M3.IMIResponse> {

            let requestData = {
                "userGUID": userGUID              
                
            };
                                                            ///SocialService.Svc/User/{userGUID}/Colleagues
            return this.restService.executeMingleGetRestService("/SocialService.Svc/User/"+userGUID+"/Colleagues", requestData).then((val: M3.IMIResponse) => { return val });
        }
        public lstUserGUID(): ng.IPromise<M3.IMIResponse> {

            let requestData = {
               FILE: "MINGLE",
                PK01:"GUID"
            };

            return this.restService.executeM3MIRestService("CUSEXTMI", "LstFieldValue", requestData).then((val: M3.IMIResponse) => { return val; });
        }
        public getMingleTableNames(): ng.IPromise<M3.IMIResponse> {
            let requestData = {
                FILE: "MINGLE",
                PK01:"GUID"

            };
            return this.restService.executeM3MIRestService("CUSEXTMI", "LstAlphaKPI", requestData).then((val: M3.IMIResponse) => { return val; });
        }
        public getMingleAlphaRecord(pk01: string,pk02: string,pk03: string): ng.IPromise<M3.IMIResponse> {

            let requestData = {
                KPID: "Mingle",
                PK01: pk01,
                PK02: pk02,
                PK03: pk03,



            };
            return this.restService.executeM3MIRestService("CUSEXTMI", "GetAlphaKPI", requestData).then((val: M3.IMIResponse) => { return val; });
        }

        public getMingleNumericRecord(pk01: string,pk02: string,pk03: string): ng.IPromise<M3.IMIResponse> {

            let requestData = {
                KPID: "Mingle",
               PK01: pk01,
                PK02: pk02,
                PK03: pk03,



            };
            return this.restService.executeM3MIRestService("CUSEXTMI", "GetNumericKPI", requestData).then((val: M3.IMIResponse) => { return val; });
        }
           public getCHGDIVAlphaRecord(pk01: string,pk02: string): ng.IPromise<M3.IMIResponse> {

            let requestData = {
                KPID: "CHGDIV",
               PK01: pk01,
                PK02: pk02,
               



            };
            return this.restService.executeM3MIRestService("CUSEXTMI", "GetAlphaKPI", requestData).then((val: M3.IMIResponse) => { return val; });
        }
        public getDivisionList(company: string, division: string): ng.IPromise<M3.IMIResponse> {
            let requestData = {
                CONO: company,
                DIVI: division
            };
            return this.restService.executeM3MIRestService("MNS100MI", "LstDivisions", requestData).then((val: M3.IMIResponse) => { return val; });
        }

        public getWarehouseList(company: string): ng.IPromise<M3.IMIResponse> {
            let requestData = {
                CONO: company
            };
            return this.restService.executeM3MIRestService("MMS005MI", "LstWarehouses", requestData, 0).then((val: M3.IMIResponse) => { return val; });
        }

        public getFacilityList(company: string, division: string): ng.IPromise<M3.IMIResponse> {
            let requestData = {
                CONO: company,
                DIVI: division
            };
            return this.restService.executeM3MIRestService("CRS008MI", "ListFacility", requestData).then((val: M3.IMIResponse) => { return val; });
        }



        public getCustomerList(company: string): ng.IPromise<M3.IMIResponse> {
            let requestData = {
                CONO: company
            }
            return this.restService.executeM3MIRestService("CRS610MI", "LstByName", requestData).then((val: M3.IMIResponse) => { return val; });
        }

      public saveCHGDIVIAlphaRecord(pk01: string, pk02: string, al30: string, al31: string, al32: string, al33: string, al34: string, al35: string, al36: string): ng.IPromise<M3.IMIResponse> {

            let requestData = {
                KPID: "CHGDIVI",
                PK01: pk01,
                PK02: pk02,
                AL30: al30,
                AL31: al31,
                AL32: al32,
                AL33: al33,
                AL34: al34,
                AL35: al35,
                AL36: al36,

            }
            return this.restService.executeM3MIRestService("CUSEXTMI", "ChgAlphaKPI", requestData).then((val: M3.IMIResponse) => { return val; });
        }

        public saveMingleNumericRecord(pk01: string, pk02: string,pk03: string, n096: number, n196: number, n296: number, n396: number, n496: number, n596: number, n696: number, n796: number, n896: number, n996: number): ng.IPromise<M3.IMIResponse> {

            let requestData = {
                KPID: "Mingle",
                PK01: pk01,
                PK02: pk02,
                PK03: pk03,

                N096: n096,
                N196: n196,
                N296: n296,
                N396: n396,
                N496: n496,
                N596: n596,
                N696: n696,
                N796: n796,
                N896: n896,
                N996: n996,

            }
            return this.restService.executeM3MIRestService("CUSEXTMI", "ChgNumericKPI", requestData).then((val: M3.IMIResponse) => { return val; });
        }
        public saveMingleAlphaRecord(pk01: string, pk02: string, pk03: string, al30: string, al31: string, al32: string, al33: string, al34: string, al35: string, al36: string): ng.IPromise<M3.IMIResponse> {

            let requestData = {
                KPID: "Mingle",
                PK01: pk01,
                PK02: pk02,
                PK03: pk03,
                AL30: al30,
                AL31: al31,
                AL32: al32,
                AL33: al33,
                AL34: al34,
                AL35: al35,
                AL36: al36,
            }
            return this.restService.executeM3MIRestService("CUSEXTMI", "ChgAlphaKPI", requestData).then((val: M3.IMIResponse) => { return val; });
        }
        public addMingleAlphaRecord(pk01: string, pk02: string, pk03: string, al30: string, al31: string, al32: string, al33: string, al34: string, al35: string, al36: string): ng.IPromise<M3.IMIResponse> {
            let requestData = {
                 KPID: "Mingle",
                PK01: pk01,
                PK02: pk02,
                PK03: pk03,
                AL30: al30,
                AL31: al31,
                AL32: al32,
                AL33: al33,
                AL34: al34,
                AL35: al35,
                AL36: al36,
            }
            return this.restService.executeM3MIRestService("CUSEXTMI", "AddAlphaKPI", requestData).then((val: M3.IMIResponse) => { return val; });
        }
        public addMingleNumeric(pk01: string, pk02: string,pk03: string, n096: boolean, n196: boolean, n296: number, n396: boolean, n496: number, n596: number, n696: number, n796: number, n896: number, n996: number): ng.IPromise<M3.IMIResponse> {
            let requestData = {
                KPID: "Mingle",
                PK01: pk01,
                PK02: pk02,
                PK03: pk03,

                N096: n096,
                N196: n196,
                N296: n296,
                N396: n396,
                N496: n496,
                N596: n596,
                N696: n696,
                N796: n796,
                N896: n896,
                N996: n996,
            }
            return this.restService.executeM3MIRestService("CUSEXTMI", "AddNumericKPI", requestData).then((val: M3.IMIResponse) => { return val; });
        }
        public deleteMingleAlphaRecord(pk01: string, pk02: string, pk03: string, pk04: string): ng.IPromise<M3.IMIResponse> {
            let requestData = {
                KPID: "Mingle",
                PK01: pk01,
                PK02: pk02,
                PK03: pk03,
                 
            }
            return this.restService.executeM3MIRestService("CUSEXTMI", "DelAlphaKPI", requestData).then((val: M3.IMIResponse) => { return val; });
        }
        public deleteMingleNumericRecord(pk01: string, pk02: string, pk03: string, pk04: string): ng.IPromise<M3.IMIResponse> {
            let requestData = {
                KPID: "Mingle",
                PK01: pk01,
                PK02: pk02,
                PK03: pk03,
                 
            }
            return this.restService.executeM3MIRestService("CUSEXTMI", "DelNumericKPI", requestData).then((val: M3.IMIResponse) => { return val; });
        }

    }
}