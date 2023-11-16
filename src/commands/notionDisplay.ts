import { Client } from "@notionhq/client";
import { getAll } from "./getAll";
import { StudentAnalytics, populateAnalytics } from "../analytics/students";
import { AppendBlockChildrenParameters, AppendBlockChildrenResponse, BlockObjectRequest, BlockObjectRequestWithoutChildren, BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";

async function getStudentPage(notion: Client, notionID: string) {
    let response = await notion.blocks.children.list({
        block_id: notionID,
        page_size: 50
    });
    return response;
}

async function addTable(notion: Client, notionId: string, student: StudentAnalytics): Promise<AppendBlockChildrenResponse> {
    let children: BlockObjectRequestWithoutChildren[] = [];

    var response: AppendBlockChildrenParameters = {
        block_id: notionId,
        children: [
            {
                object: "block",
                table: {
                    table_width: student.semester.length,
                    has_column_header: true,
                    children: children,
                }
            }
        ]
    };

    if (response.children[0].type != "table") {
        throw new Error("Not a table");
    }

    // One row for the name and one for the note
    response.children[0]["table"].children.push({
        table_row: {
            cells: []
        }
    });
    response.children[0]["table"].children.push({
        table_row: {
            cells: []
        }
    });

    // Add name
    for (var i = 0; i < student.semester.length; i++) {
        if (response.children[0].table.children[0].type != "table_row") {
            throw new Error("Not a table row");
        }
        if (response.children[0].table.children[1].type != "table_row") {
            throw new Error("Not a table row");
        }
        response.children[0].table.children[0].table_row.cells.push([{
            text: {
                content: student.semester[i].name,
            }
        }
        ]);

        response.children[0].table.children[1].table_row.cells.push([{
            text: {
                content: student.semester[i].mean.toString(),
            }
        }
        ]);
    }

    return await notion.blocks.children.append(response);
}

export async function notionDisplay(notion: Client) {
    let { students, teachers, proofs, learnings, courses, competences } = await getAll(notion);
    let studentsAnalytics = populateAnalytics(courses, students);


    for (let i = 0; i < studentsAnalytics.length; i++) {
        // Skip if not Quentin Escudier /!\
        if (studentsAnalytics[i].name != "Quentin Escudier") {
            continue;
        }

        console.log(studentsAnalytics[i].name);
        let student = studentsAnalytics[i];
        let notionID = student.notionId;
        if (notionID == null) {
            continue;
        }

        let studentPage = await getStudentPage(notion, notionID);
        let blocks = studentPage.results;

        // check if last block is table
        let lastBlock = blocks[blocks.length - 1] as BlockObjectResponse;
        console.log(lastBlock);
        if (lastBlock.type == "table") {
            console.log("Table already exists");
        }

        // Add table
        let response = await addTable(notion, notionID, student);
        console.log(response);
        break;
    }
}