const fs = require ('fs');
const gm = require('gm');
const sharp = require('sharp');

const imgbgdir = 'C:/Users/ASUS/Desktop/MKTPLACE/bgRemoved'
const overlaysDir = 'C:/Users/ASUS/Desktop/MKTPLACE/overlays';

function createImage(){
  const ly1 = sharp({
    create: {
      width: 2190,
      height: 3000,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 1 }
    }
  });
  const ly2 = fs.readFileSync(path.join(overlaysDir,'ly2.png'));//'C:/Users/ASUS/Desktop/MKTPLACE/overlays/ly2.png');
  const ly3 = fs.readFileSync(path.join(overlaysDir,'ly3.png'));//'C:/Users/ASUS/Desktop/MKTPLACE/overlays/ly3.png');
  const ly4 = fs.readFileSync(path.join(overlaysDir,'app.jpeg'));//'C:/Users/ASUS/Desktop/MKTPLACE/wtspImages/app.jpeg');
  const ly5 = fs.readFileSync(path.join(overlaysDir,'waAji.png'));//'C:/Users/ASUS/Desktop/MKTPLACE/wtspImages/waAji.jpeg');

  //Erase black, white pixels from downloaded image
  gm(ly5)
  .fuzz(0.2 * 100 + '%')
  .resize(800,800)
  .transparent('black')
  .transparent('white')
    .write(path.join(imgbgdir,'output1.png'), (err) => {//'C:/Users/ASUS/Desktop/MKTPLACE/bgRemoved/output1.png', (err) => {
      if (err) {
          console.error(err);
        } else {
          console.log('Background removed and saved as output1.png');
          const noBg = fs.readFileSync('C:/Users/ASUS/Desktop/MKTPLACE/bgRemoved/output1.png');
          ly1.composite([{ input: ly2 },
            { input: ly3 },
            { input: noBg },
          ]);
          ly1.toFile('C:/Users/ASUS/Desktop/MKTPLACE/wtspImages/output.png', (err, info) => {
            if (err) {
              console.log(err);
            } else {
              console.log(info);
              
            }
          });
        }
      }
    );
    
  }

