import '../node_modules/prismjs/prism.js';
import '../node_modules/prismjs/plugins/line-numbers/prism-line-numbers.js';

(() => {
    const id = 'demo-style';
    addStyle();

    function addStyle() {
        if (!document.head.querySelector('#' + id)) {
            var style = getStyle();
            document.head.appendChild(style);
        }
    }

    function getStyle() {
        var link = document.createElement('link');
        link.setAttribute('id', id);
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', 'demo.css');
        return link;
    }
})();