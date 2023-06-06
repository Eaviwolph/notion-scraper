import { Course } from "../models/courses";
import { Learning } from "../models/learnings";
import { Users } from "../models/users";
import { UeAnalytics } from "./ue";

export type StudentAnalytics = {
    name: string;
    ue: UeAnalytics[];
    mean: number;
}

export function populateAnalytics(courses: Course[], studentsUsers: Users[]): StudentAnalytics[] {
    let students: StudentAnalytics[] = [];
    for (let i = 0; i < studentsUsers.length; i++) {
        students.push({
            name: studentsUsers[i].name,
            ue: [],
            mean: 0
        });
    }

    for (let i = 0; i < studentsUsers.length; i++) {
        for (let j = 0; j < courses.length; j++) {
            if (courses[j].ue === "" || courses[j].semester !== "S8" || courses[j].ue.startsWith("[MCE8]") || courses[j].ue.startsWith("[SG8]")) {
                continue;
            }

            let criticalLearnings = courses[j].learnings.filter((learning: Learning) => learning.critical);

            let points = 0;
            let total = criticalLearnings.length;
            for (let k = 0; k < criticalLearnings.length; k++) {
                if (criticalLearnings[k].studentsValidating.find((s: Users) => s.id === studentsUsers[i].id)) {
                    points++;
                }
            }

            let ueIndex = students[i].ue.findIndex((ue: UeAnalytics) => ue.name === courses[j].ue);
            if (ueIndex === -1) {
                students[i].ue.push({
                    name: courses[j].ue,
                    mean: 0,
                    coefficient: 0,
                    ue: [],
                    courses: []
                });
                ueIndex = students[i].ue.length - 1;
            }

            if (courses[j].name === "Projets d'entreprise") {
                total = 12;
                points = Math.min(points, total);
            }

            if (total === 0) {
                total = 1;
            }
            students[i].ue[ueIndex].courses.push({
                name: courses[j].name,
                points: points / total * 20,
                coefficient: courses[j].coefficient,
                learnings: criticalLearnings
            });
        }
    }

    for (let i = 0; i < students.length; i++) {
        let studentPoints = 0;
        let studentTotal = 0;
        for (let j = 0; j < students[i].ue.length; j++) {
            let points = 0;
            let total = 0;
            let coefficient = 0;
            for (let k = 0; k < students[i].ue[j].courses.length; k++) {
                points += students[i].ue[j].courses[k].points * students[i].ue[j].courses[k].coefficient;
                total += 20 * students[i].ue[j].courses[k].coefficient;
                coefficient += students[i].ue[j].courses[k].coefficient;
            }
            if (total === 0) {
                total = 1;
            }
            students[i].ue[j].mean = points / total;
            students[i].ue[j].coefficient = coefficient;

            studentPoints += (points / total * 20) * coefficient;
            studentTotal += 20 * coefficient;
        }
        if (studentTotal === 0) {
            studentTotal = 1;
        }
        students[i].mean = studentPoints / studentTotal * 20;
    }

    return students;
}

export function getMean(students: StudentAnalytics[]): string {
    students.sort((a: StudentAnalytics, b: StudentAnalytics) => { return b.mean - a.mean; });
    let s = "";
    for (let i = 0; i < students.length; i++) {
        s += students[i].name + ": " + students[i].mean + "\n";
    }
    return s;
}

export function getClassMean(students: StudentAnalytics[]): number {
    let mean = 0;
    for (let i = 0; i < students.length; i++) {
        mean += students[i].mean;
    }
    return mean / students.length;
}

export function getClassMedian(students: StudentAnalytics[]): number {
    students.sort((a: StudentAnalytics, b: StudentAnalytics) => { return b.mean - a.mean; });
    return students[Math.floor(students.length / 2)].mean;
}

export function getStandardDeviation(students: StudentAnalytics[]): number {
    let mean = getClassMean(students);
    let sum = 0;
    for (let i = 0; i < students.length; i++) {
        sum += Math.pow(students[i].mean - mean, 2);
    }
    return Math.sqrt(sum / students.length);
}