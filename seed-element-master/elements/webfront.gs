 function doGet(request) {
    var output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
   if(request.parameters.password == "password")
    { 
    var ss = SpreadsheetApp.openById("sheet_id");
    var doc = ss.getSheetByName("Sheet1");
  
    var range = doc.getRange(1, 1, doc.getLastRow(), doc.getLastColumn());
    var values = range.getValues();
    
    output.setContent(JSON.stringify(values))
    return output;
    }
    else
    {
        return null;
    }
}
