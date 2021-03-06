
function importJquery() {
	//https://www.quora.com/How-can-I-import-JQuery-into-my-js-file
	var s = document.createElement("script");
	s.src = "https://code.jquery.com/jquery-3.4.1.min.js";
	s.onload = function(e){ /* now that its loaded, do something */ }; 
	document.head.appendChild(s); 
}

function loadCards(parsedExport) {
	var cards = parsedExport['cards']
	return cards
}

function loadChecklists(parsedExport) {
	var checklists = parsedExport['checklists']

	var mapOfChecklists = checklists.reduce(function(map, obj) {
    	map.set(obj.id, obj);
    	return map;
	}, new Map());
	return mapOfChecklists
}

function loadLists(parsedExport) {
	var lists = parsedExport['lists']

	var mapOfLists = lists.reduce(function(map, obj) {
    	map.set(obj.id, obj);
    	return map;
	}, new Map());
	return mapOfLists
}

function findCardsByName(name, parsedExport) {
	var cards = loadCards(parsedExport)
	var filteredCards = $.grep(cards, function(obj){return obj.name === name;});
	return filteredCards
}

function formatDescription(markdown) {
	var converter = new showdown.Converter()
	return converter.makeHtml(markdown);
}

function convertToCardObjects(cards, checklists, lists) {
	if (!Array.isArray(cards)) {
		cards = new Array(cards)
	}
	// console.log("Received cards: ", cards)
	cards = cards.map(c => {
		// console.log("Converting card: ", c)
		var cardObject = new Object();
		cardObject.title = c['name']
		cardObject.description = formatDescription(c['desc'])
		cardObject.labels = c['labels'].map(c => c.name)
		cardObject.listId = c['idList']

		var checklistIds = c['idChecklists']
		if (checklistIds != null && checklistIds != undefined) {
			cardObject.checklists = checklistIds.map(clId => {
				var cl = checklists.get(clId);
				console.log("Found checklist: ", cl)
				return { "title": cl.name, "items": cl.checkItems }
			})
			console.log("Having " + cardObject.checklists.length + " checklists")
			cardObject.checklists.forEach(cl => { 
				console.log("Processing checklist: " + cl.title)
				cl.items = cl.items.map(clItem => { 
					console.log("Processing checklist item: " + clItem.name); 
					return {"value": clItem.name, "checked": clItem.state === "complete"} 
				})
			})
		}
		
		cardObject.due = c['due']
		cardObject.justTitle = (cardObject.checklists.length == 0) && 
		(cardObject.description == null || cardObject.description == undefined || cardObject.description === "")

		cardObject.lastActivity = c['dateLastActivity']

		//TODO store archived boolean flag to card
		// cardObject.activityHistory = historyObjects
		// cardObject.comments = commentObjects
		// console.log("Converted card: ", cardObject)
		return cardObject
	})

	var listIdSet = new Set()
	cards.forEach(c => listIdSet.add(c.listId))
	console.log("Found list ids: ", listIdSet)
	console.log("Found distinct list ids: " + listIdSet.size)

	var cardResultMap = cards.reduce(function(map, obj) {
		// console.log("***processing obj: ", obj)
		// console.log("***processing obj: ", obj.listId)
		//TODO what happens if two (or more) lists are having the same name
		// if (!map.has(obj.listId)) {
		// 	map.set(obj.listId, [])
		// }
  //   	map.get(obj.listId).push(obj);

  		var listName = lists.get(obj.listId)['name']
  		if (!map.has(listName)) {
			map.set(listName, [])
		}
    	map.get(listName).push(obj);
    	return map;
	}, new Map());

	console.log("Found distinct list ids for final card result map: ", cardResultMap.size)

	if (cardResultMap.size != listIdSet.size) {
		throw "Number of found lists for all cards does not match number of lists in final result map! This is most likely due to duplicate list names"
	}

	return cardResultMap
}

function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k,v] of strMap) {
    // We don’t escape the key '__proto__'
    // which can cause problems on older engines
    obj[k] = v;
  }
  return obj;
}


//FINAL FUNCTIONS
function getCardFromExport(name, parsedExport) {
	//Run these commands to fetch a particular card
	var checklists = loadChecklists(parsedExport)
	var lists = loadLists(parsedExport)
	var cards = findCardsByName(name, parsedExport)
	// var cards = findCardsByName('testcard')
	//TODO return all cards if found more than 1

	if (cards.length == 0) {
		throw "No card found with name: " + name
	}
	console.log("Card from export: ", cards[0])
	var cardObj = convertToCardObjects(cards[0], checklists, lists)
	// cardObj
	// cardObj[0].checklists[0].items
	return cardObj
}

