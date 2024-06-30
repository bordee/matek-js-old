(function(window, document, undefined) {
    "use strict";

    window.cookieUtils = (function(document, undefined) {
        return {
            setCookie: function(cname, cvalue, exdays) {
                var d = new Date(),
                    value = (typeof cvalue === 'object' ? JSON.stringify(cvalue) : cvalue),
                    expires;
                d.setTime(d.getTime() + (exdays*24*60*60*1000));
                expires = "expires="+d.toUTCString();
                console.log(document.cookie);
                console.log(cname + "=" + value + "; " + expires);
                document.cookie = cname + "=" + value + "; " + expires;
                console.log(document.cookie);
            },
            getCookie: function(cname) {
                var name = cname + "=",
                    ca = document.cookie.split(';'),
                    len = ca.length;
                for(var i=0; i<len; i++) {
                    var c = ca[i];
                    while (c.charAt(0)===' ') c = c.substring(1);
                    if (c.indexOf(name) === 0) return JSON.parse(c.substring(name.length, c.length));
                }
                return "";
            },
            // test...
            checkCookie: function() {
                var user = this.getCookie("username");
                if (user !== "") {
                    alert("Welcome again " + user);
                } else {
                    user = prompt("Please enter your name:", "");
                    if (user !== "" && user !== null) {
                        this.setCookie("username", user, 365);
                    }
                }
            },
            /** @TODO: delete cookie!!! */
        };
    }(document));
    
}(window, document));