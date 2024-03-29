import { Course } from "../models/courses";
import { Learning } from "../models/learnings";
import { Users } from "../models/users";
import { SemesterAnalytics } from "./semestre";
import { UeAnalytics } from "./ue";

export type StudentAnalytics = {
    notionId?: string;
    name: string;
    semester: SemesterAnalytics[];
    mean: number;
}

export type ClassAnalytics = {
    students: {
        name: string,
        mean: number,
        semester: {
            name: string,
            mean: number,
            ue: {
                name: string,
                mean: number,
                courses: {
                    name: string,
                    mean: number
                }[]
            }[]
        }[]
    }[],
    mean: number,
    median: number,
    standardDeviation: number
}

export function populateAnalytics(courses: Course[], studentsUsers: Users[]): StudentAnalytics[] {
    let students: StudentAnalytics[] = [];
    for (let i = 0; i < studentsUsers.length; i++) {
        students.push({
            notionId: studentsUsers[i].id,
            name: studentsUsers[i].name,
            semester: [{
                name: "S8",
                coefficient: 0,
                mean: 0,
                ue: []
            },
            {
                name: "S9",
                coefficient: 0,
                mean: 0,
                ue: []
            }
            ],
            mean: 0
        });
    }

    for (let i = 0; i < studentsUsers.length; i++) {
        for (let j = 0; j < courses.length; j++) {
            if (courses[j].ue === "" || courses[j].ue.startsWith("[SG8]") || courses[j].name === "Conferences Technologiques" || courses[j].name === "Droits de propriétés intellectuelles") {
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

            let semesterIndex = students[i].semester.findIndex((semester: SemesterAnalytics) => semester.name === courses[j].semester);
            let ueIndex = students[i].semester[semesterIndex].ue.findIndex((ue: UeAnalytics) => ue.name === courses[j].ue);
            if (ueIndex === -1) {
                students[i].semester[semesterIndex].ue.push({
                    name: courses[j].ue,
                    mean: 0,
                    coefficient: 0,
                    courses: []
                });
                ueIndex = students[i].semester[semesterIndex].ue.length - 1;
            }

            if (courses[j].name === "Projets d'entreprise") {
                total = 12;
                points = Math.min(points, total);
            } else if (courses[j].name === "Projets d'entreprise 2") {
                total = 15;
                points = Math.min(points, total);
            }

            if (total === 0) {
                total = 1;
            }
            students[i].semester[semesterIndex].ue[ueIndex].courses.push({
                name: courses[j].name,
                points: points / total * 20,
                coefficient: courses[j].coefficient,
                learnings: criticalLearnings
            });
        }
    }

    for (let i = 0; i < students.length; i++) {
        let S8Index = students[i].semester.findIndex((semester: SemesterAnalytics) => semester.name === "S8");
        // Weird move for PFE
        let MCE8Index = students[i].semester[S8Index].ue.findIndex((ue: UeAnalytics) => ue.name.startsWith("[MCE8]"));
        let ITCS8Index = students[i].semester[S8Index].ue.findIndex((ue: UeAnalytics) => ue.name.startsWith("[ITCS8]"));
        let MAIN8Index = students[i].semester[S8Index].ue.findIndex((ue: UeAnalytics) => ue.name.startsWith("[MAIN8]"));
        let BECO8Index = students[i].semester[S8Index].ue.findIndex((ue: UeAnalytics) => ue.name.startsWith("[BECO8]"));

        let MethodologieId = students[i].semester[S8Index].ue[MAIN8Index].courses.findIndex((course: { name: string; }) => course.name === "Méthodologie");
        let SocioId = students[i].semester[S8Index].ue[MAIN8Index].courses.findIndex((course: { name: string; }) => course.name === "Sociologie des organisations");
        let ChiffrId = students[i].semester[S8Index].ue[ITCS8Index].courses.findIndex((course: { name: string; }) => course.name === "Chiffrage de projet");
        let PEId = students[i].semester[S8Index].ue[BECO8Index].courses.findIndex((course: { name: string; }) => course.name === "Projets d'entreprise");

        let PFEId = students[i].semester[S8Index].ue[MCE8Index].courses.findIndex((course: { name: string; }) => course.name === "PFE");
        students[i].semester[S8Index].ue[MCE8Index].courses[PFEId].points =
            (students[i].semester[S8Index].ue[MAIN8Index].courses[MethodologieId].points
                + students[i].semester[S8Index].ue[MAIN8Index].courses[SocioId].points
                + students[i].semester[S8Index].ue[BECO8Index].courses[PEId].points
                + students[i].semester[S8Index].ue[ITCS8Index].courses[ChiffrId].points) / 4;
        // End of weird move

        // Weird move for MOOC : Devenir créatif et innovant
        let UXId = students[i].semester[S8Index].ue[MAIN8Index].courses.findIndex((course: { name: string; }) => course.name === "UX Design");
        let MDLId = students[i].semester[S8Index].ue[MAIN8Index].courses.findIndex((course: { name: string; }) => course.name === "Management de l'innovation");

        let MOOCId = students[i].semester[S8Index].ue[MCE8Index].courses.findIndex((course: { name: string; }) => course.name === "MOOC : Devenir créatif et innovant");
        students[i].semester[S8Index].ue[MCE8Index].courses[MOOCId].points =
            (students[i].semester[S8Index].ue[MAIN8Index].courses[UXId].points
                + students[i].semester[S8Index].ue[MAIN8Index].courses[MDLId].points) / 2;
        // End of weird move

        let studentPoints = 0;
        let studentTotal = 0;
        for (let s = 0; s < students[i].semester.length; s++) {
            let semesterPoints = 0;
            let semesterTotal = 0;
            for (let j = 0; j < students[i].semester[s].ue.length; j++) {
                let points = 0;
                let total = 0;
                let coefficient = 0;
                for (let k = 0; k < students[i].semester[s].ue[j].courses.length; k++) {
                    points += students[i].semester[s].ue[j].courses[k].points * students[i].semester[s].ue[j].courses[k].coefficient;
                    total += 20 * students[i].semester[s].ue[j].courses[k].coefficient;
                    coefficient += students[i].semester[s].ue[j].courses[k].coefficient;
                }
                if (total === 0) {
                    total = 1;
                }
                students[i].semester[s].ue[j].mean = points / total * 20;
                students[i].semester[s].ue[j].coefficient = coefficient;

                if (!students[i].semester[s].ue[j].name.startsWith("[MCE8]")) {
                    studentPoints += (points / total * 20) * coefficient;
                    studentTotal += 20 * coefficient;

                    semesterPoints += (points / total * 20) * coefficient;
                    semesterTotal += 20 * coefficient;
                }
            }
            if (semesterTotal === 0) {
                semesterTotal = 1;
            }
            students[i].semester[s].mean = semesterPoints / semesterTotal * 20;
        }
        if (studentTotal === 0) {
            studentTotal = 1;
        }
        students[i].mean = studentPoints / studentTotal * 20;
    }

    return students;
}

export function getMean(students: StudentAnalytics[], withUE: boolean, withCourse: boolean): string {
    students.sort((a: StudentAnalytics, b: StudentAnalytics) => { return b.mean - a.mean; });
    let s = "";

    for (let i = 0; i < students.length; i++) {
        s += students[i].name + ": " + students[i].mean + "\n";
        for (let j = 0; j < students[i].semester.length; j++) {
            s += "\t" + students[i].semester[j].name + ": " + students[i].semester[j].mean + "\n";
            if (withUE) {
                for (let k = 0; k < students[i].semester[j].ue.length; k++) {
                    s += "\t\t" + students[i].semester[j].ue[k].name + ": " + students[i].semester[j].ue[k].mean + "\n";
                    if (withCourse) {
                        for (let l = 0; l < students[i].semester[j].ue[k].courses.length; l++) {
                            s += "\t\t\t" + students[i].semester[j].ue[k].courses[l].name + ": " + students[i].semester[j].ue[k].courses[l].points + "\n";
                        }
                    }
                }
            }
        }
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

export function getClassAnalytics(students: StudentAnalytics[]): ClassAnalytics {
    let mean = getClassMean(students);
    let median = getClassMedian(students);
    let standardDeviation = getStandardDeviation(students);

    return {
        students: students.map((student: StudentAnalytics) => {
            return {
                name: student.name,
                mean: student.mean,
                semester: student.semester.map((semester: SemesterAnalytics) => {
                    return {
                        name: semester.name,
                        mean: semester.mean,
                        ue: semester.ue.map((ue: UeAnalytics) => {
                            return {
                                name: ue.name,
                                mean: ue.mean,
                                courses: ue.courses.map((course: { name: string; points: number; }) => {
                                    return {
                                        name: course.name,
                                        mean: course.points
                                    };
                                }),
                            };
                        }),
                    };
                }),
            };
        }),
        mean,
        median,
        standardDeviation
    };
}