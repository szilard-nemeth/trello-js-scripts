//Source: https://www.viralpatel.net/jquery-get-text-element-without-child-element/


//TMP commands

//////Get all data of specific cards
// var card = getFilteredCardsOfList("DONE", "title=Balint: 4500 egerpadra")[0]
// getAllCardData(card)

/////Find card overlay
// var cardOverlay = $(".window")
// cardOverlay.find('.mod-comment-type').length

/////Get all cards from list "DONE" and format them
// getAllDataOfCardsInList('DONE');var arr = JSON.parse(localStorage.getItem('globalresult'));formatCardsAsHtml();
// formatCardsAsHtml()

//Add property to cards: 
////GLOBALRESULT.forEach(c => c.justTitle = (c.checklists.length == 0) && (c.description == null || c.description == undefined))
var GLOBALRESULT = []

jQuery.fn.justtext = function() {
  
	return $(this).clone() //clone the element
			.children() //select all the children
			.remove() //remove all the children
			.end() //again go back to selected element
			.text(); //get the text of element

};

function _formatDate() {
	var d = new Date();

	return d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " " +
	d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
}

//--helper functions
function getListsJQ() {
	return $('.js-list-content');
}

function getLists() {
	return $('.js-list-content .list-header-name-assist').map(function(){ return $(this).text(); }).get();	
}

function _getCardTitlesByCards(cards) {
	return cards.map(function(){ return $(this).justtext(); }).get();
}

function _getJQCardsByTitle(resultMap, list, title, includeListInResult = false) {
	if (title == undefined) {
		throw "Title should be specified!"
	}

	var allJQCards = resultMap
	if (list != undefined) {
		console.log("Filtering cards by list: ", list)
		var allJQCards = resultMap.get(list).get("cards")
	} else {
		if (!includeListInResult) {
			console.log("Overriding includeListInResult, as multiple lists are found!")	
			includeListInResult = true;
		}
	}

	//returns: either
	//1. Map of <list name>, <list of cards matching title>, if includeListInResult = true
	//2. Array of <list of cards matching title>, if includeListInResult = false
	var res;
	if (includeListInResult) {
		res = new Map()
	} else {
		res = []
	}
	
	for (var [cardTitle, JQCards] of allJQCards) {
		// console.log("cardtitle: ", cardTitle)
		// console.log("card objects: ", JQCards)

		if (cardTitle === title) {
			if (JQCards.length > 1) {
				console.warn("More than 1 card found for title: ", title)
			}
			if (includeListInResult) {
				if (!res.has(list)) {
					res.set(list, [])
				}
				res.get(list).push(JQCards)	
			} else {
				res = res.concat(JQCards)
			}
		}
	}
	if (res.size == 0) {
		console.warn("No items found!")
	}
	return res;
}

function getCardTitles(list) {
	return _getCardTitlesByCards(getCardsOfList(list));
}

function getCardTitle(JQCard) {
	var titles = _getCardTitlesByCards(JQCard.find('.list-card-title').not('.js-composer'));
	if (titles.length > 1) {
		throw "Should have one card title for one card but had " + titles.length + "!"
	}
	return titles[0]
}

//--main functions

//TODO Add function: Delete cards in list!!

function formatCardsAsHtml() {
	function dynamicSort(property) {
	    var sortOrder = 1;
	    if(property[0] === "-") {
	        sortOrder = -1;
	        property = property.substr(1);
	    }
	    return function (a,b) {
	        /* next line works with strings and numbers, 
	         * and you may want to customize it to your needs
	         */
	        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
	        return result * sortOrder;
	    }
	}

	var html = ""
	//TODO order global result by: 
	//just title first
	//due date
	//title
	//

	var sortedCards = GLOBALRESULT.sort(dynamicSort("-justTitle"));
	sortedCards.forEach(card => html = html.concat(formatCardAsHtml(card).concat("<br><br>")))
	console.log(html)
}

