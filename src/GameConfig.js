const gameConfig = {
  gameTitle        : "GameTitle",
  version          : "0.1b",
  screenResolution : { width : 1920, height : 1080}, // comments if needed.
  ratio            : 1,
  sceneFadeTime    : 500,
  gameTimeInSeconds: 60,
  defaultFont      : "FontBold",
  hasHintpad       : false,
  hintpadData      : { hintpadIP : "128.0.0.0", hintpadMessage : " - up and running!"},
  devMode          : true,
  devModeOptions   : {disableConsoleLog :  false, showMouseCoords: false}, //
  startingScene    : "GameScene",
  uiLayer          : "UILayer",
  keyboardActive   : false
}

var width      = gameConfig.screenResolution.width;
var height     = gameConfig.screenResolution.height;
var centerX    = width * 0.5;
var centerY    = height * 0.5;

let gameData = {

  "mapID" : "aa01",   // the map user wants to play will be chosen in main menu

}
