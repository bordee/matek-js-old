(function(window, document, undefined) {
    "use strict";
    var gameId = 'number_neighborhood',
        basePath = "games/" + gameId + "/",
        containerId = 'game_container', /** @TODO template változóból! */
        dom,storage,container;
    
    // @TODO dependency check refactor...
    if (
        !window.storageUtils
        || !window.domUtils
    ) {
        alert('Dependency check failed!');
        return;
    }
    
    container = document.getElementById(containerId);
    if (
        !container
        || !container.hasChildNodes()
    ) {
        console.log('Error: game html is not loaded!');
        return;
    }
    
    dom = window.domUtils;
    storage = window.storageUtils;

    window.game = (function(window, document, container, gameId, basePath, undefined){
        var 
            imageDir = basePath + "image/",
            wrong_image = imageDir + "wrong1.jpg",
            imageFadeTimeout = 1500,
            isMobileChrome = /Android.*Chrome/.test(window.navigator.userAgent),
            regex_pattern = /^\d+$/,
            random = window.Math.random,
            floor = window.Math.floor,
            user_data = {},
            storageKey = gameId,
            a, b, c, operator, x, total,
            solved = 0,
            good = 0,
            bad = 0,
            autoNext = true,
            challenge_wrapper = container.querySelector('#challenge_wrapper'),
            a_div = container.querySelector('#challenge_a'),
            b_div = container.querySelector('#challenge_b'),
            prog_div = container.querySelector('#challenge_progress'),
            prog_label = container.querySelector('#challenge_progress_text'),
            rat_good = container.querySelector('#challenge_ratio_good'),
            rat_good_label = container.querySelector('#challenge_ratio_good_text'),
            count_good_label = container.querySelector('#challenge_count_good_text'),
            rat_bad = container.querySelector('#challenge_ratio_bad'),
            rat_bad_label = container.querySelector('#challenge_ratio_bad_text'),
            count_bad_label = container.querySelector('#challenge_count_bad_text'),
            login_div = container.querySelector('#login'),
            challenge_types_div = container.querySelector('#challenge_types'),
            challenge_subtypes_div = container.querySelector('#challenge_subtypes'),
            challenge_total_div = container.querySelector('#challenge_total'),
            challenge_log = container.querySelector('#challenge_log'),
            challenge_log_answers = container.querySelector('#challenge_log div.answers'),
            o_div = container.querySelector('#challenge_o'),
            e_div = container.querySelector('#challenge_e'),
            x_div = container.querySelector('#challenge_x'),
            result_div = container.querySelector('#result_wrapper'),
            challenge_div = container.querySelector('#challenge'),
            nn_challenge_div = container.querySelector('#nn_challenge'),
            enter_button = container.querySelector('#enter'),
            popup_right =  container.querySelector('#popup_right'),
            popup_right_image = container.querySelector('#popup_right img'),
            popup_wrong = container.querySelector('#popup_wrong'),
            popup_wrong_image = container.querySelector('#popup_wrong img'),
            operators = {
                0: "+",
                1: "-",
                2: "*",
                3: ":",
                4: "<",
                5: "*"
            },
            challenge_types = {
                0: "Összeadás",
                1: "Kivonás",
                2: "Szorzás",
                3: "Osztás",
                4: "Számszomszédok",
                5: "Szorzótábla"
            },
            challenge_subtypes = {
                0: [
                    "Egyes + egyes, 10-ig (pl. 5+2)",
                    "Egyes + egyes, 20-ig (pl. 7+8)",
                    "Tizes + egyes, 20-ig (pl. 12+7)",
                    "Kerek tizes + kerek tizes (pl. 10+30)",
                    "Kerek tizes + egyes (pl. 30+6)",
                    "Tizes + egyes, nincs átlépés (pl. 33+4)",
                    "Tizes + egyes, van átlépés (pl. 33+9)",
                    "Kerek tizes + tizes (pl. 30+33)",
                    "Tizes + tizes, nincs átlépés (pl. 32+33)",
                    "Tizes + tizes, van átlépés (pl. 35+37)",
                    "Vegyes, 20-ig",
                    "Vegyes, 20 felett"
                ],
                1: [
                    "Egyes - egyes (pl. 5-3)",
                    "Tíz - egyes (pl. 10-3)",
                    "Tizes - egyes, 20-ig, nincs átlépés (pl. 15-4)",
                    "Tizes - egyes, 20-ig, van átlépés (pl. 12-8)",
                    "Tizes - tizes, 20-ig (pl. 15-12)",
                    "Kerek tizes - kerek tizes (pl. 40-20)",
                    "Kerek tizes - egyes (pl. 40-6)",
                    "Tizes - egyes, nincs átlépés (pl. 48-6)",
                    "Tizes - egyes, van átlépés (pl. 42-6)",
                    "Kerek tizes - tizes (pl. 40-12)",
                    "Tizes - tizes, nincs átlépés (pl. 43-12)",
                    "Tizes - tizes, van átlépés (pl. 42-17)",
                    "Vegyes, 20-ig",
                    "Vegyes, 20 felett"
                ],
                2: [
                    "0-tól 5-ig (pl. 3x[1-10])",
                    "6-tól 10-ig (pl. 7x[1-10])",
                    "10-től 20-ig (pl. 12x[1-10])",
                    "20-tól 99-ig (pl. 34x[1-10])",
                    "Kerek tizesek (pl. 20x[1-10])",
                    "Kerek százasok (pl. 200x[1-10])",
                    "Vegyes, 0-tól 10-ig",
                    "Vegyes, 10 felett",
                ],
                3: [
                    "Osztók 1-tól 10-ig (osztandók: 0-100, eredmény: 0-10)",
                    "Osztók 1-tól 10-ig (osztandók: 0-100, eredmény: 10 < )",
                    "100-tól 990-ig, 10-el oszhatóak (osztók: 1-10)",
                    "1000-től 9900-ig, 100-al oszthatóak (osztók: 1-10)",
                    "100-tól 990-ig, 10-el oszhatóak (osztók: 10, 20,...)",
                    "1000-től 9900-ig, 100-al oszthatóak (osztók: 10, 20,...)",
                    "Vegyes, osztók 1-tól 10-ig (osztandók: 0-99)",
                    "Vegyes (százasok, ezresek)",
                ],
                4: [
                    "1-től 100-ig, 1-es szomszédok",
                    "1-től 100-ig, 10-es szomszédok",
                    "100-tól 1000-ig, 1-es szomszédok",
                    "100-tól 1000-ig, 10-es szomszédok",
                    "100-tól 1000-ig, 100-as szomszédok"
                ],
                5: {
                    2: "2-es",
                    3: "3-as",
                    4: "4-es",
                    5: "5-ös",
                    6: "6-os",
                    7: "7-es",
                    8: "8-as",
                    9: "9-es",
                    10: "10-es",
                }
            },
            generators = {
                0: [
                    function() { // "Egyes + egyes, 10-ig (pl. 5+2)"
                        a = floor(random() * 9) + 1;
                        b = floor(random() * (10 - a)) + 1;
                    },
                    function() { // "Egyes + egyes, 20-ig (pl. 7+8)"
                        a = floor(random() * 9) + 1;
                        b = floor(random() * 9) + 1;
                    },
                    function() { // "Tizes + egyes, 20-ig (pl. 12+7)"
                        a = floor(random() * 11) + 10;
                        b = floor(random() * (20 - a)) + 1;
                    },
                    function() { // "Kerek tizes + kerek tizes (pl. 10+30)"
                        a = (floor(random() * 9) + 1) * 10;
                        b = (floor(random() * 9) + 1) * 10;
                    },
                    function() { // "Kerek tizes + egyes (pl. 30+6)"
                        a = (floor(random() * 9) + 1) * 10;
                        b = floor(random() * 9) + 1;
                    },
                    function() { // "Tizes + egyes, nincs átlépés (pl. 33+4)"
                        a = floor(random() * 10);
                        b = floor(random() * (9 - a)) + 1;
                        a += (floor(random() * 9) + 1) * 10;
                    },
                    function() { // "Tizes + egyes, van átlépés (pl. 33+9)"
                        a = floor(random() * 9) + 1;
                        b = floor(random() * (a - 1)) + (10 - a);
                        a += (floor(random() * 9) + 1) * 10;
                    },
                    function() { // "Kerek tizes + tizes (pl. 30+33)"
                        a = (floor(random() * 9) + 1) * 10;
                        b = (floor(random() * 9) + 1);
                        b += (floor(random() * 9) + 1) * 10;
                    },
                    function() { // "Tizes + tizes, nincs átlépés (pl. 32+33)"
                        var a2;
                        a = floor(random() * 8) + 1;
                        b = floor(random() * (9 - a)) + 1;
                        a2 = floor(random() * 8) + 1;
                        a += a2 * 10;
                        b += (floor(random() * (9 - a2)) + 1) * 10;
                    },
                    function() { // "Tizes + tizes, van átlépés (pl. 35+37)"
                        var a2;
                        a = floor(random() * 9) + 1;
                        b = floor(random() * (a - 1)) + (10 - a);
                        a2 = (floor(random() * 9) + 1);
                        a += a2 * 10;
                        b += (floor(random() * (10 - a2)) + 1) * 10;
                    },
                    /** @TODO vegyes !!! */
                ],
                1: [
                    function() { // Egyes - egyes (pl. 5-3)
                        a = floor(random() * 9) + 1;
                        b = floor(random() * a) + 1;
                    },
                    function() { // Tíz - egyes (pl. 10-3)
                        a = 10;
                        b = floor(random() * 9) + 1;
                    },
                    function() { // Tizes - egyes, 20-ig, nincs átlépés (pl. 15-4)
                        a = floor(random() * 9) + 1;
                        b = floor(random() * a) + 1;
                        a += 10;
                    },
                    function() { // Tizes - egyes, 20-ig, van átlépés (pl. 12-8)
                        a = floor(random() * 8) + 1;
                        b = floor(random() * (9 - a)) + a + 1;
                        a += 10;
                    },
                    function() { // Tizes - tizes, 20-ig (pl. 15-12)
                        a = floor(random() * 9) + 1;
                        b = floor(random() * (a + 1));
                        a += 10;
                        b += 10;
                    },
                    function() { // Kerek tizes - kerek tizes (pl. 40-20)
                        a = floor(random() * 9) + 1;
                        b = floor(random() * a) + 1;
                        a *= 10;
                        b *= 10;
                    },
                    function() { // Kerek tizes - egyes (pl. 40-6)
                        a = floor(random() * 9) + 1;
                        b = floor(random() * 9) + 1;
                        a *= 10;
                    },
                    function() { // Tizes - egyes, nincs átlépés (pl. 48-6)
                        a = floor(random() * 9) + 1;
                        b = floor(random() * a) + 1;
                        a += (floor(random() * 9) + 1) * 10;
                    },
                    function() { // Tizes - egyes, van átlépés (pl. 42-6)
                        a = floor(random() * 7) + 2;
                        b = floor(random() * (9 - a)) + a + 1;
                        a += (floor(random() * 9) + 1) * 10;
                    },
                    function() { // Kerek tizes - tizes (pl. 40-12)
                        a = floor(random() * 8) + 2;
                        b = floor(random() * (a - 1)) + 1;
                        a *= 10;
                        b *= 10;
                        b += floor(random() * 9) + 1;
                    },
                    function() { // Tizes - tizes, nincs átlépés (pl. 43-12)
                        var a2;
                        a = floor(random() * 8) + 2;
                        a2 = floor(random() * 8) + 1;
                        b = floor(random() * a) + 1;
                        a *= 10;
                        a += a2;
                        b *= 10;
                        b += floor(random() * a2) + 1;
                    },
                    function() { // Tizes - tizes, van átlépés (pl. 42-17)
                        var a2;
                        a = floor(random() * 8) + 2;
                        a2 = floor(random() * 8) + 1;
                        b = floor(random() * (a - 1)) + 1;
                        a *= 10;
                        a += a2;
                        b *= 10;
                        b += floor(random() * (9 - a2)) + a2 + 1;
                    },
                    /** @TODO vegyes !!! */
                ],
                2: [
                    function() { // 0-tól 5-ig (pl. 3x[1-10])
                        a = floor(random() * 6);
                        b = floor(random() * 10) + 1;
                    },
                    function() { // 6-tól 10-ig (pl. 7x[1-10])
                        a = floor(random() * 5) + 6;
                        b = floor(random() * 10) + 1;
                    },
                    function() { // 10-től 20-ig (pl. 12x[1-10])
                        a = floor(random() * 10) + 11;
                        b = floor(random() * 10) + 1;
                    },
                    function() { // 20-tól 99-ig (pl. 34x[1-10])
                        a = floor(random() * 79) + 21;
                        b = floor(random() * 10) + 1;
                    },
                    function() { // Kerek tizesek (pl. 20x[1-10])
                        a = floor(random() * 9) + 1;
                        b = floor(random() * 10) + 1;
                        a *= 10;
                    },
                    function() { // Kerek százasok (pl. 200x[1-10])
                        a = floor(random() * 9) + 1;
                        b = floor(random() * 10) + 1;
                        a *= 100;
                    },
                    /** @TODO vegyes !!! */
                    
                ],
                3: [
                    function() { // Osztók 1-tól 10-ig (osztandók: 0-100, eredmény: 0-10)
                        b = floor(random() * 10) + 1;
                        a = floor(random() * 11) * b;
                    },
                    function() { // Osztók 1-tól 10-ig (osztandók: 0-100, eredmény: 10 < )
                        b = floor(random() * 9) + 1;
                        a = (floor(random() * (100/b - 11)) + 11) * b;
                    },
                    function() { // 100-tól 990-ig, 10-el oszhatóak (osztók: 1-10)
                        a = floor(random() * 90) + 10;
                        a *= 10;
                        do {
                            b = floor(random() * 10) + 1;
                        } while (a % b !== 0);
                    },
                    function() { // 1000-től 9900-ig, 100-al oszthatóak (osztók: 1-10)
                        a = floor(random() * 90) + 10;
                        a *= 100;
                        do {
                            b = floor(random() * 10) + 1;
                        } while (a % b !== 0);
                    },
                    function() { // 100-tól 990-ig, 10-el oszhatóak (osztók: 10, 20,...)
                        a = floor(random() * 90) + 10;
                        a *= 10;
                        do {
                            b = floor(random() * 10) + 1;
                            b *= 10;
                        } while (a % b !== 0);
                    },
                    function() { // 1000-től 9900-ig, 100-al oszthatóak (osztók: 10, 20,...)
                        a = floor(random() * 90) + 10;
                        a *= 100;
                        do {
                            b = floor(random() * 10) + 1;
                            b *= 10;
                        } while (a % b !== 0);
                    },
//                    "Vegyes, osztók 1-tól 10-ig (osztandók: 0-99)",
//                    "Vegyes (százasok, ezresek)",
                    /** @TODO vegyes !!! */
                ],
                4: [
                    function() { // 1-től 100-ig, 1-es szomszédok
                        b = floor(random() * 100) + 1;
                        a = b - 1;
                        c = b + 1;
                    },
                    function() { // 1-től 100-ig, 10-es szomszédok
                        b = floor(random() * 100) + 1;
                        if (b % 10 !== 0) {
                            a = floor(b / 10) * 10;
                            c = a + 10;
                        } else {
                            a = b - 10;
                            c = b + 10;
                        }
                    },
                    function() { // 100-tól 1000-ig, 1-es szomszédok
                        b = floor(random() * 901) + 100;
                        a = b - 1;
                        c = b + 1;
                    },
                    function() { // 100-tól 1000-ig, 10-es szomszédok
                        b = floor(random() * 901) + 100;
                        if (b % 10 !== 0) {
                            a = floor(b / 10) * 10;
                            c = a + 10;
                        } else {
                            a = b - 10;
                            c = b + 10;
                        }
                    },
                    function() { // 100-tól 1000-ig, 100-as szomszédok
                        b = floor(random() * 901) + 100;
                        if (b % 100 !== 0) {
                            a = floor(b / 100) * 100;
                            c = a + 100;
                        } else {
                            a = b - 100;
                            c = b + 100;
                        }
                    },
                ],
                5: [
                    function() {
                        var i = floor(random() * selectedSubtypesCount);
                        console.log(selectedSubtypes);
                        console.log(i);
                        console.log(selectedSubtypes[i]);
                        a = selectedSubtypes[i];
                        b = floor(random() * 10) + 1;
                    }
                ]
            },
            typeIndex,subTypeIndex,selectedSubtypes,selectedSubtypesCount,generateChallenge;
        
        function doOperation(a, op, b) {
            switch(op) {
                case '+':
                    return (a + b);
                case '-':
                    return (a - b);
                case '*':
                    return (a * b);
                case ':':
                    return (a / b);
                default:
                    console.log('Invalid operator: ' + operator);
                    return;
            }
        };
        
        function validate(a, op, b, val) {
            return typeof val !== 'object'
                ? doOperation(a, op, b) === (+val)
                : (a === (+val.a) && b === (+val.c));
        }

        function showProgress() {
            var perc_good = solved ? Math.round(good / solved * 100) : 50;
            var perc_bad = 100 - perc_good;
            prog_div.setAttribute('style', 'width: ' + (solved / total * 100) + '%');
            prog_div.setAttribute('aria-valuenow', solved);
            prog_label.innerHTML = solved;
            rat_good.setAttribute('style', 'width: ' + perc_good + '%');
            rat_good.setAttribute('aria-valuenow', perc_good);
            rat_good_label.innerHTML = (solved ? perc_good : 0) + '%';
            count_good_label.innerHTML = good;
            rat_bad.setAttribute('style', 'width: ' + perc_bad + '%');
            rat_bad.setAttribute('aria-valuenow', perc_bad);
            rat_bad_label.innerHTML = (solved ? perc_bad : 0) + '%';
            count_bad_label.innerHTML = bad;
        };

        function setChallenge() {
            b_div.innerHTML = b;
            x_div.value = '';
            if (typeIndex === 4) {
                a_div.value = '';
                a_div.focus();
            } else {
                a_div.innerHTML = a;
                x_div.focus();
            }
        };

        function showNext() {
            generateChallenge();
            setChallenge();
        }
        
        function getRightImage() {
            return imageDir + 'right' + (floor(random() * 17) + 1) + '.jpg';
        }

        function processAnswer(value) {
            var isObject = (typeof value === 'object');
            if (
                isObject
                    ? !value.a.match(regex_pattern) || !value.c.match(regex_pattern)
                    : !value.match(regex_pattern)
            ) {
                return;
            }
            solved++;
            if (validate(a, operator, (isObject ? c : b), value)) {
                logChallenge(true);
                good++;
                popup_right_image.src='';
                popup_right_image.src = getRightImage();
                popup_right.classList.remove('popup_hidden');
                setTimeout(function(){ popup_right.classList.add('popup_hidden');}, imageFadeTimeout);
            } else {
                logChallenge(false);
                bad++;
                popup_wrong.classList.remove('popup_hidden');
                setTimeout(function(){ popup_wrong.classList.add('popup_hidden');}, imageFadeTimeout);
            }
            if (solved === total) {
                showResult();
                return;
            }
            showProgress();
            if (autoNext) {
                showNext();
            }
        };
        
        function showLogin(container, loginDiv) {
            var button = loginDiv.getElementsByTagName("button")[0],
                input = loginDiv.getElementsByTagName('input')[0];
            button.onclick = function() {
                var name = input.value.toLowerCase(),
                    data;
                if ('' === name) {
                    alert("A név nem lehet üres!");
                    return;
                }
                /** @TODO server login!!! */
                user_data = getNewUserData(name);
                storage.local.set(storageKey, user_data);
                console.log('New user data: ', user_data);
                container.removeChild(loginDiv);
                resumeGame();
            };
            container.appendChild(loginDiv);
        }
        
        function getNewUserData(name) {
            return {
                name: name
            };
        }
        
        function loadUserData() {
            var data = storage.local.get(storageKey),
                userData;
            console.log(name);
            console.log(data);
            if (!data) {
                return false;
            }
            try {
                userData = JSON.parse(data);
            } catch (e) {
                console.log(e);
                console.log('Error: parsing data failed!');
                console.log(userData);
                /** @TODO: generate new user data? */
                return false;
            }
            
            alert('Szia ' + userData.name +'!');
            
            /** @TODO ajax validation, if online!!! */

            setTimeout(resumeGame(), 1000);
            return true;
        }
        
        function resumeGame() {
            switch(true) {
                case typeIndex === undefined:
                    showChallengeTypes();
                    break;
                case subTypeIndex === undefined:
                    showChallengeSubTypes();
                    break;
                case total === undefined:
                    showTotalDialog();
                    break;
                default:
                    showChallengeUi();
                    a || generateChallenge();
                    setChallenge();
            }
        }
        
        function logChallenge(isOk) {
            if (isOk) {
                challenge_log_answers.innerHTML += operator !== '<'
                    ? '<div class="answer_right">' + solved + ". " + a + operator + b + "=" + x + '</div>'
                    : '<div class="answer_right">' + solved + ". "+ a + operator + b + operator + c + '</div>';
            } else {
                challenge_log_answers.innerHTML += operator !== '<'
                    ? '<div class="answer_wrong">' + solved + ". "+ a + operator + b + "=" + x + ' (' + doOperation(a, operator, b) + ')</div>'
                    : '<div class="answer_wrong">' + solved + ". "+ x.a + operator + b + operator + x.c + ' (' + a + operator + b + operator + c + ')</div>';
            }
        }
        
        function showResult() {
            var history = result_div.querySelector("#challenge_history"),
                newButton = result_div.querySelector("button"),
                result = result_div.querySelector("#result"),
                resultString = '';
            if (!elementExist([history, newButton, result])) {
                return;
            }
            container.removeChild(challenge_wrapper);
//            container.removeChild(challenge_log);
            newButton.onclick = function() {
                container.removeChild(result_div);
                solved = 0;
                good = 0;
                bad = 0;
                challenge_log_answers.innerHTML = "";
                showChallengeTypes();
            };
            resultString += '<div class="result_row">Helyes válasz: ' + good + "</div>";
            resultString += '<div class="result_row">Helyes válasz: ' + bad + "</div>";
            resultString += '<div class="result_row">Összes feladat: ' + solved + "</div>";
            result.innerHTML = resultString;
            history.innerHTML = challenge_log_answers.innerHTML;
            container.appendChild(result_div);
        }
        
        function elementExist(element) {
            var count,
                isStrict = (function() { return !this; })();
            if (Object.prototype.toString.call(element) === '[object Array]') {
                count = element.length;
                for(var i = 0; i < count; i++) {
                    if(!element[i]) {
                        console.log('Error: element not found!' + (isStrict ? '' : '(in ' + elementExist.caller.name + ')'));
                        exitGame(true);
                        return false;
                    }
                }
            } else if (!element) {
                console.log('Error: element not found!');
                exitGame(true);
                return false;
            }
            return true;
        }
        
        function showChallengeTypes() {
            var select = challenge_types_div.querySelector("div.box_input select"),
                back = challenge_types_div.querySelector("div.box_back button"),
                submit = challenge_types_div.querySelector("div.box_submit button"),
                elem;
            if (!elementExist([select, back, submit])) {
                return;
            }
            back.onclick = function() {
                container.removeChild(challenge_types_div);
                showLogin(container, login_div);
            };
            function submitHandler() {
                typeIndex = (+select.value);
                operator = operators[typeIndex];
                container.removeChild(challenge_types_div);
                showChallengeSubTypes();
            };
            /** @TODO ... */
            submit.onclick = submitHandler;
//            challenge_subtypes_div.addEventListener('keypress', function(e) {
//                console.log('keypressed!');
//                if (e.keyCode !== 13) {
//                    return;
//                }
//                console.log('enter!');
//                submitHandler();
//            });

            while (select.hasChildNodes()) {
                select.removeChild(select.lastChild);
            }

            for(var i in challenge_types) {
                elem = document.createElement('option');
                elem.value = i;
                elem.innerHTML = challenge_types[i];
                select.appendChild(elem);
            }
            typeIndex = undefined;
            challenge_types_div.classList.add("box_hidden");
            container.appendChild(challenge_types_div);
            window.getComputedStyle(challenge_types_div, null).getPropertyValue('display'); // buffer flush hack...
            challenge_types_div.classList.remove("box_hidden");
        };
        
        function showChallengeSubTypes() {
            var subtypes = challenge_subtypes[typeIndex],
                count = subtypes.length,
                input = challenge_subtypes_div.querySelector("div.box_input"),
                back = challenge_subtypes_div.querySelector("div.box_back button"),
                submit = challenge_subtypes_div.querySelector("div.box_submit button"),
                name = challenge_subtypes_div.id,
                wrapper, elem, text,select;
            if (!elementExist([input, back, submit])) {
                return;
            }
            back.onclick = function() {
                container.removeChild(challenge_subtypes_div);
                showChallengeTypes();
            };
            function submitHandler() {
                var subtypeNodes;
                if (typeIndex !== 5) {
                    subTypeIndex = (+input.querySelector('select').value);
                } else {
                    subtypeNodes = input.querySelectorAll('input[type=checkbox]:checked');
                    selectedSubtypesCount = subtypeNodes.length;
                    selectedSubtypes = [];
                    if (!selectedSubtypesCount) {
                        alert('Válassz legalább egy feladattípust!');
                        return;
                    }
                    for(var i = 0; i < selectedSubtypesCount; i++) {
                        selectedSubtypes.push(subtypeNodes[i].value);
                    }
                    subTypeIndex = 0;
                }
                container.removeChild(challenge_subtypes_div);
                showTotalDialog();
            };
            submit.onclick = submitHandler;
//            challenge_subtypes_div.addEventListener('keypress', function(e) {
//                if (e.keyCode !== 13) {
//                    return;
//                }
//                console.log('enter!');
//                submitHandler();
//            });

            while (input.hasChildNodes()) {
                input.removeChild(input.lastChild);
            }
            
            if (typeIndex === 5) {
                for(var i in subtypes) {
                    wrapper = document.createElement('div');
                    wrapper.className = 'challenge_subtype_wrapper';
                    elem = document.createElement('input');
                    elem.type = "checkbox";
                    elem.name = name;
                    elem.value = i;
                    elem.tabIndex = 1;
                    text = document.createTextNode(subtypes[i]);
                    wrapper.appendChild(elem);
                    wrapper.appendChild(text);
                    input.appendChild(wrapper);
                }
            } else  {
                select = document.createElement('select');
                select.tabIndex = 1;
                for(var i = 0; i < count; i++) {
                    elem = document.createElement('option');
                    elem.value = i;
                    elem.innerHTML = subtypes[i];
                    select.appendChild(elem);
                }
                input.appendChild(select);
            }
            subTypeIndex = selectedSubtypes = selectedSubtypesCount = generateChallenge = undefined;
            challenge_subtypes_div.classList.add("box_hidden");
            container.appendChild(challenge_subtypes_div);
            window.getComputedStyle(challenge_subtypes_div, null).getPropertyValue('display'); // buffer flush hack...
            challenge_subtypes_div.classList.remove("box_hidden");
        };
        
        function showTotalDialog() {
            var input = challenge_total_div.querySelector("div.box_input input"),
                back = challenge_total_div.querySelector("div.box_back button"),
                submit = challenge_total_div.querySelector("div.box_submit button");
            if (!elementExist([input, back, submit])) {
                return;
            }
            back.onclick = function() {
                container.removeChild(challenge_total_div);
                showChallengeSubTypes();
            };
            submit.onclick = function() {
                var n = input.value;
                while(isNaN(n) || n <= 0) {
                    alert("Hibás érték! (" + n + ")");
                    return;
                }
                total = (+n);
                container.removeChild(challenge_total_div);
                showChallengeUi();
                showNext();
            };
            challenge_total_div.classList.add("box_hidden");
            container.appendChild(challenge_total_div);
            window.getComputedStyle(challenge_total_div, null).getPropertyValue('display'); // buffer flush hack...
            challenge_total_div.classList.remove("box_hidden");
        };
        
        function showChallengeUi() {
            var finishButton = challenge_wrapper.querySelector('#finish button');
            if (!elementExist([finishButton])) {
                return;
            }
            finishButton.onclick = function() {
                if (!confirm('Biztos, hogy befejezed?')) {
                    return;
                }
                showResult();
            }
            generateChallenge = generators[typeIndex][subTypeIndex];
            prog_div.setAttribute('aria-valuemax', total);
            if (typeIndex === 4) {
                challenge_div.innerHTML = nn_challenge_div.innerHTML;
                a_div = challenge_div.querySelector('#challenge_a');
                b_div = challenge_div.querySelector('#challenge_b');
                o_div = challenge_div.querySelector('#challenge_o');
                e_div = challenge_div.querySelector('#challenge_e');
                x_div = challenge_div.querySelector('#challenge_x');
                a_div.addEventListener('keypress', function(e) {
                    if (e.keyCode !== 13) {
                        return;
                    }
                    x_div.focus();
                });
                x_div.addEventListener('keypress', answerEntered);
                e_div.innerHTML = operator;
            }
            
            o_div.innerHTML = operator;
            container.appendChild(challenge_wrapper);
//            container.appendChild(challenge_log);
            challenge_wrapper.querySelector('#challenge_type').innerHTML = challenge_subtypes[typeIndex][subTypeIndex];
            showProgress();
        };
        
        function exitGame(force) {
            if (!force && !confirm('Biztos, hogy ki akarsz lépni?')) {
                return;
            }
            container.style = "display: none;";
            while (container.hasChildNodes()) {
                container.removeChild(container.lastChild);
            }
            window.game = undefined;
        };
        
        function answerEntered(e, force) {
            if (!force && e.keyCode !== 13) {
                return;
            }
            if (typeIndex !== 4) {
                x = x_div.value;
                processAnswer(x);
            } else {
                x = {"a": a_div.value, "c": x_div.value};
                processAnswer(x);
            }
        };
        
        x_div.addEventListener('keypress', answerEntered);

        function saveState() {
            var state;
            console.log(typeIndex);
            if (undefined === typeIndex) {
                storage.local.set(storageKey, {});
                return;
            }
            state = {
                a: a,
                b: b,
                c: c,
                operator: operator,
                total: total,
                solved: solved,
                good: good,
                bad: bad,
                typeIndex: typeIndex,
                subTypeIndex: subTypeIndex,
                selectedSubtypes: selectedSubtypes,
                selectedSubtypesCount: selectedSubtypesCount,
                challenge_log: challenge_log_answers.innerHTML
            };
            console.log('Save state');
            console.log(state);
            console.log('Save state string:');
            console.log(JSON.stringify(state));
            storage.local.set(storageKey, state);
        }
        
        function loadState() {
            var state = storage.local.get(storageKey);
            console.log(state);
            if (null === state || undefined === state.typeIndex) {
                console.log('No saved state to load.');
                return false;
            }
            console.log('Loading saved state...');
            a = state.a;
            b = state.b;
            c = state.c;
            operator = state.operator;
            total = state.total;
            solved = state.solved;
            good = state.good;
            bad = state.bad;
            typeIndex = state.typeIndex;
            subTypeIndex = state.subTypeIndex;
            selectedSubtypes = state.selectedSubtypes;
            selectedSubtypesCount = state.selectedSubtypesCount;
            challenge_log_answers.innerHTML = state.challenge_log;
            console.log('asdasdasd');
            console.log(state.challenge_log);
            return true;
        }
        
        challenge_log.onclick = function() {
            this.classList.toggle('active');
        };
        
        /** Mobile Chrome hack... */
        if (isMobileChrome) {
            enter_button.style.display = "block";
            enter_button.style.position = "absolute";
            enter_button.style.top = "-100%";
            enter_button.style.left = "-100%";
            enter_button.onfocus =  function(e) {
                answerEntered(e, true);
                x_div.focus();
            };
        }
        /** @TOTO Ubuntu Phone... */
        
        enter_button.onclick = answerEntered;
           
        popup_wrong_image.src = wrong_image;

        window.onbeforeunload = function () {
            saveState();
            return 'asd';
        };

        return {
            autoNext: function(b) {
                if (b !== null) {
                    autoNext = b;
                }
                return autoNext;
            },
            start: function() {
                while (container.hasChildNodes()) {
                    container.removeChild(container.lastChild);
                }
                dom.show(container);
                loadState();
                resumeGame();
//                loadUserData() || showLogin(container, login_div);
            },
            next: function() {
                showNext();
            },
            answer: function(value) {
                processAnswer(value);
            },
            exit: function() {
                /** @TODO delete storage on page close !!! */
                exitGame();
            }
        };
    }(window, document, container, gameId, basePath));

    window.game.start();
    
}(window, document));