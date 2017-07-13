import shares from './share'

let shareFn = shares('The defenders: see all the environmental defenders killed this year', 'https://gu.com/p/6jmx8', '');

[].slice.apply(document.querySelectorAll('.interactive-share')).forEach(shareEl => {
    var network = shareEl.getAttribute('data-network');
    shareEl.addEventListener('click', () => shareFn(network));
});

var el = document.createElement('script');
el.src = '<%= path %>/app.js';
document.body.appendChild(el);

var bgImages = [{url: "figure0.png", credit: "Photograph: Tim Russo/AP", caption: "Berta Cáceres, a Honduran human rights and environment activist who was fighting to stop the construction of a hydroelectric dam on the Gualcarque River, was killed in March 2016", position1300:"230", position1140:"150",position980:"80", size:"450", size980:"400", sizeSmall:"320", verticalSize:"320", imgHeight:"300"},
{url: "figure1.png", credit: "Photograph: Reuters", caption: "Jose Claudio Ribeiro da Silva and his wife Maria, defenders of the Amazon rainforest who constantly reported illegal loggers and ranchers, were killed in an ambush in May 2011", position1300:"0", position1140:"0", position980:"0",size:"600", size980:"500", sizeSmall:"320", verticalSize:"320", imgHeight:"230"},
{url: "figure2.png", credit: "Photograph: Karapatan", caption: "Renato Anglao, an indigenous rights defender, was gunned down in February 2017", position1300:"230", position1140:"150", position980:"80", size: "430", size980:"400", sizeSmall:"320", verticalSize:"320", imgHeight:"300"},
];

var headerEl = document.querySelector("#headerCol");

var windowWidth = document.body.clientWidth;
var headWrapperHeight = document.querySelector(".header-text-wrapper").offsetHeight;

var randomImg = bgImages[Math.floor(Math.random() * bgImages.length)];
headerEl.style.backgroundImage = 'url(<%= path %>/assets/img/figures/' + randomImg.url + ')';
var urlString = ''
var captionContainerContent = document.querySelector("#captionContainer");
captionContainerContent.innerHTML = "" + randomImg['caption'] + '. ' + randomImg['credit'] + "";

if (windowWidth >= 1300) {
  headerEl.style.backgroundPosition = parseInt(randomImg['position1300']) + 'px bottom';
  headerEl.style.backgroundSize = parseInt(randomImg['size']) +'px';
}
else if (windowWidth>=1140){
  headerEl.style.backgroundPosition = parseInt(randomImg['position1140']) + 'px bottom';
  headerEl.style.backgroundSize = parseInt(randomImg['size']) +'px';
}

else if (windowWidth>=980) {
  headerEl.style.backgroundPosition = parseInt(randomImg['position980']) + 'px bottom';
  headerEl.style.backgroundSize = parseInt(randomImg['size980']) +'px';
}
else if (windowWidth >= 740){
  headerEl.style.backgroundPosition = `left bottom`;
  headerEl.style.backgroundSize = parseInt(randomImg['sizeSmall']) + 'px';
}
else {
headerEl.style.backgroundPosition = `10px bottom`;
headerEl.style.backgroundSize = '300px';
var minHeight = parseInt(headWrapperHeight) + parseInt(randomImg['imgHeight']);
headerEl.style.minHeight = minHeight + 'px';
}
