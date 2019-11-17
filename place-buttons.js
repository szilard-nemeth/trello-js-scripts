function isFunction(functionToCheck) {
	return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

function createButton(title, funcToCall, icon) {
    var divider = $('<span class="board-header-btn-divider"></span>')

    if (title === undefined || title == "") {
    	throw "Title should be defined!"
    }

    if (funcToCall === undefined || funcToCall == "" || !isFunction(funcToCall)) {
    	throw "funcToCall should be a valid function!"
    }

    var href = `javascript:${funcToCall.name}();`
    var anchorClass = "board-header-btn board-header-btn-without-icon board-header-btn-text"
    var anchor = $(`<a class="${anchorClass}" href="${href}" title="${title}">${title}</a>`.trim())
    console.log("anchor:", anchor)
    divider.appendTo($('.board-header'));
    anchor.appendTo($('.board-header'));
}

createButton("Export board", exportBoard)