import shares from './share'

let shareFn = shares('//write-title', '//write-project-url', '');

[].slice.apply(document.querySelectorAll('.interactive-share')).forEach(shareEl => {
    var network = shareEl.getAttribute('data-network');
    shareEl.addEventListener('click', () => shareFn(network));
});

var el = document.createElement('script');
el.src = '<%= path %>/app.js';
document.body.appendChild(el);

var bgImages = [{url: "figure0.png", credit: "Photograph: Tim Russo/AP", caption: "Berta Cáceres, a Honduran human rights and environment activist who was fighting to stop the construction of a hydroelectric dam on the Gualcarque River, was killed in March 2016", position1300:"230", position1140:"150", size:"450", sizeSmall:"320", verticalSize:"320", imgHeight:"300"},
{url: "figure1.png", credit: "Photograph: Reuters", caption: "Jose Claudio Ribeiro da Silva and his wife Maria, defenders of the Amazon rainforest who constantly reported illegal loggers and ranchers, were killed in an ambush in May 2011", position1300:"0", position1140:"0",size:"600", sizeSmall:"320", verticalSize:"320", imgHeight:"230"},
{url: "figure2.png", credit: "Photograph: Karapatan", caption: "Renato Anglao, an indigenous rights defender, was gunned down in February 2017", position1300:"230",position1140:"150", size: "430", sizeSmall:"320", verticalSize:"320", imgHeight:"300"},
{url: "figure3.png", credit: "Photograph: Tim Russo/AP", caption: "Berta Cáceres, a Honduran human rights and environment activist who was fighting to stop the construction of a hydroelectric dam on the Gualcarque River, was killed in March 2016", position1300:"130", position1140:"50", size:"390", sizeSmall:"260", verticalSize:"320", imgHeight:"380"}];
var headerEl = document.querySelector("#headerCol");
var imgURL = [];
var captions = [];
var credits = [];
var positions1300 = [];
var positions1140 = [];
var sizes = [];
var sizesSmall =[];
var verticalSizes = [];
var imgHeights = [];

bgImages.forEach(function(photo, i) {
  imgURL.push(photo.url);
  captions.push(photo.caption);
  credits.push(photo.credit);
  positions1300.push(photo.position1300);
  positions1140.push(photo.position1140);
  sizes.push(photo.size);
  sizesSmall.push(photo.sizeSmall);
  verticalSizes.push(photo.verticalSize);
  imgHeights.push(photo.imgHeight);
});

var windowWidth = document.body.clientWidth;
var headWrapperHeight = document.querySelector(".header-text-wrapper").offsetHeight;
// console.log(windowWidth);
// console.log(headWrapperHeight);
headerEl.style.background = 'url(<%= path %>/assets/img/figures/' + imgURL[Math.floor(Math.random() * bgImages.length)] + ') no-repeat';
var loadedURL = headerEl.style.backgroundImage;
var urlString = loadedURL.substring(loadedURL.length-6,loadedURL.length-7);
// console.log(urlString);
var captionContainerContent = document.querySelector("#captionContainer");
captionContainerContent.innerHTML = "" + captions[urlString] + '. ' + credits[urlString] + "";
console.log(captionContainerContent);
// headerEl.style.background = 'url(<%= path %>/assets/img/figures/' + bgImages[Math.floor(Math.random() * bgImages.length)] + ') no-repeat left 200px bottom 0 /410px';
if (windowWidth >= 1300) {
  headerEl.style.backgroundPosition = 'left ' + positions1300[urlString] + 'px bottom 0';
  headerEl.style.backgroundSize = sizes[urlString] +'px';
}
else if (windowWidth>=1140){
  headerEl.style.backgroundPosition = 'left ' + positions1140[urlString] + 'px bottom 0';
  headerEl.style.backgroundSize = sizes[urlString] +'px';
}
else if (windowWidth >= 740){
  headerEl.style.backgroundPosition = 'left 0 bottom 0';
  headerEl.style.backgroundSize = sizesSmall[urlString] + 'px';
}
else {
headerEl.style.backgroundPosition = 'left 10px top ' + (parseInt(headWrapperHeight) + 50) + 'px';
headerEl.style.backgroundSize = verticalSizes[urlString] + 'px';
var minHeight = parseInt(headWrapperHeight) + parseInt(imgHeights[urlString]);
headerEl.style.minHeight = minHeight + 'px';
}
