import { LightningElement, track, wire } from 'lwc';
import getAccounts from '@salesforce/apex/AccountService.fetchAccounts';
import { updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateAccounts from '@salesforce/apex/AccountService.updateAccounts';

const actions = [
    { label: 'View', name: 'view' },
    { label: 'Edit', name: 'edit' },
];
 
const columns = [   
    { label: 'Account Name', fieldName: 'Name', sortable: true, editable: true},
    { label: 'Account Owner', fieldName: 'OwnerId', sortable: true, editable: true },
    { label: 'Website', fieldName: 'Website', editable: true},
    { label: 'Annual Revenue', fieldName: 'AnnualRevenue', editable: true},
    { label: 'Phone', fieldName: 'Phone', editable: true },
    { label: 'Id', fieldName: 'Id' },
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    },
];

export default class FinancialServicesAccounts extends NavigationMixin(LightningElement) {
    

    
    @track listAccount;
    @track error;
    @track columns = columns;
    data;
    sortedBy;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    accounts;
    draftValues = [];


    // @wire(getAccounts)
    // accs(result) {
    //     this.listAccount = result;
    //     this.data = result;
    //     if(result.error) {
    //         this.listAccount = undefined;
    //     }
    // };
    connectedCallback() {


        getAccounts().then(res => {

            console.log('res12345:::',res);
            this.listAccount = res;
            this.data = res;
            this.listAccount = [...this.listAccount]
           
            

        }).catch(error => {
            console.log('error');
        });

    }


    onHandleSort( event ) {

        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.listAccount];

        cloneData.sort( this.sortBy( sortedBy, sortDirection === 'asc' ? 1 : -1 ) );
        this.listAccount = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;

    }


    sortBy( field, reverse, primer ) {

        const key = primer
            ? function( x ) {
                  return primer(x[field]);
              }
            : function( x ) {
                  return x[field];
              };

        return function( a, b ) {
            a = key(a);
            b = key(b);
            return reverse * ( ( a > b ) - ( b > a ) );
        };

    }

    updateSearch(event) {

        console.log(event.target.value);
        console.log(event.target.value.length);
        var regex = new RegExp(event.target.value, 'gi');
        this.listAccount = this.listAccount.filter( row => regex.test(row.Name));
        if(event.target.value.length == 0) {

            this.listAccount = this.data;
        }

    }


    handleRowAction( event ) {

        const actionName = event.detail.action.name;
        const row = event.detail.row;
        console.log('row', row);
        switch ( actionName ) {
            case 'view':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        actionName: 'view'
                    }
                });
                break;
            case 'edit':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: 'Account',
                        actionName: 'edit'
                    }
                });
                break;
            default:
        }

    }

    async handleSave(event) {console.log('row:::',event.detail.row);
        console.log('Name::',event.detail.draftValues[0]);
        const updatedFields = event.detail.draftValues;

        await updateAccounts( { data: updatedFields } )
        .then( result => {

            console.log( JSON.stringify( "Apex update result: " + result ) );
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account(s) updated',
                    variant: 'success'
                })
            );
            
            refreshApex( this.listAccount ).then( () => {
                this.draftValues = [];
            });        

        }).catch( error => {

            console.log( 'Error is ' + JSON.stringify( error ) );
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating or refreshing records',
                    message: error.body.message,
                    variant: 'error'
                })
            );

        });

    }

        /*this.saveDraftValues = event.detail.draftValues;
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);console.log('fields:',fields);
            return { fields }
        })
        
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Record Updated',
                    variant: 'success'
                })
            );

            this.saveDraftValues = [];
            return this.refresh();

        }).catch(error => {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Error Occoured while updating Record',
                    variant: 'error'
                })
            );

        }).finally(()=> {
            this.saveDraftValues = [];
        });*/
       
    



}