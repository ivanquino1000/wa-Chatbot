const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs')
const path = require('path');
const { removeImgBg, imgToEdit, imgToPdf } = require('./test.js');

// Define the directory to save the images
let allwUsr= ['51935403277','51958190331','51973182574','51962252080','51918483587'];
const initUser = JSON.parse(fs.readFileSync('initUser.json'))
const imgEndDir = 'C:/Users/ivan/Desktop/MKTPLACE/finalEdit'

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "client-one" }),
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

//flow => if not created add , send start, sent fbmkt, send fbmkt requirements
/*MS 0 - nothing MS = 1 choose service, Ms>=2 Service Logic */
client.on('message', async message => {
	if(!message.isStatus){
		if (message.type !== 'chat' && message.type !== 'image'){
			console.log("🚀 ~ file: bot.js:32 ~ message.type:", message.type)
			return;
		}
		let users = JSON.parse(fs.readFileSync('users.json'))
		const phNm = message.from.match(/\d+/gm)[0];
		console.log("not Status ~ file: bot.js:29 ~ phNm:", phNm)
		
		if(!allwUsr.includes(phNm)){
			console.log("not allowed User ~ file: bot.js:32 ~ phNm:", phNm)
			return;
		}
		
		if(!users.hasOwnProperty(phNm)){
			users[phNm]=initUser
			fs.writeFileSync('users.json',JSON.stringify(users,null,2))
			console.log("alldUsr Saved as: ~ file: bot.js:37 ~ phNm:", phNm)
			return;
		}
		const user = users[phNm];
		const mainState = user['mainstate']
		console.log("🚀 ~ file: bot.js:46 ~ mainState:", mainState)
		console.log("🚀 ~ file: bot.js:48 ~ message.body.toLocaleLowerCase().trim() :", message.body.toLocaleLowerCase().trim() )
		console.log("🚀 ~ file: bot.js:50 ~ mainState > 0:", mainState > 0)
		console.log("🚀 ~ file: bot.js:50 ~ message.body.toLocaleLowerCase().trim() !== 'start' && mainState > 0:", message.body.toLocaleLowerCase().trim() !== 'start' && mainState > 0)
			
		if(message.body.toLocaleLowerCase().trim() !== 'start'){
			if(mainState == 0){
				console.log(`No start msg: ${message.body}, MS = ${mainState}`)
				return;
			}
			if(mainState !== 1){
				await serviceLogic(client, message, user, users)
				return;
			}
			//MS = 1 
		await selectService(client, message, user, users)

			return;
		}

		//start , MS = 0
		for (const key in initUser){
			//init or update
			if(!user.hasOwnProperty(key)){
				user = initUser
				return;
			}
			user[key] = initUser[key]
		}
		user['mainstate']= 1
		users[phNm]['mainstate'] = 1
		fs.writeFileSync('users.json',JSON.stringify(users,null,2))

		//send service options
		const services = []
		for (const prop in initUser['services']){
			services.push(prop)
		};

		client.sendMessage(message.from, `Escribe Cualquiera: ${services}`)

	return;
	};
	//msg status handle
});

client.initialize();
 


async function serviceLogic(client, message, user, users){
	const mainState = user['mainstate']
	switch(mainState){
		case 2:
			await fbmkt(client, message, user, users);
			break;
		case 3:
			await fbmkt(client, message, user, users);
			break;
		default:
			break;
	}

}

