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

exports.getSalesforceData = function(callback) {

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

  conn.query('SELECT Name, Account.Name, '+
    'Owner.Name, Futu_Team__c '+
    'FROM Opportunity WHERE IsWon = true AND IsClosed = true',
    function(err, res) {
      if (err) { return console.error(err); }

      // Information about objects here:
      // http://www.salesforce.com/us/developer/docs/api/Content/sforce_api_objects_opportunity.htm

      // "Describe" in API:
      // https://eu1.salesforce.com/services/data/v30.0/sobjects/Opportunity/describe
      var cleaned = [];
      for(var i = 0; i < res.records.length; i ++)
      {
        cleaned[i] = {project_name: res.records[i].Name , owner_name: res.records[i].Owner.Name, company_name: res.records[i].Account.Name, tribe: (res.records[i].Futu_Team__c ? res.records[i].Futu_Team__c : '') };
        
      }
      console.log(JSON.stringify(cleaned));
      callback(cleaned) ;
    });
  });
};