function formatCardAsHtml(card) {
	var indent = "&nbsp;&nbsp;&nbsp;&nbsp;"

	function formatPlainTextDescription(desc) {
		//TODO add indent to beginning, add indent after last <br> as well
		if (desc == null || desc == undefined) {
			return null
		}
		console.log("Original description: ", desc)
		desc = indent + desc.replace(/<br\s*\/?>/gi, "<br>" + indent)
		console.log("Modified description: ", desc)
		return desc
	}

	function formatComment(commentObj) {
		return indent.repeat(2) + commentObj.author + ": " + commentObj.comment + " (" + commentObj.date + ")"
	}

	function formatActivity(act) {
		return indent.repeat(2) + act.author + ": " + act.activity + " (" + act.date + ")"
	}

	function formatChecklist(checklist) {
		return `<p class="checklist">${checklist.items.map(ci => 
			`${indent.repeat(3)}${ci.checked ? '[x]' : '[]'}${ci.value}<br>`).join('')}<br>`
	}

	function formatChecklists(checklists) {
		return `<p class="checklists">${card.checklists.map(cl => `<b>${indent.repeat(2)}${cl.title}</b>${formatChecklist(cl)}`).join('')}`
	}

	//TODO setup filters
	// var includeLabels = true
	// var includeDueDate = true
	// var includeCheckLists = true
	// var includeActivity = true
	// var includeComments	 = true

	var includeLabels = false
	var includeDueDate = false
	var includeCheckLists = true
	var includeActivity = false
	var includeComments	 = false

	const markup = `
	 <style>
		 .outer {
			width: 200px;
			margin: 0 auto;
			background-color: yellow;
		}

		.inner {
			margin-left: 50px;
		}
	 </style>
	 <div class="card">
	    <b>
	    ${card.title}
	    </b>
	    ${card.description != undefined && card.description != null ? `<div class='inner'>${card.description}</div>` : '<br>'}
	    
	    ${includeLabels ? `${indent}<b>Labels: </b><p class="labels">${indent.repeat(2)}${card.labels}` : ''}
	    ${includeLabels ? `</p>` : ''}
	    ${includeDueDate ? `${indent}<b>Due date: </b><p class="dueDate">${indent.repeat(2)}${card.dueDate}` : ''}
	    ${includeDueDate ? `</p>` : ''}

		${includeComments ? `${indent}<b>Comments: </b><p class="comments">` : ''}
		${includeComments ? `${card.comments.map(comment => `${formatComment(comment)}<br>`).join('')}` : ''}
	    ${includeComments ? `</p>` : ''}

	    ${includeActivity ? `${indent}<b>Activity history: </b><p class="activity">` : ''}
		${includeActivity ? `${card.activityHistory.map(act => `${formatActivity(act)}<br>`).join('')}` : ''}
	    ${includeActivity ? `</p>` : ''}

	    ${includeCheckLists && card.checklists.length > 0 ? `${indent}<b>Checklists: </b><br>${formatChecklists(card.checklists)}` : ''}
	 </div>
	`;
	//TODO not enough to check card.checklists.length above: If all checklist has 0 items, we can also omit the Checklists: part
	//TODO Only print "Checklists:" if there are more than 1 checklist

	return markup
}

function getAllDataOfCardsInList(listName) {
	function getAllData(card, globalIdx) {
		// console.log("that ", that)
		console.log("card ", card)
		console.log("idx ", globalIdx)
		setTimeout(function() { 
        	console.log("Saving all data from card: " + getCardTitle(card))
        	getAllCardData(card, globalIdx, numberOfCards)
        }, 3000 * globalIdx);
	}

	var resultMap = getCardsOfList(listName);

	//Could be in this format
	//Entries:
	// 0: {"t1" => Array(card1, card2)}
	// 1: {"t2" => Array(card1, card2, card3)}

	var cardsByName = resultMap.get(listName).get("cards")
	console.log("***resultMap: ", resultMap.get(listName))
	
	var cards = []
	cardsByName.forEach((value, key) => Array.prototype.push.apply(cards, value))
	var numberOfCards = cards.length

	if (resultMap.get(listName).get("num_of_cards") != numberOfCards) {
		throw "ResultMap contains " + resultMap.get(listName).get("num_of_cards") + 
		" cards, but final array has a different size: " + numberOfCards
	}

	//TODO store number of items and pass to getAllCardData
	var globalIdx = 0
	for (var cardName of cardsByName.keys()) {
		//TODOs
		// if (globalIdx == 5) {
		// 	return;
		// }
		var cards = cardsByName.get(cardName)
		cards.forEach(function(card, idx) {
			getAllData(card, globalIdx)
	    	globalIdx++
		})
	}
}

