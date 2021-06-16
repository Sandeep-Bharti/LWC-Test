public class AccountService {

    @AuraEnabled( cacheable = true )
    public static List<Account> fetchAccounts() {

        try {

            List<Account> listAcc = new List<Account>();

            listAcc = [
                        SELECT Name, Id, Industry, OwnerId, Owner.Name, Phone, Website, AnnualRevenue
                        FROM Account
                        WHERE Industry = 'Financial Services'
                      ];

            return listAcc;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        
    }

    @AuraEnabled
    public static string updateAccounts( Object data ) {
        
        List <Account> accsForUpdate = ( List <Account> ) JSON.deserialize(
            JSON.serialize( data ),
            List <Account>.class
        );
        try {
            update accsForUpdate;
            return 'Success: Account(s) updated successfully';
        }
        catch (Exception e) {
            return 'The following exception has occurred: ' + e.getMessage();
        }

    }

}