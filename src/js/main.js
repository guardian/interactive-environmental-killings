import shares from './share'

let shareFn = shares('//write-title', '//write-project-url', '');

[].slice.apply(document.querySelectorAll('.interactive-share')).forEach(shareEl => {
    var network = shareEl.getAttribute('data-network');
    shareEl.addEventListener('click', () => shareFn(network));
});

var el = document.createElement('script');
el.src = '<%= path %>/app.js';
document.body.appendChild(el);

var bgImages = ['figure1.png', 'figure2.png', 'figure3.png', 'figure4.png', 'figure5.png'];
var headerEl = document.querySelector("#headerCol");
var windowWidth = document.body.clientWidth;
var headWrapperHeight = document.querySelector(".header-text-wrapper").offsetHeight;
console.log(windowWidth);
console.log(headWrapperHeight);
// headerEl.style.background = 'url(<%= path %>/assets/img/figures/' + bgImages[Math.floor(Math.random() * bgImages.length)] + ') no-repeat left 200px bottom 0 /410px';
if (windowWidth >= 1300) {
  headerEl.style.background = 'url(<%= path %>/assets/img/figures/' + bgImages[Math.floor(Math.random() * bgImages.length)] + ') no-repeat left 230px bottom 0 /410px';
}
// else if (windowWidth>1140){
//   headerEl.style.background = 'url(<%= path %>/assets/img/figures/' + bgImages[Math.floor(Math.random() * bgImages.length)] + ') no-repeat left 150px bottom 0 /410px';
// }
else if (windowWidth >= 740){
  headerEl.style.background = 'url(<%= path %>/assets/img/figures/' + bgImages[Math.floor(Math.random() * bgImages.length)] + ') no-repeat left 0px bottom 0 /320px';
}
else {
headerEl.style.background = 'url(<%= path %>/assets/img/figures/' + bgImages[Math.floor(Math.random() * bgImages.length)] + ') no-repeat left 0 top ' + (headWrapperHeight + 50) + 'px /410px';
headerEl.style.minHeight = (headWrapperHeight + 450) + 'px';
}
