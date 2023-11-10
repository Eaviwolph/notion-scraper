import { Client } from "@notionhq/client";
import { getAll } from "./getAll";
import { populateAnalytics } from "../analytics/students";

export async function notionDisplay(notion: Client) {
    let { students, teachers, proofs, learnings, courses, competences } = await getAll(notion);
    let studentsAnalytics = populateAnalytics(courses, students);

    // Here Kevin
}