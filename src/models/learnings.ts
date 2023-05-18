import { Client } from "@notionhq/client";
import { Student } from "./students";
import * as fs from 'fs';
import { Proof } from "./proofs";

export interface Learning {
    _id?: string;
    id: string;
    name: string;
    critical: boolean;
    description: string;
    example: string;
    studentsValidating: Student[];
    proofsIds: string[];
}

export async function getLearnings(notion: Client): Promise<Learning[]> {
    if (process.env.NOTION_DATABASE_ID_LEARNINGS === undefined) {
        throw new Error("NOTION_DATABASE_ID_LEARNINGS is undefined");
    }
    const learningsResults = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID_LEARNINGS,
    });
    fs.writeFileSync('~dev/rawLearnings.json', JSON.stringify(learningsResults, null, 2));
    let learnings: Learning[] = [];
    learningsResults.results.forEach((result: any) => {
        let example = "";
        if (result.properties.Exemple.rich_text.length > 0) {
            example = result.properties.Exemple.rich_text[0].text.content;
        }
        let critical = false;
        if (result.properties["Criticité"].select) {
            critical = result.properties["Criticité"].select.name === "Oui";
        }
        let description = "";
        if (result.properties.Description.rich_text.length > 0) {
            description = result.properties.Description.rich_text[0].text.content;
        }
        let name = "";
        if (result.properties.Name.title.length > 0) {
            name = result.properties.Name.title[0].text.content;
        }

        let proofsIds: string[] = [];
        if (result.properties["🖌️ Preuves"].relation.length > 0) {
            proofsIds = result.properties["🖌️ Preuves"].relation.map((relation: any) => {
                return relation.id.replace(/-/g, "");
            });
        }

        let learning: Learning = {
            id: result.id.replace(/-/g, ""),
            name: name.trim(),
            critical: critical,
            description: description.trim(),
            example: example.trim(),
            studentsValidating: [],
            proofsIds: proofsIds
        };
        learnings.push(learning);
    });
    return learnings;
}

export function populateWithProofs(learnings: Learning[], proofs: Proof[]) {
    for (let i = 0; i < learnings.length; i++) {
        learnings[i].studentsValidating = [];
        for (let j = 0; j < proofs.length; j++) {
            if (proofs[j].learningID === learnings[i].id) {
                for (let k = 0; k < proofs[j].students.length; k++) {
                    if (!learnings[i].studentsValidating.find((s: Student) => s.id === proofs[j].students[k].id)) {
                        learnings[i].studentsValidating.push(proofs[j].students[k]);
                    }
                }
                proofs[j].learnings.push(learnings[i]);
            }
        }
    }
}