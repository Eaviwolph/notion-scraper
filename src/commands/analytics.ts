import { getClassMean, getClassMedian, getMean, getStandardDeviation, populateAnalytics } from "../analytics/students";
import { getAll } from "./getAll";
import { Client } from "@notionhq/client";
import * as fs from 'fs';

async function analytics(notion: Client) {
    let { students, teachers, proofs, learnings, courses, competences } = await getAll(notion);
    let studentsAnalytics = populateAnalytics(courses, students);
    fs.writeFileSync('~dev/studentsAnalytics.json', getMean(studentsAnalytics, false, false));
    console.log("Class mean: " + getClassMean(studentsAnalytics));
    console.log("Class median: " + getClassMedian(studentsAnalytics));
    console.log("Standard deviation: " + getStandardDeviation(studentsAnalytics));
}
