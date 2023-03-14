const { Client , LocalAuth, MessageMedia} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');
const { removeImgBg, imgToEdit, imgToPdf } = require('./test.js');
const { info } = require('console');
const { measureMemory } = require('vm');
const { type } = require('os');

let allwUsr= ['51935403277','51958190331','51973182574','51962252080','51918483587'];
const initUser = JSON.parse(fs.readFileSync('initUser.json'));

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

function selectService(message, key, users){
  const opt = message.body
  switch(opt){
    case 'fbmkt':
      console.log(key+'@c.us')
      client.sendMessage(key+'@c.us', 'INGRESA: Categoria, Descripcion, AltoxAncho , costo, xMayor, Precio, cant por caja')  
      users[key]["mainstate"] = 2
      fs.writeFileSync('users.json',JSON.stringify(users,null,2))
    break;
    case 'catalog':
      client.sendMessage(message.from, 'INGRESA: Categoria o nombre')  
      users[key]["mainstate"] = 3
      fs.writeFileSync('users.json',JSON.stringify(users,null,2))
    break;
    default: 
    console.log('not a current service with: ',opt )
    break;
  }
}

async function fbmkt(message, key, users){//,img, key, users){
  console.log('msg fbmkt received')//,img)
  const fbState = users[key]['services']['fbmkt']['state'];
  const imgCount = users[key]['services']['fbmkt']['imgCount'];
  const type = message.type
  //console.log('message received in fbmkt func', imgText, type, fbState)
  switch(fbState){
    //fb state 0, receive msg: metadata
      case 0:
      const imgText = message.body
      //if send image or other type in metadata state  
      console.log('swith fb state')
      if(type !== 'chat'){
        client.sendMessage('Enviar informacion de imagen en texto, aun no imagenes or gifs')
        return;
      }
      //evaluate the input with regex metadata to an array
      //error integers not allowed for regex expressions
      const regexes = [/\w+/gm,
      /\w+/gm, 
      /\d+\.?\d+?\s?x\s?\d+\.?\d+?/gm, 
      /\d+\.?\d*/gm, 
      /\d+\.?\d*/gm,  
      /\d+\.?\d*/gm, 
      /\d+\.?\d*/gm] 
      //try  message without ,
      console.log('init split')
      const metaData = imgText.split(',')
      console.log('splitted:' , metaData)
      // map with data
      if(metaData.length !== 7){
        console.log('incorrect number of elements: ',metaData.length)
        return;
      }
      const fixMetaData = metaData.map((part,i)=>{
        const regex = new RegExp(regexes[i]);
        const trimparts = part.trim();
        return regex.test(trimparts) ? trimparts.match(regex)[0] : null;
      }).filter(part=>part !== null);
      //check length
      if(fixMetaData.length !== 7){
        console.log('errro in map:' , fixMetaData, fixMetaData.length)
        return;
      }
      users[key]['services']['fbmkt']['imgMetadata'] = fixMetaData
      users[key]['services']['fbmkt']['state']  = 1
      fs.writeFileSync('users.json',JSON.stringify(users,null,2))
      client.sendMessage(message.from,`datos correctos, envie sus imagenes${fixMetaData}` )
      //receive images fbstate 1
      case 1:
      const imgMetadata = users[key]['services']['fbmkt']['imgMetadata'] 
      if(type !== 'image'){
        if (type !=='chat'){
          console.log('message type neither chat or image')
          return;
        }
        // if not end key word error not image or keyword
        if (message.body !=='fin'){
          client.sendMessage(message.from,`ERROR: solo envie imagenes sin texto para ${imgMetadata[1]}`)
          return;
        }
        //process images when end received
        const finalImg = imgToEdit(key, users)
        //const finalPdfPage = imgToPdf(images,imgMetadata)
        client.sendMessage(message.from ,finalImg)
        return;
      }
      // image received for the imgMetadata fbstate 1 
      const media = await message.downloadMedia();
      const Data = media && media.data;
      if (Data) {
        const imgFromMsg = Buffer.from(Data, 'base64');
        // do something with imgFromMsg
        await removeImgBg(imgFromMsg, key+ '_'+ imgCount+ '.' + 'png')//media.mimetype.split('/')[1]);
        users[key]["services"]['fbmkt']['imgCount'] = imgCount + 1
        fs.writeFileSync('users.json',JSON.stringify(users,null,2));
      } else {
        console.log('mediaData:', media.data)
        // handle the case where mediaData is undefined or null
        console.log('err converting to a buffer')
      }
      if(imgCount !== 6){
        console.log('number of images counted: ',imgCount)
      return;
      }
      users[key]["services"]['fbmkt']['state'] = 2 
      fs.writeFileSync('users.json',JSON.stringify(users,null,2));
      //fb state 2, if images greater than 6 return automatically 
      case 2:
        console.log('you have exceeded the images maximum limit so will be auto executed imgCount:', imgCount)
        return;
      //any how fbS: different that expected cases
      default:
        console.log('fbState out of range fbS: ', fbState)
    }

}

//on message ohhhhhhh this is an async function 
client.on('message', async message => {
  if(!message.isStatus){
      // for each message users is updated 
    let users = JSON.parse(fs.readFileSync('users.json'));
    const regex = /\d+/gm;
    const phNm = message.from.match(regex)[0];
    
    console.log('not stattus phNm: ', phNm);

    //if not in allowed nothing
    if(!allwUsr.includes(phNm)){ //&& message.body === 'start'){
        console.log('not a allowed user ')
        return;
    }

    // if not in users.json add with init values
    if(!users.hasOwnProperty(phNm)){
      users[phNm] = initUser;
      const jsonData = JSON.stringify(users,null,2);
      fs.writeFileSync('users.json',jsonData)
      console.log(`user saved as ${phNm}`)
      //users = JSON.parse(fs.readFileSync('users.json'));
      return;
    }
    
    const user = users[phNm];
    const mainState = user['mainstate'];
    console.log(`already user loaded, MS= `, mainState)
    //if not 'start' // services, ms = 1
    if(message.body !== 'start' && mainState > 0){ 
      console.log(`not start service selection ${phNm} MS: `, mainState)
      // service logic
      switch(mainState){
        //service selector
        case 1:
          if(message.type !== 'chat'){
            console.log('service select not aloud msg.type: ', message.type)
            return;
          }
          selectService(message,phNm,users)
        break;
        //fbmkt
        case 2: 
          const msg = message
          await fbmkt(msg , phNm, users)//, imgBuffer,  phNm, users);
        break;

        //future implementation
        default:
          console.log('invalid MS = ',mainState)
          break;
      }
      return;
      }

    console.log('start message')
    //init the prop and add if not keys order 1
    const svc = []
    for(const prop in initUser){
        if(!users[phNm].hasOwnProperty(prop)){
            users[phNm] = initUser     
        }
        users[phNm][prop]=initUser[prop]
    }
    //MS 1 go to service selection
    users[phNm]["mainstate"] = 1;
    const jsonData = JSON.stringify(users,null,2);
    fs.writeFileSync('users.json',jsonData);
    console.log(`json updated to: ${phNm}`);
    //users = JSON.parse(fs.readFileSync('users.json'));
    //send list of services 
    for(const s in initUser["services"]){
      svc.push(s)
    }
    client.sendMessage(message.from,`Escribe: ${svc}`)
    return;
  }
})
  client.initialize();