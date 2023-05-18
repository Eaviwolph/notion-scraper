import { Client } from "@notionhq/client";
import { Course } from "./courses";
import * as fs from "fs";

export interface Student {
    _id?: string;
    id: string;
    name: string;
    isStudent: boolean;
}

export async function getStudents(notion: Client): Promise<Student[]> {
    if (process.env.NOTION_DATABASE_ID_STUDENTS === undefined) {
        throw new Error("NOTION_DATABASE_ID_STUDENTS is undefined");
    }
    const results = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID_STUDENTS,
    });
    fs.writeFileSync("~dev/rawStudents.json", JSON.stringify(results.results, null, 2));
    let students: Student[] = [];
    results.results.forEach((result: any) => {
        let name = "";
        if (result.properties.Name.title.length > 0) {
            name = result.properties.Name.title[0].text.content;
        }
        let student: Student = {
            id: result.id.replace(/-/g, ""),
            name: name,
            isStudent: result.properties.Triade.select !== null,
        };
        students.push(student);
    });
    return students;
}
