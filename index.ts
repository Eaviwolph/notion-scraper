import { Course, getCourses, getMeanByCourse } from "./src/models/courses";
import { Learning, getLearnings, populateWithProofs } from "./src/models/learnings";
import { Proof, getProofs } from "./src/models/proofs";
import { Users, getUsers } from "./src/models/users";
import { Client } from "@notionhq/client";
import express from 'express';

import * as fs from 'fs';
import { postStudents, postTeachers } from "./src/populate/users";
import { getToken } from "./src/populate/getToken";
import { postLearnings } from "./src/populate/learnings";
import { postCourses } from "./src/populate/course";
import { postProofs } from "./src/populate/proofs";
import { Competence, getCompetences } from "./src/models/competences";
import { postCompetences } from "./src/populate/competences";
import { getClassAnalytics, getClassMean, getClassMedian, getMean, getStandardDeviation, populateAnalytics } from "./src/analytics/students";

require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_KEY });

async function getAllAndPopulate(): Promise<{ students: Users[], teachers: Users[], proofs: Proof[], learnings: Learning[], courses: Course[], competences: Competence[]; }> {
    let students: Users[] = [];
    let teachers: Users[] = [];
    let proofs: Proof[] = [];
    let learnings: Learning[] = [];
    let courses: Course[] = [];
    let competences: Competence[] = [];

    try {
        students = await getUsers(notion);
        teachers = students.filter((student: Users) => {
            return !student.isStudent;
        });
        students = students.filter((student: Users) => {
            return student.isStudent;
        });
        fs.writeFileSync('~dev/students.json', JSON.stringify(students, null, 2));

        proofs = await getProofs(notion, students);
        fs.writeFileSync('~dev/proofs.json', JSON.stringify(proofs, null, 2));

        learnings = await getLearnings(notion, teachers);
        populateWithProofs(learnings, proofs);
        fs.writeFileSync('~dev/learnings.json', JSON.stringify(learnings, null, 2));
        fs.writeFileSync('~dev/teachers.json', JSON.stringify(teachers, null, 2));

        competences = getCompetences(learnings);
        fs.writeFileSync('~dev/competences.json', JSON.stringify(competences, null, 2));

        courses = await getCourses(notion, learnings);
        fs.writeFileSync('~dev/courses.json', JSON.stringify(courses, null, 2));

        let meanByCourse = getMeanByCourse(courses, students);
        fs.writeFileSync('~dev/meanByCourse.json', JSON.stringify(meanByCourse, null, 2));
    } catch (error) {
        console.error(error);
    }
    return { students, teachers, proofs, learnings, courses, competences };
}

async function populateWithData() {
    let { students, teachers, proofs, learnings, courses, competences } = await getAllAndPopulate();

    let token = await getToken("admin.admin", "admin");
    console.log("Token retrieved");

    await postStudents(token, students);
    fs.writeFileSync('~dev/afterStudents.json', JSON.stringify(students, null, 2));
    console.log("Students posted");

    await postTeachers(token, teachers);
    fs.writeFileSync('~dev/afterTeachers.json', JSON.stringify(teachers, null, 2));
    console.log("Teachers posted");

    await postLearnings(token, learnings);
    fs.writeFileSync('~dev/afterLearnings.json', JSON.stringify(learnings, null, 2));
    console.log("Learnings posted");

    await postCourses(token, courses, students, teachers);
    fs.writeFileSync('~dev/afterCourses.json', JSON.stringify(courses, null, 2));
    console.log("Courses posted");

    await postCompetences(token, competences);
    fs.writeFileSync('~dev/afterCompetences.json', JSON.stringify(competences, null, 2));
    console.log("Competences posted");

    await postProofs(token, proofs, teachers);
    fs.writeFileSync('~dev/afterProofs.json', JSON.stringify(proofs, null, 2));
    console.log("Proofs posted");
};

async function analitics() {
    let { students, teachers, proofs, learnings, courses, competences } = await getAllAndPopulate();
    let studentsAnalytics = populateAnalytics(courses, students);
    fs.writeFileSync('~dev/studentsAnalytics.json', getMean(studentsAnalytics, false, false));
    console.log("Class mean: " + getClassMean(studentsAnalytics));
    console.log("Class median: " + getClassMedian(studentsAnalytics));
    console.log("Standard deviation: " + getStandardDeviation(studentsAnalytics));
}

if (!fs.existsSync('~dev')) {
    fs.mkdirSync('~dev');
}

async function refresh() {
    while (true) {
        console.log("Refreshing");
        let { students, teachers, proofs, learnings, courses, competences } = await getAllAndPopulate();
        let studentsAnalytics = populateAnalytics(courses, students);
        fs.writeFileSync('~dev/classAnalytics.json', JSON.stringify(getClassAnalytics(studentsAnalytics), null, 2));
        console.log("Class mean: " + getClassMean(studentsAnalytics));
        // Wait 2 minutes
        await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 2));
    }
}

refresh();

const app = express();
const port = 9999;

app.get('/mean', async (req, res) => {
    let classAnalytics = JSON.parse(fs.readFileSync('~dev/classAnalytics.json', 'utf8'));

    let html = `<html>
    <head>
        <title>Analytics</title>
        <link rel="stylesheet" href="/static/style.css">
    </head>`;
    html += `<body>
        <p class="topInfo">Class mean: ${getClassMean(classAnalytics.students)}</p>
        <p class="topInfo">Class median: ${getClassMedian(classAnalytics.students)}</p>
        <p class="topInfo">Standard deviation: ${getStandardDeviation(classAnalytics.students)}</p>`;

    for (let i = 0; i < classAnalytics.students.length; i++) {
        html += `<p class="studentInfo">${classAnalytics.students[i].name}: ${classAnalytics.students[i].mean}</p>`;
        for (let j = 0; j < classAnalytics.students[i].ue.length; j++) {
            html += `<p class="ueInfo">${classAnalytics.students[i].ue[j].name}: ${classAnalytics.students[i].ue[j].mean * 20}</p>`;
            for (let k = 0; k < classAnalytics.students[i].ue[j].courses.length; k++) {
                html += `<p class="courseInfo">${classAnalytics.students[i].ue[j].courses[k].name}: ${classAnalytics.students[i].ue[j].courses[k].mean}</p>`;
            }
        }
    }
    html += `</body>
    </html>`;

    res.send(html);
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

});