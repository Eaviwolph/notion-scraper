import { getLearnings } from "./src/learnings"
import { getStudents } from "./src/students"
import { Client } from "@notionhq/client"
import * as fs from 'fs';

require('dotenv').config()

const notion = new Client({ auth: process.env.NOTION_KEY })

async function getAllAndPopulate() {
    try {
        let students = await getStudents(notion)
        fs.writeFileSync('students.json', JSON.stringify(students, null, 2))
        let learnings = await getLearnings(notion, students)
        fs.writeFileSync('learnings.json', JSON.stringify(learnings, null, 2))
    } catch (error) {
        console.error(error)
    }
}

getAllAndPopulate()