function getAllCardData(JQCard, globalIdx, numberOfCards) {
	//Saves the following data for a card:
	// - Labels
	// - Description
	// - Checklists
	// - Due date
	// - History
	// - Comments

	var someCardIsVisible = $(".window-wrapper").is(':visible')
	var title
	var windowTitle
	var closeCardButton
	
	if (someCardIsVisible) {
		title = getCardTitle(JQCard)
		windowTitle = $(".window-title h2").text()
		closeCardButton = $(".dialog-close-button")
	}

	//We have a different card open, close it, then open the desired card
	if (someCardIsVisible && title != windowTitle) {
		closeCardButton.trigger("click")
		JQCard.trigger("click")
	}

	//Only open card if it's not visible yet
	if (!someCardIsVisible) {
		JQCard.trigger("click")
	}

	//re-init variables
	title = getCardTitle(JQCard)
	windowTitle = $(".window-title h2").text()
	closeCardButton = $(".dialog-close-button")

	//Prerequisite: Open all menus
	var showCheckedItemsButton = $(".js-show-checked-items")
	// console.log("showCheckedItemsButton.text()", showCheckedItemsButton.text())
	if (showCheckedItemsButton.text().includes("Show checked items")) {
		showCheckedItemsButton.trigger("click")
	}

	var showDetailsButton = $(".js-show-details")
	// console.log("showDetailsButton.text()", showDetailsButton.text())
	if (showDetailsButton.text().includes("Show Details")) {
		showDetailsButton.trigger("click")
	}

	var cardOverlay = $(".window")

	//TODO is there any cleaner solution than wrapping a huge block of code into setTimeout?
	// console.log("BEFORE PROMISE")
	let promise = new Promise((resolve, reject) => {
		window.setTimeout(function() {
			//re-init close button: If card was not open, it's too early to catch the button before card is loaded
			closeCardButton = $(".dialog-close-button")
		
			//TODO this must have been equivalent, but did not work
			//var labels = JQCard.find(".card-label span").map(e => $(e.text()).get()
			var labels = cardOverlay.find(".card-label span").map(function(){ return $(this).text(); }).get();
			var description = cardOverlay.find(".js-desc").html()
			
			//Save checklists
			var checklistObjects = []
			var checklists = cardOverlay.find(".checklist")
			console.log("Found " + checklists.length + " checklists for card: " + title)
			checklists.each((i, cl) => {
				var checklistObject = new Object()
				checklistObject.title = $(cl).find('.checklist-title h3').map(function(){ return $(this).text(); }).get()[0]
				checklistObject.items = []
				
				var checklistItems = $(cl).find(".checklist-item")
				console.log("Found " + checklistItems.length + " checklist items for checklist: " + checklistObject.title + " for card: " + title)

				checklistItems.each(
					(i, clItem) => checklistObject.items.push(
						{ "value": $(clItem).find(".checklist-item-details-text").text(),
						  "checked": $(clItem).hasClass("checklist-item-state-complete")
						}) 
				) 
				
				checklistObjects.push(checklistObject)
			})


			cardOverlay.find('.checklist-title h3').map(function(){ return $(this).text(); }).get();
			

			//Save Due date
			var dueDate = $(".card-detail-due-date-badge")
			if (dueDate.length > 0) {
				dueDate = dueDate.find(".card-detail-due-date-text").text()
			} else {
				dueDate = null
			}

			//Save activity history
			var historyObjects = []
			var historyItems = cardOverlay.find('.mod-attachment-type')
			historyItems.each((i, h) => {
				historyObjects.push({
					"author": $(h).find('.inline-member').text(),
					"date": $($(h).find('.phenom-meta.quiet a')).attr("title"),
					"activity": $(h).find('.phenom-desc').justtext(),
				})
			})

			//$(cardOverlay.find('.mod-attachment-type')[0]).find(".inline-member").text()
			//$(cardOverlay.find('.mod-attachment-type')[0]).find(".phenom-meta.quiet a").text()

			//Save comments
			var commentObjects = []
			var comments = cardOverlay.find('.mod-comment-type')
			comments.each((i, c) => {
				commentObjects.push({
					"author": $(c).find('.inline-member').text(),
					"date": $($(c).find('.phenom-date a')).attr("title"),
					"comment": $(c).find('.comment-container .current-comment p').text(),
				})
			})

			// $(cardOverlay.find('.mod-comment-type')[0]).find('.inline-member').text()
			// $($(cardOverlay.find('.mod-comment-type')[0]).find('.phenom-date a')).attr("title")
			// $(cardOverlay.find('.mod-comment-type')[0]).find('.comment-container .current-comment p').text()


			var cardObject = new Object();
			cardObject.title = title
			cardObject.labels = labels
			cardObject.dueDate = dueDate
			cardObject.description = description
			cardObject.checklists = checklistObjects
			cardObject.activityHistory = historyObjects
			cardObject.comments = commentObjects
			cardObject.justTitle = (checklistObjects.length == 0) && (description == null || description == undefined)

			closeCardButton.trigger("click")

			resolve(cardObject);
		}, 2000);
    });
    // console.log("after PROMISE")

    promise.then(function(cardObj) {
    	console.log("RESULT OF PROMISE: ", cardObj)
    	//TODO calculate total time took to download all cards
    	console.log("Finished downloading card data: " + _formatDate())
    	GLOBALRESULT.push(cardObj)
    	console.log("***Global idx: ", globalIdx)
		console.log("***Number of cards: ", numberOfCards)
    	if (globalIdx % 20 == 0) {
    		//TODO save all data to localstorage: https://stackoverflow.com/questions/28918232/how-do-i-persist-a-es6-map-in-localstorage-or-elsewhere
    		console.log("Saving another chunk of items (20) to localStorage. Index: " + globalIdx)
    		console.log("DATA: ", JSON.stringify(GLOBALRESULT))
    		window.localStorage.setItem('globalresult', JSON.stringify(GLOBALRESULT));
    	}
    	
		// console.log("RESULT OF PROMISE: ", getCardTitle(JQCard))
		return JQCard
    }).catch((reason) => {
    	console.log('Handle rejected promise ('+reason+') here.');
	});

    // console.log("RETURN")
}

