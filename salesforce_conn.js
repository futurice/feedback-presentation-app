var credentials = require('./salesforce-credentials.js'),
  jsforce = require('jsforce'),
  zeropad,
  conn = new jsforce.Connection({});
/*
 * Salesforce logic.
 */
zeropad = function(number, length){

  var numString = number+"";

  if (numString.length >= length) {
    return numString;
  } else {
    return zeropad("0"+numString, length);
  }

};    

exports.getSalesforceData = function() {

  console.log("Running update on ", new Date());

  conn.login(credentials.user, credentials.passwordtoken, function(err, userInfo) {
    if (err) { return console.error(err); }

    console.log("Bearer " + conn.accessToken);

    console.log(conn.instanceUrl);

    console.log("User ID: " + userInfo.id);
    console.log("Org ID: " + userInfo.organizationId);

    var closed_date = new Date(new Date() - (3*30*24*60*60*1000)); // Months, Days, Hours...
    var dateArray = [
      closed_date.getFullYear(),
      zeropad(closed_date.getUTCMonth()+1, 2),
      zeropad(closed_date.getUTCDay(), 2)
    ];
    var date = dateArray.join('-');


  console.log("Querying Salesforce.");

  conn.query('SELECT Id, Name, Account.Name, Account.Id, '+
    'Owner.Name, Owner.Id, Owner.Alias, Description, Amount, CloseDate, '+
    'Probability, StageName, IsClosed, IsWon, '+
    'Budgeted_Work_End_Date__c, Budgeted_Work_Start_Date__c, Average_Hour_Price__c, '+
    'Type, Futu_Team__c, LastModifiedDate, CreatedDate '+
    'FROM Opportunity WHERE CloseDate > ' + date,
    function(err, res) {
      if (err) { return console.error(err); }

      // Information about objects here:
      // http://www.salesforce.com/us/developer/docs/api/Content/sforce_api_objects_opportunity.htm

      // "Describe" in API:
      // https://eu1.salesforce.com/services/data/v30.0/sobjects/Opportunity/describe

      console.log('Done: ' + JSON.stringify(res));
      console.log("Fetched Opportunities from Salesforce.");
    });
  });
};
