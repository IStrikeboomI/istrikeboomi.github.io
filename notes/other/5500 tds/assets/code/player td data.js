
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

const req = new XMLHttpRequest();
req.open("GET", "assets/json/data.json", false);
req.send(null);
let DATA = JSON.parse(req.responseText);
$(document).ready(function() {
    $('.multiselect').select2({
        placeholder: "Select A Team",
        allowClear: true
    });
});

let maxPlayers = 100;
let posAllowed = POSITIONS.map(s => document.getElementById(s).checked);
let teamsAllowed = Array.from(document.getElementById("teams")).map(option => option.value);
let nameAllowed = document.getElementById("name").innerHTML;
let minTDs = document.getElementById("minTD").value;
let sortElement;
let sortType = 0;
let currentData = DATA.slice();
let table = document.getElementById("table");

applyFilter();
updateTable();
function updateTable() {
    table.getElementsByTagName("tbody")[0].remove();
    table.appendChild(document.createElement("tbody"));
    for (let p of currentData) {
        let tr = document.createElement("tr");
        tr.classList.add("formatted");
        let name = document.createElement("td");
        name.innerHTML = p["name"];
        name.classList.add("formatted");
        tr.appendChild(name);
        let position = document.createElement("td");
        position.innerHTML = p["pos"];
        position.classList.add("formatted");
        tr.appendChild(position);
        let tds = document.createElement("td");
        tds.innerHTML = p["td"];
        tds.classList.add("formatted");
        tr.appendChild(tds);
        let teams = document.createElement("td");
        teams.innerHTML = p["teams"].toString().replaceAll(",",", ");
        teams.classList.add("formatted");
        tr.appendChild(teams);
        table.getElementsByTagName("tbody")[0].appendChild(tr);
        if (table.rows.length > maxPlayers) {
            break;
        }
    }
}

function sort(column, type) {
    if (type == 0) {
        applyFilter();
        return;
    }
    currentData.sort((a,b) => {
        if (typeof a[column] == "string" && typeof b[column] == "string") {
            return (type == 1 ? 1 : -1) * (a[column].localeCompare(b[column]));
        }
        if (typeof a[column] == "number" && typeof b[column] == "number") {
            return (type == 1 ? 1 : -1) * (a[column] - b[column]);
        }
        if (typeof a[column] == "object" && typeof b[column] == "object") {
            return (type == 1 ? 1 : -1) * (a[column].length - b[column].length);
        }
    });
}
function sortCycle(element) {
    if (element.classList.contains("headerSortUp")) {
        element.classList.remove("headerSortUp");
        element.classList.add("headerSortDown");
        return 2;
    }
    if (element.classList.contains("headerSortDown")) {
        element.classList.remove("headerSortDown");
        return 0;
    }
    if (!element.classList.contains("headerSortUp") && !element.classList.contains("headerSortDown")) {
        element.classList.add("headerSortUp");
        return 1;
    }
}
function tableSort(e) {
    sortElement = e.target;
    for (let td of table.getElementsByTagName("thead")[0].getElementsByTagName("tr")[0].children) {
        if (sortElement !== td) {
            td.classList.remove("headerSortDown");
            td.classList.remove("headerSortUp");
        }
    }
    sortType = sortCycle(sortElement);
    sort(sortElement.getAttribute("data-type"),sortType);
    updateTable();
}


function applyFilter() {
    currentData = DATA.slice();
    currentData = currentData.filter(p => {
        if (teamsAllowed.length > 0) {
            let hasTeam = false;
            for (let t of teamsAllowed) {
                if (p["teams"].includes(t)) {
                    hasTeam = true;
                    break;
                }
            }
            if (!hasTeam) {
                return false;
            }
        }
        if (POSITIONS.indexOf(p["pos"]) != -1) {
            if (!posAllowed[POSITIONS.indexOf(p["pos"])]) {
                return false;
            }
        } else {return false;}
        if (!p["name"].toLowerCase().includes(nameAllowed.toLowerCase())) {
            return false;
        }
        if (p["td"] < minTDs) {
            return false;
        }
        return true;
    });
    if (sortType !== 0 && sortElement !== undefined) {
        sort(sortElement.getAttribute("data-type"), sortType);
    }
    updateTable();
}
function maxPlayersFilter(e) {
    maxPlayers = e.target.value;
    updateTable();
}
function posFilter(e) {
    posAllowed[POSITIONS.indexOf(e.target.id)] = e.target.checked;
    applyFilter();
}
function teamFilter(e) {
    teamsAllowed = Array.from(e.target.selectedOptions).map(option => option.value);
    applyFilter();
}
function nameFilter(e) {
    nameAllowed = e.target.value
    applyFilter();
}
function minTDFilter(e) {
    minTDs = e.target.value
    applyFilter();
}