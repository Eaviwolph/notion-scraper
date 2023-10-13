import express from 'express';
import * as fs from 'fs';
import { getAllAndPopulate } from '.';
import { getClassAnalytics, getClassMean, getClassMedian, getStandardDeviation, populateAnalytics } from './analytics/students';

var Refreshing = false;

async function refresh(loop: boolean = true) {
    if (Refreshing) {
        return;
    }
    Refreshing = true;
    do {
        console.log("Refreshing");
        let { students, teachers, proofs, learnings, courses, competences } = await getAllAndPopulate();
        let studentsAnalytics = populateAnalytics(courses, students);
        fs.writeFileSync('~dev/classAnalytics.json', JSON.stringify(getClassAnalytics(studentsAnalytics), null, 2));
        console.log("Class mean: " + getClassMean(studentsAnalytics));

        Refreshing = false;
    } while (loop);
}

export function startServer() {
    const app = express();

    refresh(false);
    const port = 9999;

    app.get('/', async (req, res) => {
        if (req.query.refresh === "true") {
            refresh(false);
        }
        let classAnalytics = JSON.parse(fs.readFileSync('~dev/classAnalytics.json', 'utf8'));

        let html = `<html>
        <head>
            <title>Analytics</title>
            <link rel="stylesheet" href="/static/style.css">
        </head>`;
        html += `<body>
            <div id="topBar">
                <a class="topHead" href="/">Général</a>
                <a class="topHead" href="/?ue=true">UE</a>
                <a class="topHead" href="/?ue=true&courses=true">Course</a>
                <a class="topHead" href="/refresh">Refresh</a>
            </div>
            <div id="topInfoBar">
                <p class="topInfo">Moyenne de la classe : ${getClassMean(classAnalytics.students)}</p>
                <p class="topInfo">Mediane de la classe : ${getClassMedian(classAnalytics.students)}</p>
                <p class="topInfo">Ecart type : ${getStandardDeviation(classAnalytics.students)}</p>
                <p class="topInfo">Last refresh : ${fs.statSync('~dev/classAnalytics.json').mtime.toLocaleString() + (Refreshing ? " (Refreshing)" : "")}</p>
            </div>`;


        classAnalytics.students = classAnalytics.students.sort((a: any, b: any) => {
            return a.name.localeCompare(b.name);
        });
        classAnalytics.students = classAnalytics.students.sort((a: any, b: any) => {
            return b.mean - a.mean;
        });

        if (req.query.sort === "mean") {
            classAnalytics.students = classAnalytics.students.sort((a: any, b: any) => {
                return b.mean - a.mean;
            });
        } else if (req.query.sort === "name") {
            classAnalytics.students = classAnalytics.students.sort((a: any, b: any) => {
                return a.name.localeCompare(b.name);
            });
        }

        html += "<div id=\"students\">\n"
        for (let i = 0; i < classAnalytics.students.length; i++) {
            html += `<p class="studentInfo">${classAnalytics.students[i].name} : ${classAnalytics.students[i].mean}</p>`;
            if (req.query.ue === "true") {
                for (let j = 0; j < classAnalytics.students[i].ue.length; j++) {
                    html += `<p class="ueInfo">${classAnalytics.students[i].ue[j].name} : ${classAnalytics.students[i].ue[j].mean * 20}</p>`;
                    if (req.query.courses === "true") {
                        for (let k = 0; k < classAnalytics.students[i].ue[j].courses.length; k++) {
                            html += `<p class="courseInfo">${classAnalytics.students[i].ue[j].courses[k].name} : ${classAnalytics.students[i].ue[j].courses[k].mean}</p>`;
                        }
                    }
                }
            }
        }
        html += "</div>\n"
        html += `</body>
        </html>`;

        res.send(html);
    });

    app.get('/refresh', async (req, res) => {
        refresh(false);
        res.redirect("/");
    });

    app.get('/static/*', async (req, res) => {
        console.log(req.path);
        try {
            let file = fs.readFileSync("./src" + req.path, 'utf8');
            res.send(file);
        } catch (error) {
            console.error(error);
            res.send("Error");
        }
    });

    app.listen(port, () => {
        console.log(`Listening at http://localhost:${port}`)
    });
}