function convertAllCardsToJson(parsedExport) {
	//Run these commands to convert all cards to json
	var checklists = loadChecklists(parsedExport)
	var lists = loadLists(parsedExport)
	var cards = loadCards(parsedExport)
	var cardObjs = convertToCardObjects(cards, checklists, lists)
	return JSON.stringify(strMapToObj(cardObjs))	
}

function parseConvertedCardsJsonAndExportHtml(jsonObj, listName) {
	//Run these to read back cards from converted json
	if (jsonObj == undefined) {
		throw "JSON object can't be parsed from site! Please load an exported json of a trello board!"
	}
	//TODO group by last modified data -- lastActivity: "2019-11-02T18:20:42.970Z


	var html = ""
	Object.keys(jsonObj).forEach(function(k){
	    // console.log(k + ' - ' + jsonObj[k]);
	    //THIS IS FROM THE OTHER FILE
	    // var cards = getAllDataOfCardsInList(k);
	    var cards = jsonObj[k]
	 //    cards.sort(function(a,b){
	 //    	// console.log("SORT a: ", a)
	 //    	// console.log("SORT b: ", b)
	 //    	return new Date(b.lastActivity) - new Date(a.lastActivity);
		// });
		// cards.forEach(c => console.log(c.lastActivity))
	    // console.log("cards: ", cards)
	    if (cards != undefined) {
	    	if (listName != undefined && k === listName) {
	    		html = html.concat("<h1>" + k + "(" + cards.length + ")" + "</h1><br><br>")
		    	html = html.concat(formatCardsAsHtml(cards))
	    	} else {
		    	html = html.concat("<h1>" + k + "(" + cards.length + ")" + "</h1><br><br>")
		    	html = html.concat(formatCardsAsHtml(cards))	
	    	}
	    }
	});
	return html
}

function download(filename, text, type="html") {
	var dataType;
	var simpleType;
	if (type === "html") {
		dataType = "data:text/html;charset=utf-8,"
		simpleType = "text/html"
	} else if (type === "json") {
		dataType = "data:text/json;charset=utf-8,"
		simpleType = "application/json"
	} else {
		throw "Unknown data type: " + type
	}

	var element = document.createElement('a');

	//Workaround for Chrome's encodeURIComponent limit (for bigger data)
	//See: https://www.reddit.com/r/webdev/comments/7bu0la/google_chrome_download_failed_network_error_when/dpktbap/
	var data = new Blob([text], { type: simpleType });
    var objUrl = URL.createObjectURL(data);
	// element.setAttribute('href', dataType + encodeURIComponent(text));	
    element.setAttribute('href', objUrl);

	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}


function clickExportButton() {
	$("span:contains('Show Menu')").trigger('click')
	$('.js-open-more').trigger('click')
	$('.js-share').trigger('click')
	// $('.js-export-json').trigger('click')
	var boardExportLink = $('.js-export-json').attr('href')
	// location.href = boardExportLink
	return boardExportLink
}

function exportBoard() {
	(async () => {
		var url = clickExportButton()
		let response = await fetch(url);
		let trelloJson = await response.json();
		console.log("Received json: ", trelloJson)
		var convertedJson = convertAllCardsToJson(trelloJson)
		var convertedJsonObj = JSON.parse(convertedJson)

		var html = parseConvertedCardsJsonAndExportHtml(convertedJsonObj)
		var htmlFileName = "trello-export-" + document.title.split('|')[0] + "_" + _formatDate() + ".html"
		download(htmlFileName, html);

		var jsonFileName = "trello-export-" + document.title.split('|')[0] + "_" + _formatDate() + "-converted.json"
		download(jsonFileName, convertedJson);

		var trelloJsonFileName = "trello-export-" + document.title.split('|')[0] + "_" + _formatDate() + "-trello.json"
		download(trelloJsonFileName, JSON.stringify(trelloJson), type='json');

		//close side menu
		$('.board-menu-header-close-button').click()
		}
	)()
}

function getCardData(name) {
	if (name === undefined || name == "") {
		throw "Name should not be undefined or empty!"
	}
	(async () => {
		var url = clickExportButton()
		let response = await fetch(url);
		let trelloJson = await response.json();
		console.log("Received json: ", trelloJson)
		// var convertedJson = convertAllCardsToJson(trelloJson)
		// var convertedJsonObj = JSON.parse(convertedJson)
		var card = getCardFromExport(name, trelloJson)
		console.log("Found card: ", card)
		
		//close side menu
		$('.board-menu-header-close-button').click()
		}
	)()
}

// $(document).ready(function () {
 //  		alert('Page has finished loading');
	// });
// parseConvertedCardsJsonAndExportHtml(convertedJson, "ARCHIVED")	