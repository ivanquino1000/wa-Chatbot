const { Client , LocalAuth, MessageMedia} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const mime = require('mime-types');
const fs = require('fs');
const gm = require('gm');
const sharp = require('sharp');

//arreglar type mime, implementar imgProc.js, buffers, proteccion contra imagenes en espera de texto 


//Directories
let imageDirectory = 'C:/Users/ASUS/Desktop/MKTPLACE/wtspImages';
const imgbgdir = 'C:/Users/ASUS/Desktop/MKTPLACE/bgRemoved'
const overlaysDir = 'C:/Users/ASUS/Desktop/MKTPLACE/overlays';

const ly1 = sharp({
  create: {
    width: 2190,
    height: 3000,
    channels: 4,
    background: { r: 255, g: 0, b: 0, alpha: 1 }
  }
});
//overlays directory
const ly2 = fs.readFileSync('C:/Users/ASUS/Desktop/MKTPLACE/overlays/ly2.png');
const ly3 = fs.readFileSync('C:/Users/ASUS/Desktop/MKTPLACE/overlays/ly3.png');


let allwUsr= ['51935403277','51958190331','51973182574','51962252080','51918483587'];
const initUser = { 
    "mainstate":0,
    "services":{
      "fbmkt":{
        "state": 0,
        "imgCount": 0,
        "images":['','',''],
        "imgMetadata":[
            "Default Desc", 
            "999.99 x 999.99", 
            "SSS.SS", 
            "199.99", 
            "999.99",
            "9999"]
      }
    }
}

//Whatsapp Base
const client = new Client({
    authStrategy: new LocalAuth({ clientId: "client-one" }),
});


client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});


