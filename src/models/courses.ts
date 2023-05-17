import { Client } from "@notionhq/client"
import { Learning } from "./learnings"
import * as fs from 'fs';
import { Student } from "./students";

export interface Course {
    id: string
    name: string
    semester: string,
    learnings: Learning[]
}

export async function getCourses(notion: Client, learnings: Learning[]): Promise<Course[]> {
    if (process.env.NOTION_DATABASE_ID_COURSES === undefined) {
        throw new Error("NOTION_DATABASE_ID_COURSES is undefined")
    }
    const coursesResults = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID_COURSES,
    })
    fs.writeFileSync('~dev/rawCourses.json', JSON.stringify(coursesResults, null, 2))
    let courses: Course[] = []
    coursesResults.results.forEach((result: any) => {
        let name = ""
        if (result.properties.Name.title.length > 0) {
            name = result.properties.Name.title[0].text.content
        }
        let semester = ""
        if (result.properties.Semestre.select) {
            semester = result.properties.Semestre.select.name
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
            semester: semester,
            learnings: learningsList
        }
        courses.push(course)
    })
    return courses
}

export function getMeanByCourse(courses: Course[], students: Student[]) {
    let meanByCourse: any = {}
    courses.forEach((course: Course) => {
        if (course.semester !== "S8") {
            return
        }
        meanByCourse[course.name] = {}
        students.forEach((student: Student) => {
            let mean = 0
            let count = 0
            course.learnings.forEach((learning: Learning) => {
                if (learning.critical) {
                    if (learning.studentsValidating.find((s: Student) => s.id === student.id)) {
                        mean += 1
                    }
                    count += 1
                }
            })
            if (course.name === "Projets d’entreprise") {
                meanByCourse[course.name][student.name] = Math.round((mean / 10 * 20) * 100) / 100
            }
            else {
                meanByCourse[course.name][student.name] = Math.round((mean / count * 20) * 100) / 100
            }
        })
    })
    return meanByCourse
}
