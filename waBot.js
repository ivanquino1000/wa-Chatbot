const { Client , LocalAuth,MessageMedia, List, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const mime = require('mime-types');
const fs = require('fs');
const gm = require('gm');
const sharp = require('sharp');

//Directories

const imageDirectory = 'C:/Users/ASUS/Desktop/MKTPLACE/wtspImages'
const imgbgdir = 'C:/Users/ASUS/Desktop/MKTPLACE/bgRemoved'
const overlaysDir = 'C:/Users/ASUS/Desktop/MKTPLACE/overlays'

let allowedUsers= ['51935403277','51958190331','51973182574','51962252080']
//create a sharp object for the background 
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


const client = new Client({
    authStrategy: new LocalAuth({ clientId: "client-one" }),
});


client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

let status = 0;
let imgcounter = 0;
let fixMetaData = new Map()

const productsList = new List(
    "Amazing deal on these products",
    "View products",
    [
        {
            title: "Products list",
            rows: [
                { id: "apple", title: "Apple" },
                { id: "mango", title: "Mango" },
                { id: "banana", title: "Banana" },
            ],
        },
    ],
    "Please select a product"
);

client.on('message', async message => {
    
    const regex = /\d+/gm;
    const phNum = message.from.match(regex)
    //console.log(message.info)

    if(message.isStatus == false){
        console.log(phNum)
        console.log(allowedUsers.includes(phNum[0]))
        console.log(message.body === 'start')
        console.log(status)
        console.log(message.hasMedia && message.type==='image' && message.isStatus == 'false')
    }
    if(allowedUsers.includes(phNum[0]) && message.body === 'start' && status == 0 && message.isStatus == false){
        console.log('servicio iniciado:', message.from , status)
        
        let button = new Buttons('Select a Service',[{body:'fbmkt'},{body:'bt2'},{body:'bt3'}],'title','footer');
        client.sendMessage(message.from, button);
        //client.sendMessage( message.from, productsList)
        status = 1

    }else if ( status == 1 ){
                
        switch(message.body){
            case 'fbmkt':
            client.sendMessage(message.from, 'Escribe Descripcion-AltoxAncho-costo-xMayor-Precio, cant por caja')
            status = 2;
            break;
            case 'addItemCt':
            status = 10;
            break;
            case 'searchCt':
            status = 20;
            break;
        }

    }else if(status == 2){
        const regexes = [/\w+/gm, /\d+\.?\d+?\s?x\s?\d+\.?\d+?/gm, /\d+\.?\d+?/gm, /\d+\.?\d+?/gm, /\d+\.?\d+?/gm, /\d+\.?\d+?/gm];
		metaData = message.body.split(',')
		fixMetaData = metaData.map((part,i)=>{
			const regex = new RegExp(regexes[i]);
			const trimparts = part.trim();
		return regex.test(trimparts) ? trimparts : null;

		}).filter(part=>part !== null)
        console.log(fixMetaData)
		client.sendMessage(message.from,fixMetaData[0])
		if(fixMetaData.length = 6){
			client.sendMessage(message.from,'datos correctos, envie sus imagenes')
            status = 3
        }

    }else if(status == 3 && message.hasMedia && message.type==='image' && message.isStatus == false){
        
		const mediaData = await message.downloadMedia() // .downloadMedia;
        let filename = ''
        console.log(fixMetaData)
		if(typeof(fixMetaData[0]) !== 'string'){
             filename = fixMetaData[0] + '_' + imgcounter + '.' + mediaData.mimetype.split('/')[1];
        }else{ 
             filename = fixMetaData[0] + '_' + imgcounter + '.' + mediaData.mimetype.split('/')[1];//message.id.toString() + '.' + mediaData.mimetype.split('/')[1];
        }
		
		const filePath = path.join(imageDirectory, filename);
		fs.writeFile(filePath, mediaData.data, {encoding: 'base64'}, (err) => {
			if (err) {
			  console.error(err)
				} else {
			  console.log('Image saved as ' + filePath)}
              imgcounter = imgcounter + 1 
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
                    { input: 'C:/Users/ASUS/Desktop/MKTPLACE/bgRemoved/output1.png' },
                    //{ input: fixMetaData[0], gravity: 'southeast', left: 100, top: 100 }
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
            
    }})
client.initialize();
 
