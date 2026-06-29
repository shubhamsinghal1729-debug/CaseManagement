import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
// 1. Fixed: Import your getCases apex method
import getDashboardMetrics from '@salesforce/apex/sC_CaseManagementController.getDashboardMetrics';
import getCases from '@salesforce/apex/sC_CaseManagementController.getCases'; 

// 2. Fixed: Extend NavigationMixin properly
export default class SC_CaseManagement extends NavigationMixin(LightningElement) {

    columns = [
        { 
            label: 'Case Number', 
            fieldName: 'caseUrl', 
            type: 'url',
            sortable: true,
            typeAttributes: { 
                label: { fieldName: 'CaseNumber' }, // Maps to row.CaseNumber from Apex
                target: '_blank' 
            } 
        },
        { label: 'Subject', fieldName: 'Subject', type: 'text' },
        { label: 'Status', fieldName: 'Status', type: 'text' },
        { label: 'Priority', fieldName: 'Priority', type: 'text' },
        { label: 'Category', fieldName: 'Category__c', type: 'text' }, // Verify if custom field suffix __c is needed
        { label: 'Type', fieldName: 'Type', type: 'text' },
        { label: 'Agent', fieldName: 'OwnerName', type: 'text' }, // Uses flattened OwnerName mapping from your .map() function
        { label: 'Assignment Group', fieldName: 'Assignment_Group__c', type: 'text' }, // Verify custom API name
        { label: 'Sub-Group', fieldName: 'Sub_Group__c', type: 'text' }, // Verify custom API name
        { label: 'SLA Risk', fieldName: 'SLA_Risk__c', type: 'text' }, // Verify custom API name
        { label: 'Date Opened', fieldName: 'CreatedDate', type: 'date' }, // Maps to standard CreatedDate from Apex
        {
            type: 'action',
            typeAttributes: { rowActions: [{ label: 'View Details', name: 'view' }] },
        }
    ];

    // 3. Fixed: Declare all reactive variables used by template & logic
    totalCases = 0;
    inProgressCases = 0;
    newTodayCases = 0;
    overdueCases = 0;
    avgResponseTime = 0;
    resolutionRate = 0;
    cases = [];
    filteredCases = []; // Used by datatable to show active data
    activeTab = 'all';
    pageNumber = 1;
    totalRecords = 0;
    selectedCases = [];
    quickFindTerm = '';
    
    connectedCallback() {
        this.loadDashboard();
        this.loadCases(); // Uncommented to fetch data on init
    }

    loadDashboard() {
        getDashboardMetrics()
            .then(result => {
                var dashboardMetrics = result;
                console.log('@@@@@@@dashboardMetrics'+JSON.stringify(dashboardMetrics));
                this.totalCases = dashboardMetrics.totalCases;
                this.inProgressCases = dashboardMetrics.inProgressCases;
                this.newTodayCases = dashboardMetrics.newTodayCases;
                this.overdueCases = dashboardMetrics.overdueCases;
                this.avgResponseTime = dashboardMetrics.avgResponseTime;
                this.resolutionRate = dashboardMetrics.resolutionRate;
            })
            .catch(error => {
                console.error('Error fetching dashboard metrics: ', error);
            });
    }

    // Initial backend request structure mapping 
    filterRequest = {
        assignmentGroup: '',
        subGroup: '',
        status: '',
        priority: '',
        tabContext: 'all',
        pageNumber: 1
    };

    @track activeTab = 'all'; // Default active tab

    // Click handler to swap tabs
    handleTabClick(event) {
        this.activeTab = event.currentTarget.dataset.tab;
        this.cases = [];
        this.loadCases();
    }


