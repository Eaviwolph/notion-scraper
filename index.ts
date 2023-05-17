import { getCourses, getMeanByCourse } from "./src/courses";
import { getLearnings, populateWithProofs } from "./src/learnings"
import { getProofs } from "./src/proofs";
import { getStudents } from "./src/students"
import { Client } from "@notionhq/client"
import * as fs from 'fs';

require('dotenv').config()

const notion = new Client({ auth: process.env.NOTION_KEY })

async function getAllAndPopulate() {
    try {
        let students = await getStudents(notion)
        fs.writeFileSync('~dev/students.json', JSON.stringify(students, null, 2))

        let proofs = await getProofs(notion, students)
        fs.writeFileSync('~dev/proofs.json', JSON.stringify(proofs, null, 2))

        let learnings = await getLearnings(notion)
        populateWithProofs(learnings, proofs)
        fs.writeFileSync('~dev/learnings.json', JSON.stringify(learnings, null, 2))

        let courses = await getCourses(notion, learnings)
        fs.writeFileSync('~dev/courses.json', JSON.stringify(courses, null, 2))

        let meanByCourse = getMeanByCourse(courses, students)
        fs.writeFileSync('~dev/meanByCourse.json', JSON.stringify(meanByCourse, null, 2))
    } catch (error) {
        console.error(error)
    }
}

getAllAndPopulate()
