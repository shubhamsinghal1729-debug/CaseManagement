import { LightningElement } from 'lwc';
import { NavigationMixin }  from 'lightning/navigation';
import getDashboardMetrics from '@salesforce/apex/sC_CaseManagementController.getDashboardMetrics';

export default class SC_CaseManagement extends LightningElement{

    columns = [
        {
            label:'Case Number',
            fieldName:'caseUrl',
            type:'url'
        },
        {
            label:'Subject',
            fieldName:'Subject'
        },
        {
            label:'Status',
            fieldName:'Status'
        },
        {
            label:'Priority',
            fieldName:'Priority'
        },
        {
            label:'Owner',
            fieldName:'OwnerName'
        }
    ];

    dashboardMetrics;
    cases = [];

    connectedCallback(){
        this.loadDashboard();
      //  this.loadCases();
    }

    loadDashboard(){
        getDashboardMetrics()
        .then(result => {
            this.dashboardMetrics = result;
        })
        .catch(error => {
            console.error(error);
        });
    }

    loadCases(){
        getCases({
            request:this.filterRequest
        })
        .then(result => {
           // this.cases = result.cases;
            this.cases = result.cases.map(row => {
                return {...row,
                    caseUrl: '/' + row.Id,
                    OwnerName: row.Owner.Name
                };
            });
            this.totalRecords = result.totalRecords;
        });
    }

    handleNext(){
        this.pageNumber++;
        this.loadCases();
    }
    
    handlePrevious(){
        if(this.pageNumber > 1){
            this.pageNumber--;
            this.loadCases();
        }
    }

    handleFilterChange(event) {
        this.filterRequest = event.detail;
        this.pageNumber = 1;
        this.loadCases();
    }
    handleSelection(event) {
        this.selectedCases = event.detail;
    }
    
    navigateToCase(caseId){
        this[NavigationMixin.Navigate]({
            type:'standard__recordPage',
            attributes:{
                recordId:caseId,
                objectApiName:'Case',
                actionName:'view'
            }
        });
    }
}
