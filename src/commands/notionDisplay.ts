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

async function addSemesterTable(notion: Client, notionId: string, student: StudentAnalytics): Promise<AppendBlockChildrenResponse> {
    let children: BlockObjectRequestWithoutChildren[] = [];

    var response: AppendBlockChildrenParameters = {
        block_id: notionId,
        children: [
            {
                type: "table",
                object: "block",
                table: {
                    table_width: student.semester.length + 2,
                    has_column_header: true,
                    has_row_header: true,
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
        type: "table_row",
        table_row: {
            cells: []
        }
    });
    response.children[0]["table"].children.push({
        type: "table_row",
        table_row: {
            cells: []
        }
    });

    if (response.children[0].table.children[0].type != "table_row") {
        throw new Error("Not a table row");
    }
    response.children[0].table.children[0].table_row.cells.push([{
        text: {
            content: "Semestre",
        }
    }
    ]);
    if (response.children[0].table.children[1].type != "table_row") {
        throw new Error("Not a table row");
    }
    response.children[0].table.children[1].table_row.cells.push([{
        text: {
            content: "Moyenne",
        }
    }
    ]);

    // Add name
    for (var i = 0; i < student.semester.length; i++) {
        response.children[0].table.children[0].table_row.cells.push([{
            text: {
                content: student.semester[i].name,
            }
        }
        ]);

        response.children[0].table.children[1].table_row.cells.push([{
            text: {
                content: (Math.round(student.semester[i].mean * 100) / 100).toString(),
            }
        }
        ]);
    }

    response.children[0].table.children[0].table_row.cells.push([{
        text: {
            content: "Last update",
        }
    }]);

    response.children[0].table.children[1].table_row.cells.push([{
        text: {
            // Date format 24/12/2020 12:00:00
            content: new Date().toLocaleDateString("fr") + " " + new Date().toLocaleTimeString("fr"),
        }
    }]);

    return await notion.blocks.children.append(response);
}

async function addUesCoursesTable(notion: Client, notionId: string, student: StudentAnalytics): Promise<AppendBlockChildrenResponse> {
    let children: BlockObjectRequestWithoutChildren[] = [];

    var response: AppendBlockChildrenParameters = {
        block_id: notionId,
        children: [
            {
                type: "table",
                object: "block",
                table: {
                    table_width: student.semester.map(semester => semester.ue.length).reduce((a, b) => a + b, 0) + 1,
                    has_column_header: true,
                    has_row_header: true,
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
        type: "table_row",
        table_row: {
            cells: []
        }
    });
    response.children[0]["table"].children.push({
        type: "table_row",
        table_row: {
            cells: []
        }
    });
    response.children[0]["table"].children.push({
        type: "table_row",
        table_row: {
            cells: []
        }
    });

    if (response.children[0].table.children[0].type != "table_row") {
        throw new Error("Not a table row");
    }
    response.children[0].table.children[0].table_row.cells.push([{
        text: {
            content: "UE",
        }
    }]);
    if (response.children[0].table.children[1].type != "table_row") {
        throw new Error("Not a table row");
    }
    response.children[0].table.children[1].table_row.cells.push([{
        text: {
            content: "Moyenne UE",
        }
    }]);
    if (response.children[0].table.children[2].type != "table_row") {
        throw new Error("Not a table row");
    }
    response.children[0].table.children[2].table_row.cells.push([{
        text: {
            content: "Moyenne Cours",
        }
    }]);

    // Add name
    for (var i = 0; i < student.semester.length; i++) {
        for (var j = 0; j < student.semester[i].ue.length; j++) {
            response.children[0].table.children[0].table_row.cells.push([{
                text: {
                    content: student.semester[i].ue[j].name,
                }
            }]);

            response.children[0].table.children[1].table_row.cells.push([{
                text: {
                    content: (Math.round(student.semester[i].ue[j].mean * 100) / 100).toString(),
                }
            }]);

            response.children[0].table.children[2].table_row.cells.push([{
                text: {
                    content: student.semester[i].ue[j].courses.map(course => {
                        return "- " + course.name + ": " + Math.round(course.points * 100) / 100;
                    }).join("\n\n"),
                }
            }]);
        }
    }

    return await notion.blocks.children.append(response);
}

async function removeTabs(notion: Client, notionId: string) {
    let studentPage = await getStudentPage(notion, notionId);
    let blocks = studentPage.results;

    // First trim the empty blocks at the end
    for (let i = blocks.length - 1; i >= 0; i--) {
        let block = blocks[i] as BlockObjectResponse;
        if (block.type == "paragraph" && block.paragraph.rich_text.length == 0) {
            await notion.blocks.delete({
                block_id: block.id
            });
            blocks.splice(i, 1);
        } else {
            break;
        }
    }

    for (let i = 0; i < blocks.length; i++) {
        let lastBlock = blocks[i] as BlockObjectResponse;
        if (lastBlock.type == "table") {
            await notion.blocks.delete({
                block_id: lastBlock.id
            });
        }
    }
}

async function removeAndAddTable(notion: Client, notionId: string, student: StudentAnalytics) {
    console.log(student.name);
    // Remove last table
    await removeTabs(notion, notionId);
    // Add table
    await addSemesterTable(notion, notionId, student);
    await addUesCoursesTable(notion, notionId, student);
    console.log(student.name + " done");
}

export async function notionDisplay(notion: Client) {
    let { students, teachers, proofs, learnings, courses, competences } = await getAll(notion);
    let studentsAnalytics = populateAnalytics(courses, students);

    let promises: Promise<any>[] = [];
    for (let i = 0; i < studentsAnalytics.length; i++) {
        let student = studentsAnalytics[i];
        let notionId = student.notionId;
        if (notionId == null) {
            continue;
        }

        promises.push(removeAndAddTable(notion, notionId, student));
    }

    await Promise.all(promises);
    console.log("Done");
}