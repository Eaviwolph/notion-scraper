import { Client } from "@notionhq/client"
import { Student } from "./students"
import * as fs from 'fs';

export interface Proof {
    id: string
    learningID: string
    students: Student[]
}

export async function getProofs(notion: Client, students: Student[]): Promise<Proof[]> {
    if (process.env.NOTION_DATABASE_ID_PROOFS === undefined) {
        throw new Error("NOTION_DATABASE_ID_PROOFS is undefined")
    }
    const results = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID_PROOFS,
    })
    fs.writeFileSync('~dev/rawProofs.json', JSON.stringify(results, null, 2))
    let proofs: Proof[] = []
    results.results.forEach((result: any) => {
        let studentsList: Student[] = []
        if (result.properties["👤 Élèves concernés"].relation.length > 0) {
            studentsList = result.properties["👤 Élèves concernés"].relation.map((relation: any) => {
                return students.find((student: Student) => {
                    return student.id === relation.id.replace(/-/g, "")
                })
            })
        }

        let proof: Proof = {
            id: result.id.replace(/-/g, ""),
            learningID: result.properties["🎓 Compétence"].relation[0].id.replace(/-/g, ""),
            students: studentsList
        }
        proofs.push(proof)
    })
    return proofs
}