function getCardsOfList(list) {
	//example: $(".js-list-content h2:contains('QUEUE 2')")
	var jqList = $(".js-list h2:contains('" + list + "')").parent();

	//console.log("JQ list length: " + jqList.length)
	if (jqList.length > 1) {
		console.warn("Found " + jqList.length + " lists with name " + list)

		var resultMap = new Map();
		var listPostfix = 1;
		jqList.each(function(i, l) {
			var key = list;
			if (i > 0) {
				key = list + listPostfix + "(dupe)"
			}
			resultMap.set(key, getCardsOfListInternal($(l)));
			listPostfix++;
		});
	} else {
		resultMap = new Map([ [list, getCardsOfListInternal(jqList)] ]);
	}

	// console.log("Returning resultmap: ", resultMap)
	return resultMap;
}

function getCardsOfListInternal(jqList) {
	var jqListCards = jqList.siblings('.list-cards').find('.list-card').not('.js-composer')
	var numberOfCards = jqListCards.length;
	//console.log("Number of cards found: " + numberOfCards)

	var resultMap = new Map([ 
		["has_description", []], //card titles that have description
		["has_checklist", []], //card titles that have checklist
		["has_due_date", []], //card titles that have due date
		["just_title", []], //card titles that just have a title
		["num_of_cards", 0], //number of cards
		["cards", new Map()] ]); //JQ cards by title, can have multiple cards for one title

	jqListCards.each(function(index) {
		card = $(this);
		var cardTitle = getCardTitle(card);
		if (cardTitle === undefined) {
			throw "Card title should not be undefined!"
		}
		// console.log("card: " + card)
		// console.log("has icon: " + card.has(".icon-description").length);
		// console.log("has desc: " + card.has(".icon-checklist").length);
		// console.log("has due: " + card.has(".js-due-date-badge").length);

		var hasDesc = card.has(".icon-description").length;
		var hasChecklist = card.has(".icon-checklist").length;
		var hasDue = card.has(".js-due-date-badge").length;
		
		resultMap.set("num_of_cards", jqListCards.length)

		if (!resultMap.get("cards").has(cardTitle)) {
			// console.log("cardtitle: ", cardTitle)
			resultMap.get("cards").set(cardTitle, []);
		}
		resultMap.get("cards").get(cardTitle).push(card);

		if (hasDesc) {
			resultMap.get("has_description").push(cardTitle);
		}
		if (hasChecklist) {
			resultMap.get("has_checklist").push(cardTitle);
		}
		if (hasDue) {
			resultMap.get("has_due_date").push(cardTitle);
		}

		if (!hasDesc && ! hasChecklist) {
			resultMap.get("just_title").push(cardTitle);
		}
	});

	// console.log("getCardsOfListInternal.RESULT: ", resultMap)	
	return resultMap;
}

