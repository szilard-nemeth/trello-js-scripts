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


function sendAllArchivedCardsToBoard() {
	//step 1: open archived cards view
	openArchivedMenu();

	//step 2: load all archived cards
	loadArchivedCards();

	//step 3: trigger clicks on all cards
	sendArchivedCardsToBoardInt();
}