    loadCases() {
        // Safe check to ensure filterRequest object exists
        const currentRequest = { 
            ...this.filterRequest, 
            pageNumber: this.pageNumber,
            tabContext: this.activeTab 
        };

        console.log('@@@@@@@@@101'+JSON.stringify(currentRequest));
        getCases({ request: currentRequest })
            .then(result => {
                if (result && result.cases) {
                    this.cases = result.cases.map(row => {
                        return {
                            ...row,
                            caseUrl: '/' + row.Id,
                            // Safe navigation utility if Owner is polymorphic or lazy-loaded
                            OwnerName: row.Owner ? row.Owner.Name : '' 
                        };
                    });
                    console.log('@@@@@@@@@@@114'+JSON.stringify(this.cases));
                   // this.filteredCases = [...this.cases];
                    this.totalRecords = result.totalRecords;
                    console.log('@@@@@@@@@@this.cases'+JSON.stringify(this.cases));
                }
            })
            .catch(error => {
                console.error('Error fetching cases: ', error);
            });
    }

    // 4. Fixed: Added Missing Template Action Handlers

    handleTabChange(event) {
        this.activeTab = event.target.value;
        this.pageNumber = 1; // Reset pagination context on tab switch
        this.loadCases();
    }

    handleQuickFind(event) {
        this.quickFindTerm = event.target.value.toLowerCase();
        if (this.quickFindTerm) {
            this.filteredCases = this.cases.filter(item => 
                (item.Subject && item.Subject.toLowerCase().includes(this.quickFindTerm)) ||
                (item.CaseNumber && item.CaseNumber.toLowerCase().includes(this.quickFindTerm))
            );
        } else {
            this.filteredCases = [...this.cases];
        }
    }

    handleTableSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        if (searchTerm) {
            this.filteredCases = this.cases.filter(item => 
                (item.Subject && item.Subject.toLowerCase().includes(searchTerm)) ||
                (item.CaseNumber && item.CaseNumber.toLowerCase().includes(searchTerm))
            );
        } else {
            this.filteredCases = [...this.cases];
        }
    }

    handleFilterChange(event) {
        this.filterRequest = event.detail;
        this.pageNumber = 1;
        this.loadCases();
    }

    handleSelection(event) {
        this.selectedCases = event.detail.selectedRows; // Correct selection retrieval payload mapping
    }

    handleNext() {
        this.pageNumber++;
        this.loadCases();
    }
    
    handlePrevious() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            this.loadCases();
        }
    }

    // Top Header Action Methods
    handleNewCase() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Case',
                actionName: 'new'
            }
        });
    }

    handleChangeOwner() { /* Logic for opening standard/custom change owner modal */ }
    handleAssignCase() { /* Logic to run assignment rules */ }
    handleUpdateStatus() { /* Global list update conversion status */ }
    handleCloseCase() { /* Mass case closing logic */ }

    // Dynamic label computing property 
    get tableTitle() {
        return this.activeTab === 'all' ? 'All Cases' : 
               this.activeTab === 'assigned' ? 'Assigned To Me' : 'My In Progress';
    }


    // Dynamic Class Getters
    get allCasesClass() {
        return `navigation-tab ${this.activeTab === 'all' ? 'custom-active-tab' : ''}`;
    }
    get assignedClass() {
        return `navigation-tab ${this.activeTab === 'assigned' ? 'custom-active-tab' : ''}`;
    }
    get inProgressClass() {
        return `navigation-tab ${this.activeTab === 'progress' ? 'custom-active-tab' : ''}`;
    }
    get pendingClass() {
        return `navigation-tab ${this.activeTab === 'pending' ? 'custom-active-tab' : ''}`;
    }
    get recentlyTouchedClass() {
        return `navigation-tab ${this.activeTab === 'touched' ? 'custom-active-tab' : ''}`;
    }

    // Tab Content Visibility Getters
    get isAllCases() { return this.activeTab === 'all'; }
    get isAssigned() { return this.activeTab === 'assigned'; }
    get isInProgress() { return this.activeTab === 'progress'; }
    get isPending() { return this.activeTab === 'pending'; }
    get isRecentlyTouched() { return this.activeTab === 'touched'; }
}