async function fbmkt(client, message, user, users){
	const usersUp = await JSON.parse(fs.readFileSync('users.json'))
	const phNm = message.from.match(/\d+/)[0]
	const fbmkt = user['services']['fbmkt']
	const fbState = fbmkt['state']
	const imgCount = usersUp[phNm]['services']['fbmkt']['imgCount'] 
	console.log("🚀 ~ file: bot.js:117 ~ fbmkt ~ fbState:", fbState)
	switch(fbState){
		case 0:
			if(message.type !== 'chat'){
				console.log("fbState 0 metaData not allowd type ~ file: bot.js:120 ~ fbmkt ~ message.type :", message.type )
				return;
			}

			const regexes = [/\w+/gm,
			/\w+/gm, 
			/\d+\.?\d+?\s?x\s?\d+\.?\d+?/gm, 
			/\d+\.?\d*/gm, 
			/\d+\.?\d*/gm,  
			/\d+\.?\d*/gm, 
			/\d+\.?\d*/gm] 
			console.log('init split')
			const metaData = message.body.split(',')
			console.log('splitted:' , metaData)
			// map with data
			if(metaData.length !== 7){
			  console.log('incorrect number of elements: ',metaData.length)
			  client.sendMessage(message.from, 'Error: reenvia imagen info')
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
			users[phNm]['services']['fbmkt']['imgMetadata'] = fixMetaData
			users[phNm]['services']['fbmkt']['state']  = 1
			fs.writeFileSync('users.json',JSON.stringify(users,null,2))
			client.sendMessage(message.from,`datos correctos, envie sus imagenes para : ${fixMetaData[1]} de ${fixMetaData[6]}` )
			break;

		case 1:
		console.log("case1 start ~ file: bot.js:158 ~ fbmkt ~ imgCount:", imgCount)
		const imgMetadata = users[phNm]['services']['fbmkt']['imgMetadata'] 
		
		if(message.type !== 'image'){
		  if (message.type !=='chat'){
			console.log('message type neither chat or image')
			return;
		  }
		  // if not end key word error not image or keyword
		  if (message.body.toLocaleLowerCase().trim() !=='fin'){
			client.sendMessage(message.from,`ERROR: solo envie imagenes sin texto para ${imgMetadata[1]}`)
			return;
		  }
		  //process images when end received
		  const finalImgs = await imgToEdit(phNm, users)
		  
		  //client.sendMessage(message.from ,hope)

		  for(let i = 0; i < finalImgs.length;i++){
			const res = MessageMedia.fromFilePath(path.join(imgEndDir,phNm + '_' + (i*2+1) + '.png'))
			console.log("🚀 ~ file: bot.js:181 ~ fbmkt ~ i*2+1:", (i*2+1))
			
			client.sendMessage(message.from ,res)
		  }
		  //const finalPdfPage = imgToPdf(images,imgMetadata)
		  return;
		}
		// image received for the imgMetadata fbstate 1 
		let media;
		let success = false;
		let retries = 0;

		while (!success && retries < 5) {
		try {
			media = await message.downloadMedia();
			success = true;
		} catch (error) {
			console.error(`Download failed: ${error.message}`);
			retries++;
		}
		}

		if (!success) {
		console.error(`Failed to download media after 5 retries`);
		return;
		} 
		/**/
		//const media = await message.downloadMedia();

		//console.log("🚀 ~ file: bot.js:192 ~ fbmkt ~ media:", media)
		const Data = media && media.data;
		if (Data) {
		  const imgFromMsg = Buffer.from(Data, 'base64');
		  //fs.writeFileSync('users.json',JSON.stringify(users,null,2));
		  await removeImgBg(imgFromMsg, phNm+ '_'+ imgCount+ '.' + 'png')//media.mimetype.split('/')[1]);
		  console.log("🚀 ~ file: bot.js:184 ~ fbmkt ~ imgCount:", imgCount + 1)
		  users[phNm]["services"]['fbmkt']['imgCount'] = imgCount + 1
			fs.writeFileSync('users.json',JSON.stringify(users,null,2));
			client.sendMessage(message.from, `Imagen Numero : ${imgCount} añadida`)
		} else {
		  console.log('mediaData:', media.data)
		  // handle the case where mediaData is undefined or null
		  console.log('err converting to a buffer')
		}
		if(imgCount < 6){
		  console.log('number of images counted: ',imgCount)
		return;
		}
		users[phNm]["services"]['fbmkt']['state'] = 2 
		fs.writeFileSync('users.json',JSON.stringify(users,null,2));
			
		case 2:
			console.log('you have exceeded the images maximum limit so will be auto executed imgCount:', imgCount)
		 	break;
		default:
			console.log('fbState out of range fbS: ', fbState)
			break;
	}

}

async function selectService(client, message, user, users){
	const phNm = message.from.match(/\d+/)[0]
	switch(message.body.toLowerCase().trim()){
		case 'fbmkt':
			console.log("fbmkt:", message.body.toLowerCase().trim())
			client.sendMessage(message.from, 'INGRESA: Categoria, Descripcion, Alto x Ancho , costo, xMayor, Precio, cant por caja')  
			user["mainstate"] = 2
			users[phNm] = user
			fs.writeFileSync('users.json',JSON.stringify(users,null,2))
			break;
		case 'catalog':
			console.log("catalog:", message.body.toLowerCase().trim())

			user["mainstate"] = 3
			users[phNm] = user
			fs.writeFileSync('users.json',JSON.stringify(users,null,2))

			break;
		case 'ubicacion':
			console.log("ubicacion:", message.body.toLowerCase().trim())
			user["mainstate"] = 4
			users[phNm] = user
			fs.writeFileSync('users.json',JSON.stringify(users,null,2))
			break;
		default:
			console.log("ERROR ~ file: bot.js:89 ~ selectService ~ message.body.toLowerCase().trim():", message.body.toLowerCase().trim())
			user["mainstate"] = 0
			users[phNm] = user
			fs.writeFileSync('users.json',JSON.stringify(users,null,2))
			break;
	}

}