function getFilteredCardsOfList(list, filter) {
	var resultMap = getCardsOfList(list);
	// console.log("getFilteredCardsOfList.resultMap: ", resultMap)

	if (filter != null) {
		if (filter === "has_description" || 
			filter === "has_checklist" || 
			filter === "has_due_date" || 
			filter === "just_title" || 
			filter == "num_of_cards") {
			resultMap.forEach(function(value, key) { 
				console.log("Cards in list " + key + ': \n' +  value.get(filter).join(", \n")); });
			return resultMap.get(filter);
		} else if (/title=.*/.test(filter)) {
			var res = filter.match(/title=(.*)/i)
			// console.log("Regex result: ", res)
			var filterTitle = res[1]

			//TODO add functionality: filter by multiple titles, e.g.' 'title=title1,title2'
			//TODO naive approach, there can be multiple lists here

			var filteredCards = _getJQCardsByTitle(resultMap, list, filterTitle)
			// console.log("Filtered cards by title: ", filteredCards)
			return filteredCards;
		} else {
			console.warn("Filter not matched!")
			//TODO throw exception
		}
	} else {
		console.log("Printint all stats as filter was not specified: ", resultMap)
	}

	return resultMap;
}

function printStats() {
	var lists = getLists();
	if (lists == undefined) {
		alert("Lists is undefined!");
		return;
	}

	if (lists.length == 0) {
		alert("Lists is empty!");
		return;
	}

	summary = "SUMMARY OF THIS BOARD: \n" + "====================\n";

	//TODO optimize as there are 2 loops here in this function
	var allCards = lists
		.map(l => getCardsOfList(l))
		.map(l => Array.from(l.values()))
		.reduce(function(acc, obj) {
			// console.log("***", obj[0])
			// console.log("***acc: ", acc)
			// console.log("***obj[0].get(\"num_of_cards\"): ", obj[0].get("num_of_cards"))
			return acc + obj[0].get("num_of_cards");
		}, 0);
	summary = summary.concat("Total number of cards on this board: " + allCards + "\n\n")

	listsWithZeroCards = []
	lists.forEach(function(l) {
		var cardsMap = getCardsOfList(l);
		console.log("CARDSMAP: ", cardsMap)
		if (cardsMap == undefined || cardsMap.values() == undefined) {
			console.error("Cards are undefined for list " + l + "! This is most likely a programming error!")
			console.log("Dumping data...")
			console.log("Cards: ", cardsMap)

			if (cardsMap != undefined) {
				console.log("Cards.values(): ", cardsMap.values())
			}
		} else {
			for (var [listName, listStats] of cardsMap.entries()) {
				// console.log("LIST STATS: ", listStats)
	  			if (listStats.get("num_of_cards") == 0) {
					listsWithZeroCards.push(listName);
				} else {
					summary = summary.concat(getStatsString(cardsMap) + "\n\n");	
				}	
			}
		}
	
	});
	summary = summary.concat("Lists with 0 cards: " + listsWithZeroCards.sort().join(", \n"))
	console.log(summary)
	alert("Summary of this board: \n" + summary);
}

function printStatsOfList(list) {
	var cards = getCardsOfList(list);
	alert(getStatsOfList(cards));
}

function getStatsString(cardsMap) {
	s = "";
	if (cardsMap.size > 1) {
		for (var list of cardsMap.keys()) {
			s = s.concat(getStatsStringForSingleList(list, cardsMap.get(list)))
		}
	} else {
		var listName = cardsMap.keys().next().value
		s = s.concat(getStatsStringForSingleList(listName, cardsMap.get(listName)))
	}
	return s;
}

function getStatsStringForSingleList(list, listStats) {
	// console.log("LIST: ", list)
	// console.log("LIST STATS: ", listStats)

	// var sum = Array.from(listStats.values()).map(x => x.length).reduce(function (acc, val) {
 //  		return acc + val;
	// }, 0);

	return "Stats of list '" + list + ": ' \n" + 
	"Cards with description: " + listStats.get("has_description").length + "\n" + 
	"Cards with checklist: " + listStats.get("has_checklist").length + "\n" + 
	"Cards with due date: " + listStats.get("has_due_date").length + "\n" + 
	"Cards with just title: " + listStats.get("just_title").length + "\n" + 
	"All cards for this list: " + listStats.get("num_of_cards");
}
