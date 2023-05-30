import { Client } from "@notionhq/client";
import { Users } from "./users";
import * as fs from 'fs';
import { Learning } from "./learnings";

export interface Proof {
    _id?: string;
    id: string;
    learningID: string;
    learnings: Learning[];
    students: Users[];
    validatedBy: string;
    firstChat: string;
}

export async function getProofs(notion: Client, students: Users[]): Promise<Proof[]> {
    if (process.env.NOTION_DATABASE_ID_PROOFS === undefined) {
        throw new Error("NOTION_DATABASE_ID_PROOFS is undefined");
    }
    let cursor = undefined;
    let resultsAll: any[] = [];
    while (true) {
        const { results, next_cursor } = await notion.databases.query({
            database_id: process.env.NOTION_DATABASE_ID_PROOFS,
            start_cursor: cursor,
        });
        resultsAll = resultsAll.concat(results);
        if (!next_cursor) {
            break;
        }
        cursor = next_cursor;
    }
    fs.writeFileSync('~dev/rawProofs.json', JSON.stringify(resultsAll, null, 2));

    let proofs: Proof[] = [];
    resultsAll.forEach((result: any) => {
        let studentsList: Users[] = [];
        if (result.properties["👤 Élèves concernés"].relation.length > 0) {
            studentsList = result.properties["👤 Élèves concernés"].relation.map((relation: any) => {
                return students.find((student: Users) => {
                    return student.id === relation.id.replace(/-/g, "");
                });
            });
        }
        let validatedBy = "";
        if (result.properties["Évalué par"].people.length > 0) {
            validatedBy = result.properties["Évalué par"].people[0].id.replace(/-/g, "");
        }

        let firstChat = "";
        if (result.properties.Info.rich_text.length > 0) {
            result.properties.Info.rich_text.forEach((text: any) => {
                firstChat += text.text.content;
            });
        }

        let proof: Proof = {
            id: result.id.replace(/-/g, ""),
            learningID: result.properties["🎓 Compétence"].relation[0].id.replace(/-/g, ""),
            students: studentsList,
            learnings: [],
            validatedBy: validatedBy,
            firstChat: firstChat
        };
        proofs.push(proof);
    });
    return proofs;
}