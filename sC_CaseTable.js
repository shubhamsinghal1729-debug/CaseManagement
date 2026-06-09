import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

const ACTIONS = [
    { label: 'View', name: 'view' },
    { label: 'Edit', name: 'edit' }
];

const COLUMNS = [

    {
        label: 'Case Number',
        fieldName: 'caseUrl',
        type: 'url',
        sortable: true,
        typeAttributes: {
            label: { fieldName: 'CaseNumber' },
            target: '_blank'
        }
    },

    {
        label: 'Subject',
        fieldName: 'Subject',
        sortable: true
    },

    {
        label: 'Status',
        fieldName: 'Status',
        sortable: true
    },

    {
        label: 'Priority',
        fieldName: 'Priority',
        sortable: true
    },

    {
        label: 'Type',
        fieldName: 'Type',
        sortable: true
    },

    {
        label: 'Owner',
        fieldName: 'OwnerName',
        sortable: true
    },

    {
        label: 'Created Date',
        fieldName: 'CreatedDate',
        type: 'date',
        sortable: true
    },

    {
        type: 'action',
        typeAttributes: {
            rowActions: ACTIONS
        }
    }
];

export default class SC_CaseTable extends NavigationMixin(
    LightningElement
) {

    columns = COLUMNS;

    @track tableData = [];

    @api
    set cases(value) {

        if(value) {

            this.tableData = value.map(
                record => {

                    return {

                        ...record,

                        caseUrl:
                            '/' + record.Id,

                        OwnerName:
                            record.Owner
                                ? record.Owner.Name
                                : ''
                    };
                }
            );
        }
    }

    get cases() {
        return this.tableData;
    }

    sortedBy;
    sortDirection = 'asc';

    handleSort(event) {

        this.sortedBy = event.detail.fieldName;
        this.sortDirection =
            event.detail.sortDirection;

        this.sortData(
            this.sortedBy,
            this.sortDirection
        );
    }

    sortData(fieldName, direction) {

        let cloneData =
            JSON.parse(
                JSON.stringify(this.tableData)
            );

        cloneData.sort((a, b) => {

            let valueA =
                a[fieldName] || '';

            let valueB =
                b[fieldName] || '';

            if(valueA > valueB) {
                return direction === 'asc'
                    ? 1 : -1;
            }

            if(valueA < valueB) {
                return direction === 'asc'
                    ? -1 : 1;
            }

            return 0;
        });

        this.tableData = cloneData;
    }

    handleRowSelection(event) {

        const selectedRows =
            event.detail.selectedRows;

        this.dispatchEvent(
            new CustomEvent(
                'rowselection',
                {
                    detail: selectedRows
                }
            )
        );
    }

    handleRowAction(event) {

        const actionName =
            event.detail.action.name;

        const row =
            event.detail.row;

        switch(actionName) {

            case 'view':
                this.openCaseRecord(
                    row.Id
                );
                break;

            case 'edit':
                this.editCaseRecord(
                    row.Id
                );
                break;

            default:
        }
    }

    openCaseRecord(recordId) {

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Case',
                actionName: 'view'
            }
        });
    }

    editCaseRecord(recordId) {

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Case',
                actionName: 'edit'
            }
        });
    }
}