client.on('message', async message => {
  if(!message.isStatus){
    let users = JSON.parse(fs.readFileSync('users.json'));
    const regex = /\d+/gm;
    let phone = message.from.match(regex);
    let phNm = phone[0];
    console.log(phNm);
    //console.log(message.info)
    if(!allwUsr.includes(phNm)){ //&& message.body === 'start'){
        console.log('not a allowed user ')
        return;
    }
    
    if(!users.hasOwnProperty(phNm)){
      users[phNm] = initUser;
      //users[phNm]["mainstate"] = 1;
      const jsonData = JSON.stringify(users,null,2);
      fs.writeFileSync('users.json',jsonData)
      console.log(`user saved as ${phNm}`)
      users = JSON.parse(fs.readFileSync('users.json'));
      return;
    }
    console.log(message.body, message.body ==='start', users[phNm]["mainstate"] !== 0);
    if(message.body !== 'start'){ //&& users[phNm]["mainstate"] !== 0){
      console.log('service selection', message.body)
      if(users[phNm]["mainstate"] == 1){
        console.log(`user main state:${users[phNm]["mainstate"]}`)
        switch(message.body){
          case 'fbmkt':
          client.sendMessage(message.from, 'INGRESA: Categoria, Descripcion, AltoxAncho , costo, xMayor, Precio, cant por caja')  
          users[phNm]["mainstate"] = 2
          fs.writeFileSync('users.json',JSON.stringify(users,null,2))
          users=JSON.parse(fs.readFileSync('users.json'))
          break;
          case 'catalog':
          client.sendMessage(message.from,'Categorias Disponibles:');
          users[phNm]["mainstate"] = 3;
          fs.writeFileSync('users.json',JSON.stringify(users,null,2))
          users=JSON.parse(fs.readFileSync('users.json'))
          break;
        }
        return;
      }
      switch(users[phNm]["mainstate"]){
          case 2:
            switch(users[phNm]["services"]["fbmkt"]["state"]){
              //send metadata
              case 0:
                console.log(users)
                //client.sendMessage(message.from, 'INGRESA: Categoria, Descripcion, AltoxAncho , costo, xMayor, Precio, cant por caja')  
                const regexes = [/\w+/gm, /\d+\.?\d+?\s?x\s?\d+\.?\d+?/gm, /\d+\.?\d+?/gm, /\d+\.?\d+?/gm, /\d+\.?\d+?/gm, /\d+\.?\d+?/gm];
                const metaData = message.body.split(',')
                const fixMetaData = metaData.map((part,i)=>{
                  const regex = new RegExp(regexes[i]);
                  const trimparts = part.trim();
                return regex.test(trimparts) ? trimparts : null;
                }).filter(part=>part !== null);
                if(fixMetaData.length = 6){
                  users[phNm]["services"]['fbmkt']['imgMetadata'] = fixMetaData
                  users[phNm]["services"]['fbmkt']['state'] = 1
                  const jsonData = JSON.stringify(users,null,2);
                  fs.writeFileSync('users.json',jsonData)
                  client.sendMessage(message.from,'datos correctos, envie sus imagenes')
                  }
                console.log(fixMetaData)
                break;
              // send images
              case 1:
                if(message.type !== 'image' && !message.hasMedia){
                  return;
                }
                const mediaData = await message.downloadMedia() // .downloadMedia;
                let filename = ''
                const imgData =  users[phNm]["services"]["fbmkt"]["imgMetadata"]
                const imgcounter = users[phNm]["services"]["fbmkt"]["imgCount"]
                console.log(imgData)
		            if(typeof(imgData[1]) !== 'string'){
                    filename = imgData[0] + '_' + imgcounter + '.' + mediaData.mimetype.split('/')[1];
                }else{ 
                    filename = imgData[0] + '_' + imgcounter + '.' + mediaData.mimetype.split('/')[1];//message.id.toString() + '.' + mediaData.mimetype.split('/')[1];
                }
                console.log(filename)
                const filePath = path.join(imageDirectory, filename);
                fs.writeFile(filePath, mediaData.data, {encoding: 'base64'}, (err) => {
                  if (err) {
                    console.error(err)
                    } else {
                    console.log('Image saved as ' + filePath)}
                        users[phNm]["services"]["fbmkt"]["imgCount"]= imgcounter + 1;
                        const jsonData = JSON.stringify(users,null,2);
                        fs.writeFileSync('users.json',jsonData)
                        gm(filePath)
                        .fuzz(0.2 * 100 + '%')
                        .resize(800,800)
                        .transparent('black')
                        .transparent('white')
                        .write('C:/Users/ASUS/Desktop/MKTPLACE/bgRemoved/output1.png', (err) => {
                            if (err) {
                            console.error(err);
                            } else {
                            console.log('Background removed and saved as output.png');
                            let buffer = MessageMedia.fromFilePath(path.join(imgbgdir, 'output1.png'));
                            client.sendMessage(message.from, buffer); 
                            ly1.composite([
                                { input: ly2 },
                                { input: ly3 },
                                { input: 'C:/Users/ASUS/Desktop/MKTPLACE/bgRemoved/output1.png'},
                              ]);
                              ly1.toFile('C:/Users/ASUS/Desktop/MKTPLACE/wtspImages/output.png', (err, info) => {
                                if (err) {
                                  console.log('error writing',err);
                                } else {
                                  console.log('success: ',info);
                                  let buffer = MessageMedia.fromFilePath(path.join(imageDirectory, 'output.png'));
                                client.sendMessage(message.from, buffer); 
                                }
                                });
                            }		
                            })
                       })
            }
          break;
          case 3:
          client.sendMessage(message.from,'Categorias Disponibles:')
        }
        return;
      }
    console.log('start message')
    for(const prop in initUser){
        if(!users[phNm].hasOwnProperty(prop)){
            users[phNm] = initUser     
        }
        users[phNm][prop]=initUser[prop]
    }
    users[phNm]["mainstate"] = 1;
    const jsonData = JSON.stringify(users,null,2);
    fs.writeFileSync('users.json',jsonData);
    console.log(`json updated to: ${phNm}`);
    users = JSON.parse(fs.readFileSync('users.json'));
    const svc = []
    for(const s in initUser["services"]){
      svc.push(s)
    }
    client.sendMessage(message.from,`Escribe: ${svc}`)
    return;
  }
})
client.initialize();