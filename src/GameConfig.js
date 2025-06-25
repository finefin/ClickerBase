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
  keyboardActive   : false,

  
  maxParticles :      5000


}

var width      = gameConfig.screenResolution.width;
var height     = gameConfig.screenResolution.height;
var centerX    = width * 0.5;
var centerY    = height * 0.5;

let gameData = {

    counter :         0,
    multiplier :      1,
    incrementValue :  1,
    autoInterval :    0,
    scl :             1,
    multiPrice :      1

}
