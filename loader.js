function loadScript(src) {
	var tag = document.createElement("script");
	tag.src = src;
	document.getElementsByTagName("head")[0].appendChild(tag);
}

console.log("Loaded loader....")
var tag = document.createElement("script");
tag.src = "function loadScript(src) {var tag = document.createElement('script');tag.src = src;document.getElementsByTagName('head')[0].appendChild(tag);}";
document.getElementsByTagName("head")[0].appendChild(tag);

//LOAD SCRIPTS
loadScript("http://localhost:8080/export-parser.js")
loadScript("http://localhost:8080/print-stats.js")
loadScript("http://localhost:8080/unarchive.js")
loadScript("http://localhost:8080/place-buttons.js")
