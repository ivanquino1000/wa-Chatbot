const fs = require ('fs');
const gm = require('gm');
const sharp = require('sharp');
const path = require('path');

const Vibrant = require('node-vibrant')

const imgEndDir = 'C:/Users/ivan/Desktop/MKTPLACE/finalEdit'
const imgbgdir = 'C:/Users/ivan/Desktop/MKTPLACE/bgRemoved'
const overlaysDir = 'C:/Users/ivan/Desktop/MKTPLACE/overlays';
const testImg = 'C:/Users/ivan/Desktop/MKTPLACE/wtspImages';


module.exports ={
  imgToEdit: imgToEdit,
  imgToPdf: imgToPdf,
  removeImgBg: removeImgBg
}

async function mapNumberToLetters(number) {
  const mapping = {
    0: 'L', 
    1: 'Y', 
    2: 'Q', 
    3: 'Y', 
    4: 'M', 
    5: 'P', 
    6: 'O', 
    7: 'R', 
    8: 'T', 
    9: 'S'
  };

  const numberAsString = parseFloat(number).toFixed(2).replace('.', '');
  let letters = '';

  for (let i = 0; i < numberAsString.length; i++) {
    letters += mapping[numberAsString[i]];
  }

  return letters;
}
//hola

async function createImage(colors){
  const color = colors[1];
  const bg = sharp({
    create: {
      width: 2190,
      height: 3000,
      channels: 4,
      background: { r: color[0], g: color[1], b: color[2], alpha: 1 }
    }
  });
  return bg
}

  const ly2 = fs.readFileSync(path.join(overlaysDir,'ly2.png'));//'C:/Users/ivan/Desktop/MKTPLACE/overlays/ly2.png');
  const ly3 = fs.readFileSync(path.join(overlaysDir,'ly3.png'));//'C:/Users/ivan/Desktop/MKTPLACE/overlays/ly3.png');
  //const ly4 = fs.readFileSync(path.join(testImg,'app.jpeg'));//'C:/Users/ivan/Desktop/MKTPLACE/wtspImages/app.jpeg');
  //const ly5 = fs.readFileSync(path.join(testImg,'waAji.jpeg'));//'C:/Users/ivan/Desktop/MKTPLACE/wtspImages/waAji.jpeg');

  //refactor as a function
  async function imgToEdit (phNm, users){
    const imgMetadata = users[phNm]["services"]['fbmkt']['imgMetadata']
    const imgCount = users[phNm]["services"]['fbmkt']['imgCount']
    //read the images name
    let matchColors =[]
    //const images1 = ['51962252080_0.png','51962252080_1.png','51962252080_2.png','51962252080_3.png','51962252080_4.png','51962252080_5.png'];
    let images = []//'51958190331_0.png','51958190331_1.png','51958190331_2.png','51958190331_3.png','51958190331_4.png','51958190331_5.png'];
    for(let e = 0; e < imgCount; e++){
      images[e] = phNm + '_'+ e +'.png'
    }
    const imgNoText = [];
    const fbImages= [];
    if(images.length <= 0){
      return;
    }
    for(let i = 0; i < images.length - 1; i += 2){
      const imgEven= path.join(imgbgdir,images[i]);
      console.log("🚀 ~ file: test.js:49 ~ imgToEdit ~ imgEven:", imgEven)
      const imgOdd= path.join(imgbgdir,images[i+1]);
      console.log("🚀 ~ file: test.js:51 ~ imgToEdit ~ imgOdd:", imgOdd)
      
      await Vibrant.from(imgEven).getPalette()
      .then((palette) => {
        matchColors = Object.values(palette).map((swatch) => swatch.rgb);
      });
      
      console.log("🚀 ~ file: test.js:54 ~ .then ~ matchColors:", matchColors)
      const bg = await createImage(matchColors)
      const imgEnd = await bg.composite([
        {input: ly2, top: 500, left:0 },        
        //{input: ly3, top: 500, left:0 },        
        {input: await sharp(imgEven).resize(1200, 1500).toBuffer(), top: 800, left:800},
        {input: await sharp(imgOdd).resize(800, 700).toBuffer(), top: 1500, left:80}   ,
        {input: ly3, top: 500, left:0 }
      ])
      .toFile(path.join(imgEndDir,images[i]))
      
      imgNoText.push(imgEnd)
        
    }
      console.log("🚀 ~ file: test.js:115 ~ imgToEdit ~ fbImages: buffers" )
      //return fbImages
      //return fbImages;
      if(images.length % 2 !== 0){
        console.log("🚀 ~ file: test.js:78 ~ imgToEdit ~ images.length:", images.length)
        
        const imgEven= path.join(imgbgdir,images[0]);
        console.log("🚀 ~ file: test.js:49 ~ imgToEdit ~ imgEven:", imgEven)
        
        await Vibrant.from(imgEven).getPalette()
        .then((palette) => {
          matchColors = Object.values(palette).map((swatch) => swatch.rgb);
        });
        const bg = await createImage(matchColors)
        const oddImg = await bg.composite([
            {input: ly2, top: 100, left:100 },        
            {input: ly3, top: 100, left:100 },        
            {input: path.join(imgbgdir,images[images.length - 1]), top: 20, left:20 }
          ])
          .toBuffer()
        console.log("🚀 ~ file: test.js:84 ~ imgToEdit ~ oddImg:", oddImg)
        imgNoText.push(oddImg)
      }else{
      console.log("🚀 ~ file: test.js:89 ~ imgToEdit ~ images.length:", images.length)
      const set = [
        { font: 'Arial',width: 500, height: 500,top: 100, left: 80},//Category 0
        { font: 'Arial',width: 500, height: 500,top: 300, left: 80},//desc 1
        { font: 'Arial',width: 1400, height: 150,top: 500, left: 700},//measures 2
        { font: 'Arial',width: 200, height: 200,top: 750, left: 250},//Cost 3
        { font: 'Arial',width: 150, height: 150,top: 1450, left: 700},//XMayor/wholesale 4
        { font: 'Arial',width: 400, height: 250,top: 2400, left: 200},//Price 5
        { font: 'Arial',width: 200, height: 200,top: 2500, left: 1300},//Packaging Qty 6
      ]
      imgMetadata[3] = await mapNumberToLetters(imgMetadata[3])

      console.log("🚀 ~ file: test.js:137 ~ imgToEdit ~ imgMetadata:", imgMetadata)
      imgObj = imgMetadata.map((imgText,index)=>({
        input:{
          text:{
            text:imgText,
            font: 'Arial',
            width: set[index]['width'],
            height: set[index]['height']
            }
          },
          gravity: 'northwest', // align text to top left corner of image
          top: set[index]['top'], // adjust top and left values as needed
          left: set[index]['left']
        }));
        console.log("🚀 ~ file: test.js:150 ~ imgObj=imgMetadata.map ~ imgObj:", imgObj)
        

      for(let k= 0; k < imgNoText.length; k++){
        let hope = sharp(path.join(imgEndDir,phNm+'_'+ (k*2) +'.png'))
        hope.composite(imgObj)
        const outputBuffer = await hope.toBuffer()
        fs.writeFileSync(path.join(imgEndDir, phNm + '_' + (k * 2 + 1) + '.png'), outputBuffer);
        fbImages.push(images[(k*2+1)])
        console.log("🚀 ~ file: test.js:102 ~ imgToEdit ~ imgMeta:", fbImages)
      }
      return fbImages
        //return;
      }
    }

  function imgToPdf (images, imgData){
    console.log('imgToPdf start process')
    return  

  }

  async function removeImgBg(image, filename){
    try{
    console.log('buffer: ',image)
    const imgNoBg = await new Promise((resolve,reject) => {
      gm(image)
      .fuzz(0.2 * 100 + '%')
      .resize(800,800)
      .transparent('black')
      .transparent('white')
      .write(path.join(imgbgdir,filename),(err)=>{
        if (err) {
          reject(err)
          console.error(err);
          } else {
            resolve(image);
          console.log('Background removed and saved as output.png');}
      })
    })
  return imgNoBg
  } catch (error) {
    console.error('Error in removeImgBg:', error);
    throw error;
  }
  }


