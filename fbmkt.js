
function serviceLogic(client, message, user, users){
	const mainState = user['mainstate']
	switch(mainState){
		case 2:
			fbmkt(client, message, user, users);
			break;
		case 3:
			fbmkt(client, message, user, users);
			break;
		default:
			break;
	}

}

function fbmkt(client, message, user, users){
	const mainState = user['mainstate']
	const phNm = message.from.match(/\d+/)[0]
	const fbmkt = user['services']['fbmkt']
	const fbState = fbmkt['state']
	switch(fbState){
		case 0:
			const regexes = [/\w+/gm,
			/\w+/gm, 
			/\d+\.?\d+?\s?x\s?\d+\.?\d+?/gm, 
			/\d+\.?\d*/gm, 
			/\d+\.?\d*/gm,  
			/\d+\.?\d*/gm, 
			/\d+\.?\d*/gm] 
			console.log('init split')
			const metaData = imgText.split(',')
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
			client.sendMessage(message.from,`datos correctos, envie sus imagenes${fixMetaData}` )
			break;
		case 1:
			
			break;
			
		case 2:
			
			break;
		default:
			break;
	}

}

function selectService(client, message, user, users){
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