import { LightningElement, track } from 'lwc';

export default class SC_CaseFilters extends LightningElement {

    @track assignmentGroup;
    @track subGroup;
    @track agent;
    @track priority;
    @track status;
    @track category;
    @track type;
    @track slaRisk;
    @track searchText;
    @track startDate;
    @track endDate;

    assignmentGroupOptions = [
        { label: 'Support', value: 'Support' },
        { label: 'Billing', value: 'Billing' },
        { label: 'Technical', value: 'Technical' }
    ];

    subGroupOptions = [
        { label: 'L1', value: 'L1' },
        { label: 'L2', value: 'L2' },
        { label: 'L3', value: 'L3' }
    ];

    agentOptions = [
        { label: 'John Smith', value: 'John Smith' },
        { label: 'Mike Ross', value: 'Mike Ross' }
    ];

    priorityOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' }
    ];

    statusOptions = [
        { label: 'New', value: 'New' },
        { label: 'Working', value: 'Working' },
        { label: 'Closed', value: 'Closed' }
    ];

    categoryOptions = [
        { label: 'Product', value: 'Product' },
        { label: 'Service', value: 'Service' }
    ];

    typeOptions = [
        { label: 'Question', value: 'Question' },
        { label: 'Problem', value: 'Problem' }
    ];

    slaRiskOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' }
    ];

    handleAssignmentGroup(event) {
        this.assignmentGroup = event.detail.value;
    }

    handleSubGroup(event) {
        this.subGroup = event.detail.value;
    }

    handleAgent(event) {
        this.agent = event.detail.value;
    }

    handlePriority(event) {
        this.priority = event.detail.value;
    }

    handleStatus(event) {
        this.status = event.detail.value;
    }

    handleCategory(event) {
        this.category = event.detail.value;
    }

    handleType(event) {
        this.type = event.detail.value;
    }

    handleSlaRisk(event) {
        this.slaRisk = event.detail.value;
    }

    handleSearch(event) {
        this.searchText = event.target.value;
    }

    handleStartDate(event) {
        this.startDate = event.target.value;
    }

    handleEndDate(event) {
        this.endDate = event.target.value;
    }

    applyFilters() {

        const filters = {

            assignmentGroup: this.assignmentGroup,
            subGroup: this.subGroup,
            agent: this.agent,
            priority: this.priority,
            status: this.status,
            category: this.category,
            type: this.type,
            slaRisk: this.slaRisk,
            searchText: this.searchText,
            startDate: this.startDate,
            endDate: this.endDate
        };

        this.dispatchEvent(
            new CustomEvent(
                'filterchange',
                {
                    detail: filters
                }
            )
        );
    }

    resetFilters() {

        this.assignmentGroup = null;
        this.subGroup = null;
        this.agent = null;
        this.priority = null;
        this.status = null;
        this.category = null;
        this.type = null;
        this.slaRisk = null;
        this.searchText = null;
        this.startDate = null;
        this.endDate = null;

        this.applyFilters();
    }
}
