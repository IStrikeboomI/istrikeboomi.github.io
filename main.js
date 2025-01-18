//Allow inline mathjax
window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']]
    }
};

const content = document.getElementById("content");

//create sidebar
let sidebar = document.createElement("table");
sidebar.id = "side-bar";

//home
let homeTr = document.createElement("tr");
let homeTh = document.createElement("th");
homeTh.classList.add("align-left-cell");
let homeA = document.createElement("a");
homeA.innerHTML = "Home";
homeA.href = "/";
homeTh.appendChild(homeA);
homeTr.appendChild(homeTh);
sidebar.appendChild(homeTr);

//random page
let randomTr = document.createElement("tr");
let randomTh = document.createElement("th");
randomTh.classList.add("align-left-cell");
let randomA = document.createElement("a");
randomA.innerHTML = "Random Note";
randomA.href = "javascript:goToRandomPage()";
randomTh.appendChild(randomA);
randomTr.appendChild(randomTh);
sidebar.appendChild(randomTr);

//horizontal line separator in sidebar
sidebar.appendChild(document.createElement("hr"));

//hide button on sidebar
let sidebarHideButton = document.createElement("button");
sidebarHideButton.id="side-bar-hide-button";
sidebarHideButton.innerHTML="<<";
sidebarHideButton.onclick = (e) => {
    if (sidebar.classList.contains("side-bar-hidden")) {
        sidebar.classList.remove("side-bar-hidden");
        sidebarHideButton.innerHTML = "<<";
    } else {
        sidebar.classList.add("side-bar-hidden");
        sidebarHideButton.innerHTML = ">>"; 
    }

}
sidebar.prepend(sidebarHideButton);

document.getElementsByTagName("body")[0].prepend(sidebar);

//add Strike's Notes header to top of page
let siteHeader = document.createElement("h1");
siteHeader.innerHTML = "Strike's Notes";
document.getElementsByTagName("body")[0].prepend(siteHeader);

let json;
let subject, topic, notesName;

const request = new XMLHttpRequest();
request.open("GET", "/sitemap.json", false);
request.send(null);

if (request.status === 200) {
    json = JSON.parse(request.responseText);
    console.log(json);
    let pathName = window.location.pathname;
    //if is notes
    if (pathName.includes("notes")) {
        pathName = pathName.substring(7,pathName.length);
        //class subject like calculus 1
        subject = pathName.substring(0,pathName.indexOf("/"));
        pathName = pathName.substring(subject.length + 1);
        subject = subject.replaceAll("%20"," ");
        topic = pathName.substring(0,pathName.indexOf("/"));
        pathName = pathName.substring(topic.length + 1);
        topic = topic.replaceAll("%20"," ");
        notesName = pathName.substring(0,pathName.indexOf("."));
        notesName = notesName.replaceAll("%20"," ");
        notesName = notesName.replaceAll("%5E","^");

        
        for (let i = 0;i < json.length;i++) {
            if (json[i].subject.toLowerCase() === subject) {
                let s = json[i].topics;
                for (let j = 0;j < s.length;j++) {
                    if (s[j].section.toLowerCase() === topic) {
                        let n = s[j].notes;
                        for (let k = 0;k < n.length;k++) {
                            if (n[k].name === notesName) {
                                let header = document.createElement("h2");
                                header.innerHTML = n[k].title;
                                content.prepend(header);
                                console.log(n[k].title);
                                document.title = n[k].title.replaceAll("$","");

                                //create back and forth arrows for notes
                                let previousNote = document.createElement("a");
                                previousNote.id = "previous-note";
                                let nextNote = document.createElement("a");
                                nextNote.id = "next-note"
                                //go back
                                if (k != 0) {
                                    previousNote.innerHTML = "<-- (" + s[j].section + ") " + n[k-1].title;
                                    previousNote.href = "/notes/" + json[i].subject.toLowerCase() + "/" + s[j].section.toLowerCase() + "/" + n[k-1].name + ".html";
                                } else {
                                    //means this is first note in the section
                                    if (j != 0) {
                                        let previousSection = s[j - 1];
                                        let previousSectionLastNote = previousSection.notes[previousSection.notes.length - 1];
                                        previousNote.innerHTML = "<-- (" + s[j - 1].section + ") " + previousSectionLastNote.title;
                                        previousNote.href = "/notes/" + json[i].subject.toLowerCase() + "/" + s[j - 1].section.toLowerCase() + "/" + previousSectionLastNote.name + ".html";
                                    }
                                }
                                //go forth
                                if (k != n.length - 1) {
                                    nextNote.innerHTML = "(" + s[j].section + ") " + n[k+1].title + " -->";
                                    nextNote.href = "/notes/" + json[i].subject.toLowerCase() + "/" + s[j].section.toLowerCase() + "/" + n[k+1].name + ".html";
                                } else {
                                    //means this is the last note in the section
                                    if (j != s.length - 1) {
                                        let nextSection = s[j + 1];
                                        let nextSectionFirstNote = nextSection.notes[0];
                                        console.log(nextSectionFirstNote);
                                        nextNote.innerHTML = "(" + s[j + 1].section + ") " + nextSectionFirstNote.title + "-->";
                                        nextNote.href = "/notes/" + json[i].subject.toLowerCase() + "/" + s[j + 1].section.toLowerCase() + "/" + nextSectionFirstNote.name + ".html";
                                    }
                                }
                                
                                content.prepend(nextNote);
                                content.prepend(previousNote);
                            }
                        }
                    }
                }

            }
        }
    }
    //add to side bar
    for (let i = 0;i < json.length;i++) {
        let tr = document.createElement("tr");
        let th = document.createElement("th");
        th.classList.add("align-left-cell");
        let a = document.createElement("a");
        a.href = "/notes/" + json[i].subject.toLowerCase() + ".html";
        a.innerHTML = json[i].subject;
        th.appendChild(a);
        tr.appendChild(th);
        sidebar.appendChild(tr);
    }
}

function goToRandomPage() {
    console.log("TODO: add random page redirect");
}
//util section
//get random element in array
Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function validateNumber(evt) {
    var theEvent = evt || window.event;
  
    // Handle paste
    if (theEvent.type === 'paste') {
        key = event.clipboardData.getData('text/plain');
    } else {
    // Handle key press
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
    }
    var regex = /[0-9]|\./;
    if( !regex.test(key) ) {
      theEvent.returnValue = false;
      if(theEvent.preventDefault) theEvent.preventDefault();
    }
  }