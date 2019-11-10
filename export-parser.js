
function importJquery() {
	//https://www.quora.com/How-can-I-import-JQuery-into-my-js-file
	var s = document.createElement("script");
	s.src = "https://code.jquery.com/jquery-3.4.1.min.js";
	s.onload = function(e){ /* now that its loaded, do something */ }; 
	document.head.appendChild(s); 
}

function loadCards() {
	var json = $('body pre').html()
	var jsonObj = JSON.parse(json)
	var cards = jsonObj['cards']
	return cards
}

function loadChecklists() {
	var json = $('body pre').html()
	var jsonObj = JSON.parse(json)
	var checklists = jsonObj['checklists']

	var mapOfChecklists = checklists.reduce(function(map, obj) {
    	map.set(obj.id, obj);
    	return map;
	}, new Map());
	return mapOfChecklists
}

function findCardsByName(name) {
	var cards = loadCards()
	var filteredCards = $.grep(cards, function(obj){return obj.name === name;});
	return filteredCards
}

function convertToCardObjects(cards, checklists) {
	if (!Array.isArray(cards)) {
		cards = new Array(cards)
	}
	console.log("Received cards: ", cards)
	return cards.map(c => {
		console.log("Converting card: ", c)
		var cardObject = new Object();
		cardObject.title = c['name']
		cardObject.description = c['desc'] //TODO format as html
		cardObject.labels = c['labels'].map(c => c.name)

		var checklistIds = c['idChecklists']
		if (checklistIds != null && checklistIds != undefined) {
			cardObject.checklists = checklistIds.map(clId => {
				var cl = checklists.get(clId); 
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

		// cardObject.activityHistory = historyObjects
		// cardObject.comments = commentObjects
		return cardObject
	})
}


importJquery()
//Run these commands to fetch a particular card
var checklists = loadChecklists()
var cards = findCardsByName('Drive: kepeket megosztani: Apa/Viola')
// var cards = findCardsByName('testcard')
var cardObj = convertToCardObjects(cards[0], checklists)
cardObj
cardObj[0].checklists[0].items

//Run these commands to convert all cards
var checklists = loadChecklists()
var cards = loadCards()
var cardObjs = convertToCardObjects(cards, checklists)
cardObjs




