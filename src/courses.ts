import { Client } from "@notionhq/client"
import { Learning } from "./learnings"
import * as fs from 'fs';

export interface Course {
    id: string
    name: string
    learnings: Learning[]
}

export async function getCourses(notion: Client, learnings: Learning[]): Promise<Course[]> {
    if (process.env.NOTION_DATABASE_ID_COURSES === undefined) {
        throw new Error("NOTION_DATABASE_ID_COURSES is undefined")
    }
    const coursesResults = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID_COURSES,
    })
    fs.writeFileSync('rawCourses.json', JSON.stringify(coursesResults, null, 2))
    let courses: Course[] = []
    coursesResults.results.forEach((result: any) => {
        let name = ""
        if (result.properties.Name.title.length > 0) {
            name = result.properties.Name.title[0].text.content
        }
        let learningsList: Learning[] = []
        if (result.properties["🎓 Compétences"].relation.length > 0) {
            learningsList = result.properties["🎓 Compétences"].relation.map((relation: any) => {
                return learnings.find((learning: Learning) => {
                    return learning.id === relation.id.replace(/-/g, "")
                })
            })
        }
        let course: Course = {
            id: result.id.replace(/-/g, ""),
            name: name.trim(),
            learnings: learningsList
        }
        courses.push(course)
    })
    return courses
}
