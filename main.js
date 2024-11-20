const details = document.querySelector("details");
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

window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']]
    }
};
fetch('/sitemap.json')
    .then((response) => response.json())
    .then((json) => {
        console.log(json);
        let pathName = window.location.pathname;
        //if is notes
        if (pathName.includes("notes")) {
            pathName = pathName.substring(7,pathName.length);
            //class subject like calculus 1
            let subject = pathName.substring(0,pathName.indexOf("/"));
            pathName = pathName.substring(subject.length + 1);
            subject = subject.replaceAll("%20"," ");
            let topic = pathName.substring(0,pathName.indexOf("/"));
            pathName = pathName.substring(topic.length + 1);
            topic = topic.replaceAll("%20"," ");
            let notesName = pathName.substring(0,pathName.indexOf("."));
            notesName = notesName.replaceAll("%20"," ");
            notesName = notesName.replaceAll("%5E","^");
            
            console.log(subject);
            console.log(topic);
            console.log(notesName);
        }
    });