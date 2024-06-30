(function(window, undefined) {
    "use strict";
    
     if(typeof(window.Storage) === "undefined") {
        alert('Sorry! No Web Storage support..');
        console.log('Sorry! No Web Storage support..');
        return;
    }

    window.storageUtils = (function(window, undefined) {
        var JSON = window.JSON,
            session = window.sessionStorage,
            local = window.localStorage;
        
        function setItem(obj, key, val) {
            obj.setItem(key, JSON.stringify(val));
        }
        
        function getItem(obj, key) {
            return JSON.parse(obj.getItem(key));
        }
        
        return {
            session: {
                set: function(key, val) {
                    setItem(session, key, val);
                },
                get: function(key) {
                    return getItem(session, key);
                },
                remove: function(key) {
                    session.removeItem(key);
                },
                clear: function() {
                    session.clear();
                }
            },
            local: {
                set: function(key, val) {
                    setItem(session, key, val);
                },
                get: function(key) {
                    return getItem(session, key);
                },
                remove: function(key) {
                    local.removeItem(key);
                },
                clear: function() {
                    local.clear();
                }
            }
        };
    }(window));
    
}(window));