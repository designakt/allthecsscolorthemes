
const fs = require('fs');
const cssColors = require('css-color-names'); // console.dir(csscolors);
const Color = require('color');

// perceptive luminance calculation
// TODO: - consider using color.luminosity(); instead - might change results and is inverted
var perceptiveLuminance = function (r, g, b) {
  // Counting the perceptive luminance
  // human eye favors green color...
  var a = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return a; // 1 = black, 0 is white
}
var colourIsLight = function (r, g, b) {
  return (perceptiveLuminance(r, g, b) < 0.5);
}

// Make first Letter in a string uppercase
function firstToUpperCase( str ) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
}

// define prcess vars
var topDir = "./themes/";
var themeDir = ""; // name of theme
var testFileName = "index.html";
var themeFileName = "manifest.json";

// content pieces for html test file (index.html)
var testFileIntro = "<html><head><style>body {display: flex;flex-wrap: wrap;} div {padding: 1em;font: 1em sans-serif;flex: 1 0 auto;}</style></head><body>";
var testFileThemeStart = "<div style=\"background-color:";
var testFileThemeMid =  "; color:";
var testFileThemeMid2 = "; \">Theme - CSS ";
var testFileThemeEnd = "</div>";
var testFileEnd = "</body>";
// temporary test-file content storage
var testFileString = "";

// content pieces for individual theme file
var themeFileIntro = "{\"description\": \"A theme based on ";
// inset Name of color
var themeFileMid1 =  ", a color name defined in CSS 3 Extended Color Keywords.\",\"manifest_version\": 2,\"name\": \"";
// insert Name of color
var themeFileMid2 = " - CSS Named Color Theme\",\"version\": \"0.1\",\"homepage_url\": \"https://markusjaritz.com\",\"theme\": {\"images\": {\"theme_frame\": \"\"},\"colors\": {\"frame\": [";
// insert Background color. format: "RRR, GGG, BBB"
var themeFileMid3 = "],\"tab_text\": [";
// insert foreground color. fromat: "RRR, GGG, BBB"
var themeFileEnd = "]}}}";
// temporary theme content storage
var themeFileString = "";


// Start process
process.stdout.write("Creating themes");

// console.log(csscolors);

// create top directory (if it does not exist)
if (!fs.existsSync(topDir)) fs.mkdirSync(topDir);

//  start content for test-file
testFileString = testFileIntro;

// go through all css named colors
// to calculate colors and record file content
for(var colorName in cssColors) {
  // calulate color combination
  // console.log("key:"+exKey+", value:"+csscolors[exKey]);
  var bgColor   = Color(cssColors[colorName]);
  var fontColor = Color("#ffffff");
  // calculate perceptive luminosity if set color
  var lumi = perceptiveLuminance(bgColor.red(), bgColor.green(), bgColor.blue()); // 1 = black
  // calculate how extreme the luminosity is (50% least extreme; 0% and 100% most extreme)
  var distFromMidLumi = (0.5 - lumi)*2; // 0-1 close to mid - far away from mid
  if(lumi > 0.5) distFromMidLumi = (lumi - 0.5)*2;
  // console.log(distFromMidLumi);
  // adapt font color by cheching if it needs to be darker or lighter as bg, and set accordingly
  var isLight = lumi < 0.5;
  if(isLight) fontColor = bgColor.lightness(0+distFromMidLumi*20);
  else fontColor = bgColor.lightness(100-distFromMidLumi*20);

  // create test file color item
  testFileString += testFileThemeStart;                 //
  testFileString += bgColor.rgb().string();           // Background Color
  testFileString += testFileThemeMid;                   //
  testFileString += fontColor.rgb().string();           // Text Color
  testFileString += testFileThemeMid2;                  //
  testFileString += colorName;                          // Name of color
  /* DEBUG
  testFileString += " l: " + Math.round(lumi*100); // lumi (debug)
  testFileString += " WCAG: " + fontColor.level(Color(bgColor)); // Color contrast level (debug)
  testFileString += ", "+Math.round(fontColor.contrast(Color(bgColor))); // Color contrast (debug)
  */
  testFileString += testFileThemeEnd;                   //

  // create theme
  // create theme directory
  if (!fs.existsSync(topDir + colorName)) fs.mkdirSync(topDir + colorName);
  // create content
  themeFileString = themeFileIntro;
  themeFileString += firstToUpperCase(colorName);
  themeFileString += themeFileMid1;
  themeFileString += firstToUpperCase(colorName);
  themeFileString += themeFileMid2;
  themeFileString += bgColor.red() + ", " + bgColor.green() + ", " + bgColor.blue();
  themeFileString += themeFileMid3;
  themeFileString += fontColor.red() + ", " + fontColor.green() + ", " + fontColor.blue();
  themeFileString += themeFileEnd;
  // write theme file
  fs.writeFileSync(topDir + colorName + "/" + themeFileName, themeFileString);
  // show progress
  process.stdout.write(".");
}
// finish test file content
testFileString += testFileEnd;
// finish progress tracker
process.stdout.write("\n");

// write test file
fs.writeFileSync(topDir + testFileName, testFileString);

// finish
console.log('Done!');
process.exit(0);  //exist the application


/* TODO: Asyncronus write is not working on my machine. No idea why...
writeFile('foo.txt', 'This is content...', function(err) {
  if (err) console.log(err);
});
// this one isn't working either...
fs.writeFile('message.txt', 'Hello Node.js', (err) => {
  if (err) throw err;
  console.log('The file has been saved!');
});
*/
