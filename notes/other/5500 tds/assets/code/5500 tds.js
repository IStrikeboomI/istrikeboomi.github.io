const TEAMS = [
	"NYJ","BUF","NWE","MIA",
	"HOU","TEN","JAX","IND",
	"CLE","CIN","BAL","PIT",
	"RAI","LAC","KAN","DEN",
	"NYG","PHI","DAL","WAS",
	"CAR","TAM","ATL","NOR",
	"MIN","DET","CHI","GNB",
	"SFO","ARI","LAR","SEA"
];
const POSITIONS = ["QB","RB","WR","TE"];
const IMAGE_SPINS = 10;

let currentTDs = 0;
let selected = 0;
const selections = [[],[],[],[]];

const req = new XMLHttpRequest();
req.open("GET", "assets/json/data.json", false);
req.send(null);
const DATA = JSON.parse(req.responseText);

let content = document.getElementById("content");
let image = document.getElementById("logo");
image.src = "assets/images/teams/" + TEAMS.random() + ".png";

let currentTeam;

document.getElementById("playerSelect").value = "";
startTeam();
function onFinished() {
    document.getElementById("logo").remove();
    document.getElementById("playerSelect").remove();
    document.getElementById("playerSelectLabel").remove();
    document.getElementById("selectPlayer").remove();
    document.getElementById("currentTDsDiv").style.visibility = "visible";
    let text = document.createElement("p");
    text.style.fontSize = "50px";
    text.style.textAlign = "center";
    if (currentTDs >= 5500) {
        text.style.color = "#00FF00";
        text.innerHTML = "Success!";
    } else {
        text.style.color = "red";
        text.innerHTML = "Fail!";
    }
    document.getElementById("content").insertBefore(text,document.getElementById("selections"));
}
function selectPlayer() {
    let chosen = document.getElementById("playerSelect").value.toLowerCase();
    let player;
    for (let p of DATA) {
        if (p["teams"].includes(currentTeam) 
            && p["name"].toLowerCase() == chosen
            && POSITIONS.indexOf(p["pos"]) != -1 
            && selections[POSITIONS.indexOf(p["pos"])].length < 6
            && !selections[POSITIONS.indexOf(p["pos"])].map(p => p.name.toLowerCase()).includes(chosen)) {
            player = p;
            break;
        }
    }
    if (player !== undefined) {
        currentTDs += player["td"];
        let selection = {};
        selection.name = player["name"];
        selection.team = currentTeam;
        selection.td = player["td"];
        selected++;
        selections[POSITIONS.indexOf(player["pos"])].push(selection);
        let list = document.getElementById(player["pos"]+"List");
        for (let li of list.children) {
            if (li.innerHTML == "") {
                li.innerHTML = player["name"] + " (" + currentTeam + ") (" + player["td"] + ")";
                break;
            }
        }
        document.getElementById("currentTDs").innerHTML = currentTDs;
        if (selected >= 24) {
            onFinished();
        } else {
            startTeam();
        }
        document.getElementById("selectPlayer").hidden = true;
        document.getElementById("playerSelect").value = "";
        document.getElementById("players").innerHTML = "";
    }
}
function onPlayerSelectInput() {
    let chosen = document.getElementById("playerSelect").value.toLowerCase();
    let player;
    for (let p of DATA) {
        if (p["teams"].includes(currentTeam) 
            && p["name"].toLowerCase() == chosen
            && POSITIONS.indexOf(p["pos"]) != -1 
            && selections[POSITIONS.indexOf(p["pos"])].length < 6
            && !selections[POSITIONS.indexOf(p["pos"])].map(p => p.name.toLowerCase()).includes(chosen)) {
            player = p;
            break;
        }
    }
    document.getElementById("selectPlayer").hidden = player == undefined;
}
function addPlayersToSelect() {
    let playersText = document.getElementById("players");
    playersText.innerHTML = "";
    let showPlayerPosition = document.getElementById("showPlayerPosition").checked;
    let showPlayerTDs = document.getElementById("showPlayerTDs").checked;
    let showPlayerTeams = document.getElementById("showPlayerTeams").checked;
    for (let p of DATA) {
        if (p["teams"].includes(currentTeam) 
            && POSITIONS.indexOf(p["pos"]) != -1 
            && selections[POSITIONS.indexOf(p["pos"])].length < 6 
            && !selections[POSITIONS.indexOf(p["pos"])].map(p => p.name).includes(p["name"])
        ) {
            let option = document.createElement("option");
            option.value = p["name"];
            option.label = p["name"];
            if (showPlayerPosition) {
                option.label += (" (" + p["pos"] + ")");
            }
            if (showPlayerTDs) {
                option.label += (" (" + p["td"] + " TDs)");
            }
            if (showPlayerTeams) {
                option.label += " (";
                for (let i = 0;i < p["teams"].length;i++) {
                    option.label += p["teams"][i];
                    if (i != p["teams"].length - 1) {
                        option.label += ", ";
                    }
                }
                option.label += ")";
            }
            playersText.appendChild(option);
        }
    }
}
function onShowCurrentTDClick() {
    let element = document.getElementById("currentTDsDiv");
    if (document.getElementById("showCurrentTDs").checked) {
        element.style.visibility = "visible"
    } else {
        element.style.visibility = "hidden";
    }
}
function selectTeam() {
    currentTeam = TEAMS.random();
    image.src = "assets/images/teams/" + currentTeam + ".png";
    addPlayersToSelect();
}

function startTeam() {
    let timer = setInterval(() => {image.src = "assets/images/teams/" + TEAMS.random() + ".png";},100)
    setTimeout(() => {clearInterval(timer)},100 * IMAGE_SPINS);
    setTimeout(selectTeam,100 * IMAGE_SPINS);
}

function copyJSON() {
    let attempt = {};
    for (let pos of POSITIONS) {
        attempt[pos] = selections[POSITIONS.indexOf(pos)];
    }
    attempt.td = currentTDs; 
    console.log(attempt);
    console.log(JSON.stringify(attempt));
    navigator.clipboard.writeText(JSON.stringify(attempt));
}