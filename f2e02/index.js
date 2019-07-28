/*定義一個函式來執行遊戲*/
function startGame() {
    //完成區域左上角
    let finishArea = [[], [], [], []];
    //卡片暫放區(每一格只能放一張)右上角
    let temporaryArea = [[], [], [], []];
    //主要遊戲區共8排
    let maingameArea = [
        [], //7張
        [], //7張
        [], //7張
        [], //7張
        [], //6張
        [], //6張
        [], //6張
        [] //6張
    ];

    let backStep = [] //負責儲存回朔的資料

    /*拖曳效果數值儲存*/
    let ondragCard = null  // 負責儲存被抓取卡片的數字
    ondragGroup = null  //負責儲存被抓取卡片所在的排數
    ondragSection = null //負責儲存被抓取卡片所在的區域
    ondragColor = null //負責儲存被抓取卡片的花色
    ondropCard = null   //負責儲存被堆疊的卡片數字
    ondropGroup = null  //負責儲存被堆疊的卡片所在排數
    ondropSection = null //負責儲存被堆疊的卡片所在區域
    ondropColor = null // 負責儲存被堆疊的卡片顏色

    /*狀態判定*/
    isgamePause = false  //遊戲是否停止
    isFinished = false  //卡片是否在完成區
    isTemporary = false //卡片是否在暫放區
    isRefresh = false   //畫面是否刷新

    /*隨機發牌設計*/
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    let pokerArr = [];
    for (let i = 0; i < 52; i++) {
        pokerArr.push(i + 1)
    }
    // let pokerArr =Array.from(new Array(52)).map(function(item,index){
    //     return index+1 
    // })

    let pokerRandom = shuffle(pokerArr);

    function mainpokerArr() {
        let randomarrNum = Math.floor(Math.random() * 8);
        if (randomarrNum <= 3) {
            if (maingameArea[randomarrNum].length >= 7) {
                return mainpokerArr()
            }
        } else {
            if (maingameArea[randomarrNum].length >= 6) {
                return mainpokerArr()
            }
        }
        return randomarrNum;
    }

    pokerRandom.map(function (item) {
        let runmainpokerArr = mainpokerArr();
        maingameArea[runmainpokerArr].push(item);
    });

    function judgeColor(cardNum) {
        if (cardNum >= 1 && cardNum <= 13) {
            return 'spade'
        } else if (cardNum >= 14 && cardNum <= 26) {
            return 'heart'
        } else if (cardNum >= 27 && cardNum <= 39) {
            return 'diamond'
        } else if (cardNum >= 40 && cardNum <= 52) {
            return 'club'
        }
    };



    /*將發牌渲染到畫面上*/
    let gamingArea = document.getElementById('gamingArea');

    //這裡要將7張牌的分成一區，6張牌的分成一區
    let cardbigGroup = [[], []];
    maingameArea.forEach(function (item, index) {
        if (index <= 3) {
            cardbigGroup[0].push(item);
        } else {
            cardbigGroup[1].push(item)
        };
    });

    function putCard() {
        cardbigGroup.forEach(function (section, sectionNum) {
            let cardbiggroupPart = document.createElement('div');
            cardbiggroupPart.className = 'col-6 d-flex w-100'
            section.forEach(function (item, index) {
                let cardGroup = document.createElement('div');
                cardGroup.className = 'relative w-100';
                cardGroup.style.height = '600px'
                cardGroup.group = index;
                cardGroup.section = sectionNum;
                item.forEach(function (el, num) {
                    let oneCard = document.createElement('div');
                    oneCard.className = 'cardArea absolute';
                    if (!isRefresh) {
                        oneCard.style.transition = 'all .3s'
                        oneCard.style.top = '-1000px';
                        oneCard.style.left = '-2000px';
                        setTimeout(function () {
                            oneCard.style.top = num * 30 + 'px';
                            oneCard.style.left = '0px'
                        }, index * num * 30)
                    } else {
                        oneCard.style.top = num * 30 + 'px';
                        oneCard.style.left = '0px'
                    }
                    let cardImg = document.createElement('img');
                    cardImg.draggable = false
                    cardImg.card = el;
                    cardImg.section = sectionNum;
                    cardImg.group = index;
                    cardImg.color = judgeColor(el)
                    cardImg.src = `pokercard/card-${judgeColor(el)}-${el % 13}.png`;
                    if (!isgamePause && num + 1 == item.length) {
                        oneCard.draggable = true;
                        cardImg.draggable = true
                    }
                    oneCard.appendChild(cardImg)
                    cardGroup.appendChild(oneCard);
                })
                cardbiggroupPart.appendChild(cardGroup)
            })

            gamingArea.appendChild(cardbiggroupPart);
        });

    };
    putCard();

    /*上方完成牌區渲染*/
    function sortColor(areaNum) {
        if (areaNum == 0) {
            return 'spade'
        } else if (areaNum == 1) {
            return 'heart'
        } else if (areaNum == 2) {
            return 'diamond'
        } else if (areaNum == 3) {
            return 'club'
        }
    }
    let finished = document.getElementById('finished')
    function storefinishCard() {
        finishArea.forEach(function (item, index) {
            let completedDeck = document.createElement('div');
            completedDeck.className = 'cardArea mr-4 bg-secondary rounded d-flex justify-content-center align-items-center relative'
            completedDeck.status = 'finished'
            completedDeck.innerHTML = `<i class="fas fa-candy-cane"></i>`
            completedDeck.color = `${sortColor(index)}`
            completedDeck.group = index
            item.forEach(function (el, num) {
                let cardImg = document.createElement('img');
                cardImg.draggable = false
                cardImg.card = el;
                cardImg.status = 'finished';
                cardImg.group = index;
                cardImg.section = ''
                cardImg.className = 'absolute'
                cardImg.style.top = '0px'
                cardImg.style.left = '0px'
                cardImg.color = judgeColor(el);
                cardImg.src = `pokercard/card-${judgeColor(el)}-${el % 13}.png`;
                completedDeck.appendChild(cardImg)
            })
            finished.appendChild(completedDeck);

        })

    }
    storefinishCard()


    /*上方暫放牌區渲染*/
    let temporary = document.getElementById('temporary')
    function storetempCard() {
        temporaryArea.forEach(function (item, index) {
            let temporaryDeck = document.createElement('div');
            temporaryDeck.className = 'cardArea mr-4 bg-secondary rounded ';
            temporaryDeck.status = 'temporary'
            temporaryDeck.group = index
            item.forEach(function (el, num) {
                let cardImg = document.createElement('img');
                cardImg.draggable = true
                cardImg.card = el;
                cardImg.status = 'temporary';
                cardImg.group = index;
                cardImg.section = ''
                cardImg.color = judgeColor(el);
                cardImg.src = `pokercard/card-${judgeColor(el)}-${el % 13}.png`;
                temporaryDeck.appendChild(cardImg);
            })

            temporary.appendChild(temporaryDeck);
        })
    }

    storetempCard();

    /*頁面刷新 function*/
    function refreshWindow() {
        isRefresh = true
        finished.innerHTML = ''
        temporary.innerHTML = ''
        gamingArea.innerHTML = ''
        putCard();
        storefinishCard();
        storetempCard();
         /*完成回饋*/
    let finishalert1 = maingameArea.every(function(item){
        return item.length === 0
    })
    let finishalert2 = temporaryArea.every(function(item){
        return item.length === 0
    })
    if(finishalert1 && finishalert2){
        alert('恭喜過關!!!!')
    }

    }

    /*清空拖曳變數*/
    function clear() {
        ondragSection = null;
        ondragGroup = null;
        ondragColor = null;
        ondropColor = null;
        ondropGroup = null;
        ondropSection = null;
    }

    /*回朔功能製作*/
    let goBack = document.getElementById('back')
    goBack.addEventListener('click', Undo)
    function Undo() {
        if(isgamePause){
            return
        }
        let backfirstStep = backStep.pop();
        if (backfirstStep.active == 'putinTemp') {
            temporaryArea[backfirstStep.to.cardGroup].pop();
            cardbigGroup[backfirstStep.from.cardSection][backfirstStep.from.cardGroup].push(backfirstStep.from.cardNum)
        } else if (backfirstStep.active == 'putinFinish') {
            if (backfirstStep.from.cardSection === '') {
                finishArea[backfirstStep.to.cardGroup].pop();
                temporaryArea[backfirstStep.from.cardGroup].push(backfirstStep.from.cardNum)
            } else if (backfirstStep.from.cardSection >= 0) {
               finishArea[backfirstStep.to.cardGroup].pop();
                cardbigGroup[backfirstStep.from.cardSection][backfirstStep.from.cardGroup].push(backfirstStep.from.cardNum)
            }
        }else if (backfirstStep.active == 'putinRandom'){
            cardbigGroup[backfirstStep.to.cardSection][backfirstStep.to.cardGroup].pop();
            cardbigGroup[backfirstStep.from.cardSection][backfirstStep.from.cardGroup].push(backfirstStep.from.cardNum)
        }
        refreshWindow()
    }

    /*拖曳效果各事件觸發函式*/
    function dragStart(e) {
        e.defaultPrevented;
        if (isgamePause) {
            return
        }
        ondragCard = e.target.card;
        ondragGroup = e.target.group;
        ondragSection = e.target.section;
        ondragColor = e.target.color;
    };

    function dragEnter(e) {
        e.defaultPrevented;
        if (e.target.id === 'gamingArea') {
            return
        }
        if (e.target.status === 'finished') {
            isFinished = true

        }
        if (e.target.status === 'temporary') {
            isTemporary = true
        }
        ondropCard = e.target.card;
        ondropGroup = e.target.group;
        ondropSection = e.target.section;
        ondropColor = e.target.color;

        if (ondropCard === ondragCard) {
            return
        }
        // if (e.target.card === undefined) { return }

    };

    function dragLeave(e) {
        if (e.target.status !== 'finished' && e.target.status !== 'temporary') {
            isFinished = false;
            isTemporary = false;
        }
        if (e.target.status == 'finished') {
            isFinished = true
            isTemporary = false
        }
        if (e.target.status == 'temporary') {
            isTemporary = true
            isFinished = false
        }

    };

    function dragEnd(e) {
        if (isgamePause) {
            return
        }
        if (isTemporary) {
            if (temporaryArea[ondropGroup].length == 1) { return };
            backStep.push({
                from: {
                    cardNum: ondragCard,
                    cardGroup: ondragGroup,
                    cardSection: ondragSection,
                    cardColor: ondragColor
                },
                to: {
                    cardNum: ondropCard,
                    cardGroup: ondropGroup,
                    cardSection: ondropSection,
                    cardColor: ondropColor
                },

                active: 'putinTemp'
            });
            cardbigGroup[ondragSection][ondragGroup].pop();
            temporaryArea[ondropGroup].push(ondragCard);
            clear()
            refreshWindow();
            isTemporary = false

        }

        if (isFinished) {
            if (ondropColor == ondragColor) {
                if ((finishArea[ondropGroup].length + 1 == ondragCard % 13 || finishArea[ondropGroup].length - 12 == ondragCard % 13) && temporaryArea[ondragGroup].indexOf(ondragCard) > -1) {
                    backStep.push({
                        from: {
                            cardNum: ondragCard,
                            cardGroup: ondragGroup,
                            cardSection: ondragSection,
                            cardColor: ondragColor
                        },
                        to: {
                            cardNum: ondropCard,
                            cardGroup: ondropGroup,
                            cardSection: ondropSection,
                            cardColor: ondropColor
                        },

                        active: 'putinFinish'
                    });
                    finishArea[ondropGroup].push(ondragCard);
                    temporaryArea[ondragGroup].pop();
                    clear()
                } else if ((finishArea[ondropGroup].length + 1 == ondragCard % 13 || finishArea[ondropGroup].length - 12 == ondragCard % 13) && temporaryArea[ondragGroup].indexOf(ondragCard) < 0) {
                    backStep.push({
                        from: {
                            cardNum: ondragCard,
                            cardGroup: ondragGroup,
                            cardSection: ondragSection,
                            cardColor: ondragColor
                        },
                        to: {
                            cardNum: ondropCard,
                            cardGroup: ondropGroup,
                            cardSection: ondropSection,
                            cardColor: ondropColor
                        },

                        active: 'putinFinish'
                    });
                    cardbigGroup[ondragSection][ondragGroup].pop();
                    finishArea[ondropGroup].push(ondragCard);
                    clear()
                } 
            }
            isFinished = false
            refreshWindow();
        }


        if (!isTemporary && !isFinished) {
            let dragColor = Math.ceil(ondragCard / 13)
            let dropColor = Math.ceil(ondropCard / 13)
            let followRules = dragColor !== dropColor && dragColor + dropColor !== 5 && (ondropCard % 13 == (ondragCard % 13) + 1 || (ondragCard % 13 == 12 && ondropCard % 13 == 0));
            if (followRules) {
                if (temporaryArea[ondragGroup].indexOf(ondragCard) > -1) {
                    backStep.push({
                        from: {
                            cardNum: ondragCard,
                            cardGroup: ondragGroup,
                            cardSection: ondragSection,
                            cardColor: ondragColor
                        },
                        to: {
                            cardNum: ondropCard,
                            cardGroup: ondropGroup,
                            cardSection: ondropSection,
                            cardColor: ondropColor
                        },

                        active: 'putinRandom'
                    });
                    temporaryArea[ondragGroup].pop();
                    cardbigGroup[ondropSection][ondropGroup].push(ondragCard)
                    clear()
                } else if (cardbigGroup[ondragSection][ondragGroup].length > 0) {
                    backStep.push({
                        from: {
                            cardNum: ondragCard,
                            cardGroup: ondragGroup,
                            cardSection: ondragSection,
                            cardColor: ondragColor
                        },
                        to: {
                            cardNum: ondropCard,
                            cardGroup: ondropGroup,
                            cardSection: ondropSection,
                            cardColor: ondropColor
                        },

                        active: 'putinRandom'
                    });
                    cardbigGroup[ondragSection][ondragGroup].pop();
                    cardbigGroup[ondropSection][ondropGroup].push(ondragCard)
                    clear()
                }
            } else if (cardbigGroup[ondropSection][ondropGroup].length == 0) {
                if (temporaryArea[ondragGroup].indexOf(ondragCard) > -1) {
                    backStep.push({
                        from: {
                            cardNum: ondragCard,
                            cardGroup: ondragGroup,
                            cardSection: ondragSection,
                            cardColor: ondragColor
                        },
                        to: {
                            cardNum: ondropCard,
                            cardGroup: ondropGroup,
                            cardSection: ondropSection,
                            cardColor: ondropColor
                        },

                        active: 'putinRandom'
                    });
                    temporaryArea[ondragGroup].pop();
                    cardbigGroup[ondropSection][ondropGroup].push(ondragCard)
                    clear()
                } else if (cardbigGroup[ondragSection][ondragGroup].length > 0) {
                    backStep.push({
                        from: {
                            cardNum: ondragCard,
                            cardGroup: ondragGroup,
                            cardSection: ondragSection,
                            cardColor: ondragColor
                        },
                        to: {
                            cardNum: ondropCard,
                            cardGroup: ondropGroup,
                            cardSection: ondropSection,
                            cardColor: ondropColor
                        },

                        active: 'putinRandom'
                    });
                    cardbigGroup[ondragSection][ondragGroup].pop();
                    cardbigGroup[ondropSection][ondropGroup].push(ondragCard)
                    clear()
                }
            }
            refreshWindow();

        }


    }


    /*拖曳效果事件監聽*/
    let container = document.getElementById('container');
    container.addEventListener('dragstart', dragStart);
    container.addEventListener('dragenter', dragEnter);
    container.addEventListener('dragleave', dragLeave);
    container.addEventListener('dragend', dragEnd);

    /*重新開始功能製作*/
    let restart = document.querySelector('.js-restart')
    restart.addEventListener('click', reStart);
    function reStart() {
        window.location.reload();
    }

    /*遊戲暫停功能製作*/
    let timerId = '';
    let startTime = 0;

    let gamePause = document.getElementById('gamePause');
    gamePause.addEventListener('click', timeStop);
    function timeStop() {
        isgamePause = !isgamePause
        if (isgamePause == false) {
            startTimer();
            gamePause.innerHTML = `<i class="fas fa-pause"></i><span>PAUSE</span>`
        } else {
            clearInterval(timerId);
            timerId = '';
            gamePause.innerHTML = `<i class="fas fa-play mr-1 text-white fa-sm"></i><span>START</span>`
        }
    }

    /*計時功能製作*/
    let Timer = document.getElementById('timer')
    function startTimer() {
        timerId = setInterval(function () {
            startTime += 1
            let minutes = Math.floor(startTime / 60);
            let seconds = startTime % 60;
            if (minutes < 10) {
                minutes = `0${minutes}`
            }
            if (seconds < 10) {
                seconds = `0${seconds}`
            }
            Timer.textContent = `${minutes}:${seconds}`
        }, 1000)

    }
    startTimer()

   
   
}
startGame()