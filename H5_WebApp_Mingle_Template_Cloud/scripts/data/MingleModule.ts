module h5.application {
    export interface MingleModule {

        reload: boolean;
        transactionStatus: {
            MingleList: boolean,
            MingleRecord: boolean,
            isMultipleAdd: boolean,
             userGUIDList: boolean;
            user: boolean;
            toUser:boolean;
        };

        messages: string;
        messageToSend: any;
        MingleList: any; //list of table names
        MingleListGrid: IUIGrid;
        selectedMingleListRow: any;
        MingleRecord: any;
        userGUIDList: any;
        user:any;
        toUser:any;
        loadMingleRecordModule: any //the function that will be called when a selection is made
        isMultipleAdd: boolean,

    }
}