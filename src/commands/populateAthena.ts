import { getToken } from "../populate/getToken";
import { getAll } from "./getAll";
import { Client } from "@notionhq/client";
import { postStudents } from "../populate/users";
import { postTeachers } from "../populate/users";
import { postLearnings } from "../populate/learnings";
import { postCourses } from "../populate/course";
import { postProofs } from "../populate/proofs";
import { postCompetences } from "../populate/competences";
import * as fs from 'fs';
import { postMajors } from "../populate/majors";
import { postPromos } from "../populate/promos";
import { postSemesters } from "../populate/semesters";

export async function populateAthena(notion: Client) {
    let token = await getToken("admin.admin", "admin");
    console.log("Token retrieved");

    let { students, teachers, proofs, learnings, courses, competences } = await getAll(notion);

    await postMajors(token, students);
    fs.writeFileSync('~dev/afterMajors.json', JSON.stringify(students, null, 2));
    console.log("Majors posted");

    await postPromos(token, students);
    fs.writeFileSync('~dev/afterPromos.json', JSON.stringify(students, null, 2));
    console.log("Promos posted");

    await postSemesters(token, courses);
    fs.writeFileSync('~dev/afterSemesters.json', JSON.stringify(courses, null, 2));
    console.log("Semesters posted");

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
