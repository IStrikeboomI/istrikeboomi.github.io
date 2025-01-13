
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

let currentData = DATA.slice();
let table = document.getElementById("table");

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
        teams.innerHTML = p["teams"];
        teams.classList.add("formatted");
        tr.appendChild(teams);
        table.getElementsByTagName("tbody")[0].appendChild(tr);
        if (table.rows.length > 100) {
            break;
        }
    }
}

function sort(column, type) {
    if (type == 0) {
        currentData = DATA.slice();
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
    let element = e.target;
    for (let td of table.getElementsByTagName("thead")[0].getElementsByTagName("tr")[0].children) {
        if (element !== td) {
            td.classList.remove("headerSortDown");
            td.classList.remove("headerSortUp");
        }
    }
    let sortType = sortCycle(element);
    sort(element.getAttribute("data-type"),sortType);
    updateTable();
}

function applyFilter() {
    
}
function posFilter(e) {
    console.log(e.target.value);
}
function teamFilter(e) {
    let teams = Array.from(e.target.selectedOptions).map(option => option.value);
    console.log(teams);
}
function nameFilter(e) {
    console.log(e.target.value);
}
function minTDFilter(e) {
    console.log(e.target.value);
}