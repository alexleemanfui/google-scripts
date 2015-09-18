// How to run this script
// 1. Create a google spreadsheet, change the sheet name to "Availability".
// 2. Click Tools -> Script editor to add this script.
// 3. Define these variables in script properties:
//    TELEGRAM_CHAT_IDS: Comma separated chat ids.
//    TELEGRAM_BOT_API_TOKEN: Authentication token to call the telegram bot api.

var AVAILABILITY_URL = "https://reserve.cdn-apple.com/HK/zh_HK/reserve/iPhone/availability.json";
var TELEGRAM_BOT_API_BASE_URL = "https://api.telegram.org/bot";

// The below variables are filled by the init function.
var TELEGRAM_CHAT_IDS = [];
var TELEGRAM_BOT_API_URL_SEND_MESSAGE = "";
var TELEGRAM_BOT_API_URL_SEND_PHOTO = "";

function init() {
  var scriptProperties = PropertiesService.getScriptProperties();
  TELEGRAM_CHAT_IDS = scriptProperties.getProperty('TELEGRAM_CHAT_IDS').split(",");

  var telegramBotApiToken = scriptProperties.getProperty("TELEGRAM_BOT_API_TOKEN");
  TELEGRAM_BOT_API_URL_SEND_MESSAGE = TELEGRAM_BOT_API_BASE_URL + scriptProperties.getProperty("TELEGRAM_BOT_API_TOKEN") + "/sendMessage";
  TELEGRAM_BOT_API_URL_SEND_PHOTO = TELEGRAM_BOT_API_BASE_URL + scriptProperties.getProperty("TELEGRAM_BOT_API_TOKEN") + "/sendPhoto";
}

function RetailStore(storeId, storeName) {
  this.storeId = storeId;
  this.storeName = storeName;
}

function PhoneModel(modelId, modelType, size, color, capacity, price) {
  this.modelId = modelId;
  this.modelType = modelType;
  this.size = size;
  this.color = color;
  this.capacity = capacity;
  this.price = price;
  this.modelDesc = modelType + " - " + capacity + " - " + color;
}

function getRetailStores() {
  var stores = [];
  stores.push(new RetailStore("R428", "IFC Mall"));
  stores.push(new RetailStore("R485", "Festival Walk"));
  stores.push(new RetailStore("R409", "Causeway Bay"));
  stores.push(new RetailStore("R499", "Canton Road"));
  return stores;
}

