(function(window, document, undefined) {
    "use strict";
    
    if (window.gameLoader) {
        console.log('window.gameLoader already exists!');
        return;
    }
    
    window.gameLoader = (function(window, document, undefined) {
        var
            timestamp = Date.now(),
            xhr = new XMLHttpRequest(),
            settings = {
                "gamesRoot": 'games/',
                "divId": 'game_container', /** @TODO template változóból! */
                "styleLinkId": 'game_css',
                "customStyleLinkId": 'game_custom_css',
                "gameScriptId": 'game_js',
            },
            container = document.createElement('div'),
            styleLink = document.createElement('link'),
            customStyleLink = document.createElement('link'),
            gameScript = document.createElement('script'),
            storageJs = document.createElement('script'),
            domJs = document.createElement('script'),
            head,body,gameId;

        function getLinkHref(id) {
            return settings.gamesRoot + id + '/css/' + id + '.css' + getTimestamp();
        };

        function getScriptSrc(id) {
            return settings.gamesRoot + id + '/js/' + id + '.js' + getTimestamp();
        };

        function getUrl(id) {
            return settings.gamesRoot + id + '/' + id + '.html';
        };

        function getTimestamp() {
            return '?_=' + timestamp;
        };

        function elementExists(elem) {
            return !!document.getElementById(elem.id);
        };
        
        function onReadyStateChange(xhr, url, callback) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                callback(xhr);
            } else if (xhr.status !== 200) {
                console.log('Ajax error!');
                console.log('url:' + url);
                console.log('readyState: ' + xhr.readyState);
                console.log('status: ' + xhr.status);
                console.log('response: ' + xhr.responseText);
            }
        };
        
        function onloadCallback() {
            head = document.head;
            body = document.body;
            head.appendChild(styleLink);
            body.appendChild(storageJs);
            body.appendChild(domJs);
            if (!gameId) {
                console.log('No game id loaded yet...');
                return;
            }
            loadContent(gameId);
        };
        
        function loadContent(id) {
            var url;
            url = getUrl(id);
            xhr.open("GET", url, true);
            xhr.onreadystatechange = function () {
                onReadyStateChange(this, url, loadContentCallback);
            };
            xhr.send();
        }

        function loadContentCallback(xhr) {
            var htmlData = xhr.responseText;
            if (0 < htmlData.length) {
                elementExists(customStyleLink) && head.removeChild(customStyleLink);
                elementExists(gameScript) && body.removeChild(gameScript);

                elementExists(container) && body.removeChild(container);

                container.style.display = 'none';
                container.innerHTML = htmlData;
                
                customStyleLink.href = getLinkHref(gameId);
                gameScript.src = getScriptSrc(gameId);
                
                head.appendChild(customStyleLink);
                body.appendChild(container);
                body.appendChild(gameScript);
            } else {
                /** @TODO ehelyett majd .htaccess + redirect !!! */
                //app.innerHTML += "Az oldal nem található!";
            }
        };

        container.id = settings.divId;

        styleLink.id = settings.styleLinkId;
        styleLink.rel = "stylesheet";
        styleLink.href = settings.gamesRoot + 'games.css' + getTimestamp();

        customStyleLink.id = settings.customStyleLinkId;
        customStyleLink.rel = "stylesheet";

        gameScript.id = settings.gameScriptId;

        storageJs.src = settings.gamesRoot + 'storage.js' + getTimestamp();
        domJs.src = settings.gamesRoot + 'dom.js' + getTimestamp();
    
        /** @TODO inkább onload? vagy readystatechange() readyState = 'complete' ? */
        document.addEventListener('DOMContentLoaded', onloadCallback, false);
//        window.onload = function() {
//            console.log('asd');
//            if (document.readyState === 'complete') {
//                onloadCallback();
//            }
//        };
        
        window.onbeforeunload = function () {
            return "Are you sure do you want to leave?";
        };

        return {
            load: function(id) {
                gameId = id;
                if ('complete' === document.readyState) {
                    loadContent(id);
                }
            },
            unload: function() {
                window.game && window.game.exit() && (window.game = undefined);
                head.remove('#'+settings.cssId);
                body.remove('#'+settings.jsId);
                if (body === container.parentNode) {
                    body.removeChild(container);
                    while (container.hasChildNodes()) {
                        container.removeChild(container.lastChild);
                    }
                }
            },
            getContainer: function() {
                return container;
            },
            getGameId: function() {
                return gameId;
            },
        };
    }(window, document));

}(window, document));