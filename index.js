/*
    Rock Paper Scissors
    Copyright (C) 2022 Alessandro Proto - I3a
    https://alexdevs.me
*/

const data = {
    sets: [],
    objects: {},
};

let currentSetIndex;
let userChoice;

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function switchScene(from, to) {
    // animation fuckery
    document.getElementById(from).classList.add("fadeout");
    document.getElementById(from).classList.remove("fadein");

    document.getElementById(to).classList.add("fadein");
    document.getElementById(to).classList.remove("fadeout");

    await sleep(500);

    document.getElementById(from).style.display = "none";
    document.getElementById(to).style.display = "";
}

function sanitize(name) {
    return name.replace(/[^A-Z]+/ig, '').toLowerCase();
}

async function main() {
    loadData();

    insertSetButtons();
}

function loadData() {

    data.objects = gameData.objects;

    for (let rawSetData of gameData.sets) {
        let setData = {
            name: "Unnamed",
            set: [],
        };

        // if wildcard is at first pos, include all objects into the set
        if (rawSetData.set[0] === "*") {
            setData.set = Object.keys(data.objects);

            // if blacklist is present, remove values from set of all objects
            if (rawSetData.blacklist) {
                for (let val of rawSetData.blacklist) {
                    setData.set = setData.set.filter(x => x !== val);
                }
            }
        } else {
            setData.set = rawSetData.set;
        }

        setData.name = rawSetData.name ?? `${setData.set.length} objects`;

        data.sets.push(setData)
    }
}

function insertSetButtons() {
    let setsSelection = document.getElementById("set-selection");
    for (let i = 0; i < data.sets.length; i++) {
        let set = data.sets[i];
        let btn = document.createElement("button");
        btn.type = "button";
        btn.innerText = set.name;

        btn.addEventListener("click", () => loadGame(i));

        setsSelection.appendChild(btn);
    }
}

function getCard(name, interactive) {
    let obj = data.objects[name];

    let div = document.createElement("div");
    div.classList.add("card");
    if (interactive) {
        div.classList.add("interactive");
    }

    let img = document.createElement("img");
    img.src = "assets/" + name + ".png";
    img.alt = obj.name;
    div.appendChild(img);

    let p = document.createElement("p");
    p.innerText = obj.name;
    div.appendChild(p);

    return div;
}

async function loadGame(index) {
    console.log("Loading game with set of index ", index)
    currentSetIndex = index;

    // create all cards from the chosen set
    let selection = document.getElementById("card-selection");
    selection.innerHTML = "";

    let gameSet = data.sets[currentSetIndex].set;

    for (const name of gameSet) {
        let div = getCard(name, true);
        div.onclick = () => playCard(name);

        selection.appendChild(div);
    }

    switchScene("main-menu", "game");
}

function playCard(playerKey) {
    let gameSet = data.sets[currentSetIndex].set;
    let cpuChoice = randomInt(0, gameSet.length);
    let cpuKey = gameSet[cpuChoice];

    showResult(playerKey, cpuKey);
}

async function showResult(playerKey, cpuKey) {
    switchScene("game", "result");

    let playerCard = getCard(playerKey);
    document.getElementById("result-player").appendChild(playerCard);

    let cpuCard = getCard(cpuKey);
    cpuCard.classList.add("flipped");

    document.getElementById("result-cpu").appendChild(cpuCard);

    // wait for the fade in animation to finish
    await sleep(750);

    playerCard.classList.add("wobble");
    cpuCard.classList.add("wobble-reverse");

    let countdown = document.getElementById("result-status");
    for (let i = 3; i > 0; i--) {
        countdown.innerText = i;
        await sleep(1000);
    }

    playerCard.classList.remove("wobble");
    cpuCard.classList.remove("wobble-reverse");
    await sleep(100);
    cpuCard.classList.remove("flipped", "wobble-reverse");

    await sleep(100);

    let resultStatus = document.getElementById("result-status");

    document.getElementById("reset-button").style.display = "";

    if (playerKey == cpuKey) {
        resultStatus.innerText = "TIE!";
        resultStatus.classList.add("tie");
        return;
    }

    let playerObj = data.objects[playerKey];

    if (playerObj.beats.includes(cpuKey)) {
        resultStatus.innerText = "You won!";
        resultStatus.classList.add("win");
        playerCard.classList.add("glow");
        cpuCard.classList.add("emotional-damage");
        console.log("Player won");
    } else {
        resultStatus.innerText = "You lost!";
        resultStatus.classList.add("lose");
        cpuCard.classList.add("glow");
        playerCard.classList.add("emotional-damage");
        console.log("CPU won");
    }
}

async function reset() {
    await switchScene("result", "main-menu");

    currentSetIndex = undefined;
    let status = document.getElementById("result-status");
    status.innerText = "3";
    status.classList.remove("win");
    status.classList.remove("lose");
    status.classList.remove("tie");

    document.getElementById("result-player").children[1].remove();
    document.getElementById("result-cpu").children[1].remove();

    document.getElementById("reset-button").style.display = "none";
}

window.onload = main;