function getPhoneModels() {
  var models = [];
  models.push(new PhoneModel("MKQK2ZP/A", "iPhone 6s", "4.7 inch", "Silver", "16 GB", 5588));
  models.push(new PhoneModel("MKQL2ZP/A", "iPhone 6s", "4.7 inch", "Gold", "16 GB", 5588));
  models.push(new PhoneModel("MKQJ2ZP/A", "iPhone 6s", "4.7 inch", "Space Gray", "16 GB", 5588));
  models.push(new PhoneModel("MKQM2ZP/A", "iPhone 6s", "4.7 inch", "Rose Gold", "16 GB", 5588));
  models.push(new PhoneModel("MKQP2ZP/A", "iPhone 6s", "4.7 inch", "Silver", "64 GB", 6388));
  models.push(new PhoneModel("MKQQ2ZP/A", "iPhone 6s", "4.7 inch", "Gold", "64 GB", 6388));
  models.push(new PhoneModel("MKQN2ZP/A", "iPhone 6s", "4.7 inch", "Space Gray", "64 GB", 6388));
  models.push(new PhoneModel("MKQR2ZP/A", "iPhone 6s", "4.7 inch", "Rose Gold", "64 GB", 6388));
  models.push(new PhoneModel("MKQU2ZP/A", "iPhone 6s", "4.7 inch", "Silver", "128 GB", 7188));
  models.push(new PhoneModel("MKQV2ZP/A", "iPhone 6s", "4.7 inch", "Gold", "128 GB", 7188));
  models.push(new PhoneModel("MKQT2ZP/A", "iPhone 6s", "4.7 inch", "Space Gray", "128 GB", 7188));
  models.push(new PhoneModel("MKQW2ZP/A", "iPhone 6s", "4.7 inch", "Rose Gold", "128 GB", 7188));
  models.push(new PhoneModel("MKU22ZP/A", "iPhone 6s Plus", "5.5 inch", "Silver", "16 GB", 6388));
  models.push(new PhoneModel("MKU32ZP/A", "iPhone 6s Plus", "5.5 inch", "Gold", "16 GB", 6388));
  models.push(new PhoneModel("MKU12ZP/A", "iPhone 6s Plus", "5.5 inch", "Space Gray", "16 GB", 6388));
  models.push(new PhoneModel("MKU52ZP/A", "iPhone 6s Plus", "5.5 inch", "Rose Gold", "16 GB", 6388));
  models.push(new PhoneModel("MKU72ZP/A", "iPhone 6s Plus", "5.5 inch", "Silver", "64 GB", 7188));
  models.push(new PhoneModel("MKU82ZP/A", "iPhone 6s Plus", "5.5 inch", "Gold", "64 GB", 7188));
  models.push(new PhoneModel("MKU62ZP/A", "iPhone 6s Plus", "5.5 inch", "Space Gray", "64 GB", 7188));
  models.push(new PhoneModel("MKU92ZP/A", "iPhone 6s Plus", "5.5 inch", "Rose Gold", "64 GB", 7188));
  models.push(new PhoneModel("MKUE2ZP/A", "iPhone 6s Plus", "5.5 inch", "Silver", "128 GB", 8080));
  models.push(new PhoneModel("MKUF2ZP/A", "iPhone 6s Plus", "5.5 inch", "Gold", "128 GB", 8080));
  models.push(new PhoneModel("MKUD2ZP/A", "iPhone 6s Plus", "5.5 inch", "Space Gray", "128 GB", 8080));
  models.push(new PhoneModel("MKUG2ZP/A", "iPhone 6s Plus", "5.5 inch", "Rose Gold", "128 GB", 8080));
  return models;
}

function getTelegramApiUrl(methodName) {
  var userProperties = PropertiesService.getUserProperties();
  
  return TELEGRAM_BOT_API_BASE_URL + userProperties.getProperty("TELEGRAM_BOT_API_TOKEN") + "/" + methodName;
}

function createKey(storeId, modelId) {
  return storeId + ":" + modelId;
}

function scrapeAvailability(storeIds, modelIds) {
  var response = UrlFetchApp.fetch(AVAILABILITY_URL);
  var json = JSON.parse(response.getContentText());

  // Key="storeId:modelId", Value={true, false}
  var availabilityMap = {};
  for (var storeId in json) {
    if (storeIds.indexOf(storeId) < 0) {
      continue;
    }
    
    var store = json[storeId];
    for (var modelId in store) {
      if (modelIds.indexOf(modelId) >= 0) {
        availabilityMap[createKey(storeId, modelId)] = (store[modelId].toLowerCase() != "none")
      }
    }
  }
  return availabilityMap;
}

function getPreviousAvailability() {
  var spreadsheet = SpreadsheetApp.getActive();
  var sheet = spreadsheet.getSheetByName("Availability");
  
  var availabilityMap = {};
  if (sheet.getLastRow() > 1) {
    // Get the first two columns excluding first row.
    var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
    
    for (var row = 0; row < values.length; row++) {
      availabilityMap[values[row][0]] = values[row][1];
    }
  }
  return availabilityMap;
}

function saveAvailability(storeIds, modelIds, availabilityMap) {
  var spreadsheet = SpreadsheetApp.getActive();
  var sheet = spreadsheet.getSheetByName("Availability");

  sheet.getRange("A:B").clear();
  sheet.getRange("A1").setValue("Key");
  sheet.getRange("B1").setValue("IsAvailable");
  var row = 2;
  for (var i = 0; i < storeIds.length; i++) {
    for (var j = 0; j < modelIds.length; j++) {
      var key = createKey(storeIds[i], modelIds[j]);
      sheet.getRange(row, 1).setValue(key);
      sheet.getRange(row, 2).setValue((key in availabilityMap) && availabilityMap[key]);
      row++;
    }
  }
  
  var d = new Date();
  sheet.getRange("E1").setValue("LastUpdated");
  sheet.getRange("F1").setValue(d.toLocaleString());
}

