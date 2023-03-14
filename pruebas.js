const sharp = require('sharp')
const path = require('path')
const Jimp = require('jimp')
const fs = require('fs')

/*
const imgEndDir = 'C:/Users/ASUS/Desktop/MKTPLACE/finalEdit'
const set = [
  { font: 'Arial',width: 500, height: 500,top: 100, left: 80},//Category 0
  { font: 'Arial',width: 500, height: 500,top: 300, left: 80},//desc 1
  { font: 'Arial',width: 1400, height: 150,top: 500, left: 700},//measures 2
  { font: 'Arial',width: 100, height: 100,top: 750, left: 250},//Cost 3
  { font: 'Arial',width: 100, height: 100,top: 1200, left: 600},//XMayor/wholesale 4
  { font: 'Arial',width: 400, height: 250,top: 2400, left: 200},//Price 5
  { font: 'Arial',width: 250, height: 250,top: 2700, left: 1200},//Packaging Qty 6

]
const imgMetadata = [ 'Ropa', 'zapato', '12x34', 'QPL', '3.8', '5', '90' ]
console.log("🚀 ~ file: test.js:137 ~ imgToEdit ~ imgMetadata:", imgMetadata)
/*imgObj = imgMetadata.map((imgText,index)=>({
  
  input:{
    text:{
      text: imgText,
      font: 'Arial',
      width: set[index]['width'],
      height: set[index]['height']
      }
    },
    gravity: 'northwest', // align text to top left corner of image
    top: set[index]['top'], // adjust top and left values as needed
    left: set[index]['left']
  }));
  console.log("🚀 ~ file: test.js:150 ~ imgObj=imgMetadata.map ~ imgObj:", imgObj)//[0]['input']['text']['text'])
  console.log("🚀 ~ file: pruebas.js:35 ~ imgObj:", typeof(imgObj))
  /*
  let hope = sharp(path.join(imgEndDir,'51935403277_0.png'))
  
  hope.composite([imgObj])
  const outputBuffer =  hope.toBuffer()
  fs.writeFileSync(path.join(imgEndDir, '51935403277_89.png'), outputBuffer);
*/
/*
const gm = require('gm').subClass({ imageMagick: true });

// Set the path to the background image
const backgroundPath = '/overlays';

// Create a new GraphicsMagick object for the background image
const background = gm(backgroundPath);
console.log("🚀 ~ file: pruebas.js:50 ~ background:", background)

// Add text to the background image
background.drawText(50, 50, 'Hello, world!');

// Set the path to the foreground image
const foregroundPath = '/overlays/ly2.png';

// Create a new GraphicsMagick object for the foreground image
const foreground = gm(foregroundPath);

// Composite the foreground image onto the background image
//background.composite(foreground, 0, 0);

// Save the composite image to a file
//background.toBuffer()
background.write('/overlays/ly20.jpg', (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Image saved!');
  }
});
*/

async function main() {
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  const image = await Jimp.read('C:/Users/ASUS/Desktop/MKTPLACE/overlays/ly4.jpg');

  image.print(font, 10, 10, "Hello World!").write('C:/Users/ASUS/Desktop/MKTPLACE/finalEdit/fin.jpg');

}

main();