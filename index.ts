import { getCourses, getMeanByCourse } from "./src/models/courses";
import { getLearnings, populateWithProofs } from "./src/models/learnings"
import { getProofs } from "./src/models/proofs";
import { getStudents } from "./src/models/students"
import { Client } from "@notionhq/client"
import express from 'express';
import cors from 'cors';

import * as fs from 'fs';
import { json } from "stream/consumers";

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

        return { meanByCourse }
    } catch (error) {
        console.error(error)
    }
}

const app = express();
app.use(express.json());
app.use(cors());

app.get('/meanByCourse', async (req, res) => {
    console.log('GET /meanByCourse')
    let meanByCourse = await getAllAndPopulate()
    res.type('json')
    if (meanByCourse) {
        res.status(200).send(JSON.stringify(meanByCourse, null, 2))
    } else {
        res.status(500).json({ error: 'Something failed!' })
    }
    console.log('GET /meanByCourse done')
})

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
