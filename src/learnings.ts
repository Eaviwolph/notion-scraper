import { Client } from "@notionhq/client"
import { Student } from "./students"
import * as fs from 'fs';

export interface Learning {
    id: string
    name: string
    critical: boolean
    description: string
    example: string
    studentsValidating: Student[]
}

export async function getLearnings(notion: Client, students: Student[]): Promise<Learning[]> {
    if (process.env.NOTION_DATABASE_ID_LEARNINGS === undefined) {
        throw new Error("NOTION_DATABASE_ID_LEARNINGS is undefined")
    }
    const learningsResults = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID_LEARNINGS,
    })
    fs.writeFileSync('rawLearnings.json', JSON.stringify(learningsResults, null, 2))
    let learnings: Learning[] = []
    learningsResults.results.forEach((result: any) => {
        let example = ""
        if (result.properties.Exemple.rich_text.length > 0) {
            example = result.properties.Exemple.rich_text[0].text.content
        }
        let critical = false
        if (result.properties["Criticité"].select) {
            critical = result.properties["Criticité"].select.name === "Oui"
        }
        let description = ""
        if (result.properties.Description.rich_text.length > 0) {
            description = result.properties.Description.rich_text[0].text.content
        }
        let name = ""
        if (result.properties.Name.title.length > 0) {
            name = result.properties.Name.title[0].text.content
        }
        let studentsList: Student[] = []
        if (result.properties["Élèves"].rollup.array.length > 0) {
            studentsList = result.properties["Élèves"].rollup.array.map((obj: any) => {
                return obj.relation.map((relation: any) => {
                    return students.find((student: Student) => {
                        return student.id === relation.id.replace(/-/g, "")
                    })
                })
            }).flat()
        }
        let learning: Learning = {
            id: result.id.replace(/-/g, ""),
            name: name.trim(),
            critical: critical,
            description: description.trim(),
            example: example.trim(),
            studentsValidating: studentsList
        }
        learnings.push(learning)
    })
    return learnings
}
