function openArchivedMenu() {
	$("span:contains('Show Menu')").trigger('click')
	$('.js-open-more').trigger('click')
	$('.js-open-archive').trigger('click')	
}

function loadArchivedCards() {
	var i = 0;

	var clickShowMore = function(i) {
	  console.log("clicking More items. Iteration " + i)
	  $('.show-more').trigger("click");
	};

	var recursiveClickShowMore = function() {
	  clickShowMore(i);
	  i += 1;
	  setTimeout(function() {
	    if (i < 100 && $('.show-more').is(':visible')) {
	      recursiveClickShowMore();
	    }
	  }, 1000);
	}

	recursiveClickShowMore();
}

function sendArchivedCardsToBoardInt() {
	$('.archived-list-card').find('a').filter('.js-reopen').each(function(index) {        
	        (function(that, i) { 
	            var t = setTimeout(function() { 
	            	console.log("Clicking item with index: " + i);
	            	console.log("Clicking item: " + that)
	                $(that).click()
	            }, 1000 * i);
	        })(this, index);
	    });
}

function sendArchivedCardsToList(targetList) {
	if (targetList == undefined) {
		throw "List name should not be undefined!"
	}
	$('.archived-list-card').find('.list-card-details').each(function(index) {        
		// if (index == 1) {
	 //        	return false
	 //        	}
	        (function(that, i) { 
	            var t = setTimeout(function() { 
	            	console.log("Clicking item with index: " + i);
	            	console.log("Clicking item: " + that)
	                $(that).click()

	                var someCardIsVisible = $(".window-wrapper").is(':visible')
					if (someCardIsVisible) {
						$(".js-move-card").trigger("click");

						var listOption = $('.js-select-list').find('option:contains("' + targetList + '")')
						if (listOption.length == 0) {
							console.log("Can't find list with name: " + targetList)
						} else {
							$('.js-select-list option').removeAttr('selected');
							listOption.attr("selected", "selected");

							// $('.js-select-list').find('option[value="ARCHIVED"]').attr("selected",true);
							// $('.js-select-list option[value=ARCHIVED]').attr('selected','selected');
							// $('.js-select-list option[value=ARCHIVED]').prop('selected',true);
							// $('.js-select-list ').find('option[value=""]').attr("selected",true);
							// $('.js-select-list').val("5dcfc6b53a8903864560e2cb")
							$('.pop-over-section').find('.js-submit').trigger("click")
							closeCardButton = $(".dialog-close-button")		
						}
						
					}
	            }, 2000 * i);
	        })(this, index);
	    });
}


function sendAllArchivedCardsToBoard() {
	//step 1: open archived cards view
	openArchivedMenu();

	//step 2: load all archived cards
	loadArchivedCards();

	//step 3: trigger clicks on all cards
	sendArchivedCardsToBoardInt();
}

function sendAllArchivedCardsToList(targetList) {
	//step 1: open archived cards view
	openArchivedMenu();

	//step 2: load all archived cards
	loadArchivedCards();

	//step 3: trigger clicks on all cards
	sendArchivedCardsToList(targetList);
}