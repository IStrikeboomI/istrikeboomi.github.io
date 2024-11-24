const details = document.querySelector("details");
if (details !== null) {
    details.addEventListener("click", (e) => {
    if (details.hasAttribute("open")) { // since it's not closed yet, it's open!
        e.preventDefault(); // stop the default behavior, meaning - the hiding
        details.classList.add("closing"); // add a class which applies the animation in CSS
    }
    });

    // when the "close" animation is over
    details.addEventListener("animationend", (e) => {
    if (e.animationName === "close") {
        details.removeAttribute("open"); // close the element
        details.classList.remove("closing"); // remove the animation
    }
    });
}
//Allow inline mathjax
window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']]
    }
};
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

        let content = document.getElementById("content");
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
                            }
                        }
                    }
                }
            }
        }
    }
    //add to side bar
    const sidebar = document.getElementById("side-bar");
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