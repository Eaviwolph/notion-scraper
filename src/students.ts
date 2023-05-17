import { Client } from "@notionhq/client"

export interface Student {
    id: string
    name: string
}


export async function getStudents(notion: Client): Promise<Student[]> {
    if (process.env.NOTION_DATABASE_ID_STUDENTS === undefined) {
        throw new Error("NOTION_DATABASE_ID_STUDENTS is undefined")
    }
    const results = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID_STUDENTS,
    })
    let students: Student[] = []
    results.results.forEach((result: any) => {
        let name = ""
        if (result.properties.Name.title.length > 0) {
            name = result.properties.Name.title[0].text.content
        }
        let student: Student = {
            id: result.id.replace(/-/g, ""),
            name: name,
        }
        students.push(student)
    })
    return students
}
