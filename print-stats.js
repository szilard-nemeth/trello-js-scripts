//Source: https://www.viralpatel.net/jquery-get-text-element-without-child-element/
jQuery.fn.justtext = function() {
  
	return $(this).clone() //clone the element
			.children() //select all the children
			.remove() //remove all the children
			.end() //again go back to selected element
			.text(); //get the text of element

};

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

function getCardTitles(list) {
	return _getCardTitlesByCards(getCardsOfList(list));
}

function getCardTitle(JQCard) {
	return _getCardTitlesByCards(JQCard.find('.list-card-title'));
}

//--main functions

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
	var jqListCards = jqList.siblings('.list-cards').find('.list-card')
	var numberOfCards = jqListCards.length;
	//console.log("Number of cards found: " + numberOfCards)

	var resultMap = new Map([ ["has_description", []], ["has_checklist", []], ["has_due_date", []], ["just_title", []], ["num_of_cards", 0] ]);

	jqListCards.each(function(index) {
		card = $(this);
		// console.log("card: " + card)
		// console.log("has icon: " + card.has(".icon-description").length);
		// console.log("has desc: " + card.has(".icon-checklist").length);
		// console.log("has due: " + card.has(".js-due-date-badge").length);

		var hasDesc = card.has(".icon-description").length;
		var hasChecklist = card.has(".icon-checklist").length;
		var hasDue = card.has(".js-due-date-badge").length;
		
		resultMap.set("num_of_cards", jqListCards.length)

		if (hasDesc) {
			resultMap.get("has_description").push(getCardTitle(card));
		}
		if (hasChecklist) {
			resultMap.get("has_checklist").push(getCardTitle(card));
		}
		if (hasDue) {
			resultMap.get("has_due_date").push(getCardTitle(card));
		}

		if (!hasDesc && ! hasChecklist) {
			resultMap.get("just_title").push(getCardTitle(card));
		}
	});

	return resultMap;
}

function getFilteredCardsOfList(list, filter) {
	var resultMap = getCardsOfList(list);
	console.log("getFilteredCardsOfList.resultMap: ", resultMap)

	if (filter != null) {
		if (filter === "has_description" || 
			filter === "has_checklist" || 
			filter === "has_due_date" || 
			filter === "just_title" || 
			filter == "num_of_cards") {
			resultMap.forEach(function(value, key) { 
				console.log("Cards in list " + key + ': \n' +  value.get(filter).join(", \n")); });
			return resultMap.get(filter);
		} else {
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
		// console.log("CARDSMAP: ", cardsMap)
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
	  			if (Array.from(listStats.values()).every(x =>  x == 0)) {
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