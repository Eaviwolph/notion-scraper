import { Competence, getCompetences } from "../models/competences";
import { Course, getCourses, getMeanByCourse } from "../models/courses";
import { Learning, getLearnings, populateWithProofs } from "../models/learnings";
import { Proof, getProofs } from "../models/proofs";
import { Users, getUsers } from "../models/users";
import * as fs from 'fs';
import { Client } from "@notionhq/client";

export async function getAll(notion: Client): Promise<{ students: Users[], teachers: Users[], proofs: Proof[], learnings: Learning[], courses: Course[], competences: Competence[]; }> {
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
