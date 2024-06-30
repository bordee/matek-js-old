(function(window, document, undefined) {
    "use strict";

    window.domUtils = (function(document, undefined) {
        
        function isVisible(elem) {
            return "none" !== window.getComputedStyle(elem, null).getPropertyValue('display');
        }
        
        return {
            toggle: function(elem) {
                elem.style.display = isVisible(elem)
                    ? "none"
                    : "";
            },
            show: function(elem) {
                isVisible(elem) || (elem.style.display = "");
            },
            hide: function(elem) {
                isVisible(elem) && (elem.style.display = "none");
            }
        };
    }(document));
}(window, document));