function createChart(stores, models, availabilityMap) {
  var dataBuilder = Charts.newDataTable();
  
  // Add columns.
  dataBuilder.addColumn(Charts.ColumnType.STRING, "Model");
  for (var i = 0; i < stores.length; i++) {
    dataBuilder.addColumn(Charts.ColumnType.STRING, stores[i].storeName);
  }

  // Add rows.
  for (var i = 0; i < models.length; i++) {
    var row = [models[i].modelDesc];
    for (var j = 0; j < stores.length; j++) {
      var key = createKey(stores[j].storeId, models[i].modelId);
      var isAvailable = (key in availabilityMap) && availabilityMap[key];
      row.push(isAvailable ? "Yes" : "No");
    }
    dataBuilder.addRow(row);
  }

  var chart = Charts.newTableChart()
    .setDataTable(dataBuilder.build())
    .setDimensions(700, 600)
    .useAlternatingRowStyle(true)
    .build();
  return chart;
}

function notify(isAvailable, chart) {
  var chartBlob = chart.getBlob();
  var chartFileName = "availability.png";
  var chartContentType = chartBlob.getContentType();
  var boundary = "iphone_notification";

  for (var i = 0; i < TELEGRAM_CHAT_IDS.length; i++) {
    var chatId = TELEGRAM_CHAT_IDS[i];
    
    // Prepare text message.
    var textMessage = isAvailable ? "iPhones 6s are available for sale!" : "iPhones 6s are sold out!";
    var messagePayload = {
      "chat_id": chatId,
      "text": textMessage
    };
    var sendMessageOptions = {
      "method": "post",
      "payload": messagePayload
    };
    
    // Prepare chart.
    var requestBody = Utilities.newBlob("--" + boundary + "\r\n"
      + "Content-Disposition: form-data; name=\"chat_id\"\r\n\r\n" + chatId + "\r\n"
      + "--" + boundary + "\r\n"
      + "Content-Disposition: form-data; name=\"photo\"; filename=\"" + chartFileName + "\"\r\n"
      + "Content-Type: " + chartContentType + "\r\n\r\n").getBytes();
    requestBody = requestBody.concat(chartBlob.getBytes());
    requestBody = requestBody.concat(Utilities.newBlob("\r\n--" + boundary + "--\r\n").getBytes());

    var sendPhotoOptions = {
      method: "post",
      contentType: "multipart/form-data; boundary=" + boundary,
      payload: requestBody
    };
    
    UrlFetchApp.fetch(TELEGRAM_BOT_API_URL_SEND_MESSAGE, sendMessageOptions);
    UrlFetchApp.fetch(TELEGRAM_BOT_API_URL_SEND_PHOTO, sendPhotoOptions);
  }
}

function main() {
  init();
  var stores = getRetailStores();
  var storeIds = stores.map(function(item) { return item.storeId; });

  var models = getPhoneModels();
  var modelIds = models.map(function(item) { return item.modelId; });

  var previousAvailability = getPreviousAvailability();
  var currentAvailability = scrapeAvailability(storeIds, modelIds);
  saveAvailability(storeIds, modelIds, currentAvailability);
  
  // Check if availability changed.
  var availabilityChanged = false;
  var isAnyAvailable = false;
  for (var i = 0; i < stores.length; i++) {
    for (var j = 0; j < models.length; j++) {
      var key = createKey(stores[i].storeId, models[j].modelId);
      var isAvailableNow = (key in currentAvailability) && currentAvailability[key];
      var isAvailablePreviously = (key in previousAvailability) && previousAvailability[key];
      
      isAnyAvailable |= isAvailableNow;
      if (isAvailableNow != isAvailablePreviously) {
        availabilityChanged = true;
      }
    }
  }
  
  // Notify.
  if (availabilityChanged) {
    var chart = createChart(stores, models, currentAvailability);
    notify(isAnyAvailable, chart);
  }
}
