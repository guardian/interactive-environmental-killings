import shares from './share'

let shareFn = shares('//write-title', '//write-project-url', '');

[].slice.apply(document.querySelectorAll('.interactive-share')).forEach(shareEl => {
    var network = shareEl.getAttribute('data-network');
    shareEl.addEventListener('click', () => shareFn(network));
});

var el = document.createElement('script');
el.src = '<%= path %>/app.js';
document.body.appendChild(el);
