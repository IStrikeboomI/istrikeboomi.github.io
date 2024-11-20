//meant to be implemented in the subject home page
//ex. calculus 1, pre calculus, linear algebra
//just gets all the files in the sitemap for this subject and adds them
subject = window.location.pathname;
subject = subject.substring(subject.lastIndexOf("/") + 1);
subject = subject.substring(0,subject.length - 5);
subject = subject.replaceAll("%20"," ");
console.log(subject);
const content = document.getElementById("content");
let title;
for (let i = 0;i < json.length;i++) {
    if (json[i].subject.toLowerCase() === subject) {
        title = json[i].subject;
        document.title = json[i].subject;
        let header = document.createElement("h2");
        header.innerHTML = title;
        content.appendChild(header);
        content.appendChild(document.createElement("hr"));

        let topics = json[i].topics;
        let list = document.createElement("ul");
        for (let j = 0;j < topics.length;j++) {
            let li = document.createElement("li");
            li.classList.add("no-bullets");
            let details = document.createElement("details");
            let summary = document.createElement("summary");
            let h3 = document.createElement("h3");
            h3.innerHTML = topics[j].section;
            summary.appendChild(h3);
            details.appendChild(summary);
            let notes = topics[j].notes;
            let notesList = document.createElement("ul");
            for (let k = 0;k < notes.length;k++) {
                let notesLi = document.createElement("li");
                let p = document.createElement("p");
                let a = document.createElement("a");
                a.href = "/notes/" + subject + "/" + topics[j].section + "/" + notes[k].name + ".html";
                a.innerHTML = notes[k].title;
                p.appendChild(a);
                notesLi.appendChild(p);
                notesList.appendChild(notesLi);
            }
            details.appendChild(notesList);
            li.appendChild(details);
            content.appendChild(li);
        }
        break;
    }
}