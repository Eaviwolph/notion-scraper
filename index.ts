import { Course, getCourses, getMeanByCourse } from "./src/models/courses";
import { Learning, getLearnings, populateWithProofs } from "./src/models/learnings";
import { Proof, getProofs } from "./src/models/proofs";
import { Student, getStudents } from "./src/models/students";
import { Client } from "@notionhq/client";

import * as fs from 'fs';
import { postStudents } from "./src/populate/users";
import { getToken } from "./src/populate/getToken";
import { postLearnings } from "./src/populate/learnings";
import { postCourses } from "./src/populate/course";
import { postProofs } from "./src/populate/proofs";

require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_KEY });

async function getAllAndPopulate(): Promise<{ students: Student[], proofs: Proof[], learnings: Learning[], courses: Course[]; }> {
    let students: Student[] = [];
    let proofs: Proof[] = [];
    let learnings: Learning[] = [];
    let courses: Course[] = [];

    try {
        students = await getStudents(notion);
        fs.writeFileSync('~dev/students.json', JSON.stringify(students, null, 2));

        proofs = await getProofs(notion, students);
        fs.writeFileSync('~dev/proofs.json', JSON.stringify(proofs, null, 2));

        learnings = await getLearnings(notion);
        populateWithProofs(learnings, proofs);
        fs.writeFileSync('~dev/learnings.json', JSON.stringify(learnings, null, 2));

        courses = await getCourses(notion, learnings);
        fs.writeFileSync('~dev/courses.json', JSON.stringify(courses, null, 2));

        let meanByCourse = getMeanByCourse(courses, students);
        fs.writeFileSync('~dev/meanByCourse.json', JSON.stringify(meanByCourse, null, 2));
    } catch (error) {
        console.error(error);
    }
    return { students, proofs, learnings, courses };
}

async function populateWithData() {
    let { students, proofs, learnings, courses } = await getAllAndPopulate();

    let token = await getToken();

    await postStudents(token, students);
    fs.writeFileSync('~dev/afterStudents.json', JSON.stringify(students, null, 2));

    await postLearnings(token, learnings);
    fs.writeFileSync('~dev/afterLearnings.json', JSON.stringify(learnings, null, 2));

    await postCourses(token, courses, students);
    fs.writeFileSync('~dev/afterCourses.json', JSON.stringify(courses, null, 2));

    await postProofs(token, proofs, students);
    fs.writeFileSync('~dev/afterProofs.json', JSON.stringify(proofs, null, 2));
};

populateWithData();