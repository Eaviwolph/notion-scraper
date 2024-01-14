import { Client } from "@notionhq/client";
import { Learning } from "./learnings";
import * as fs from 'fs';
import { Users } from "./users";

export interface Course {
    _id?: string;
    id: string;
    icon: string;
    name: string;
    semester: string,
    learnings: Learning[];
    teacherNames: String[];
    ue: string;
    coefficient: number;
}

export async function getCourses(notion: Client, learnings: Learning[]): Promise<Course[]> {
    if (process.env.NOTION_DATABASE_ID_COURSES === undefined) {
        throw new Error("NOTION_DATABASE_ID_COURSES is undefined");
    }
    const coursesResults = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID_COURSES,
    });
    fs.writeFileSync('~dev/rawCourses.json', JSON.stringify(coursesResults, null, 2));
    let courses: Course[] = [];
    coursesResults.results.forEach((result: any) => {
        let name = "";
        if (result.properties.Name.title.length > 0) {
            name = result.properties.Name.title[0].text.content;
        }

        let icon = "";
        if (result.icon && result.icon.type === "emoji") {
            icon = result.icon.emoji;
        }

        let semester = "";
        if (result.properties.Semestre.select) {
            semester = result.properties.Semestre.select.name;
            if (semester === "S8 TC") {
                semester = "S8";
            }
            if (semester === "S9 TC") {
                semester = "S9";
            }
        }

        let learningsList: Learning[] = [];
        if (result.properties["🎓 Compétences"].relation.length > 0) {
            learningsList = result.properties["🎓 Compétences"].relation.map((relation: any) => {
                return learnings.find((learning: Learning) => {
                    return learning.id === relation.id.replace(/-/g, "");
                });
            });
        }

        let teacherNames: String[] = [];
        if (result.properties["Enseignant"].multi_select.length > 0) {
            teacherNames = result.properties["Enseignant"].multi_select.map((teacher: any) => {
                let noAccents = teacher.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                let firstName = noAccents.split(" ")[0];
                let lastName = noAccents.split(" ")[1].toLowerCase();
                lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
                return firstName + " " + lastName;
            });
        }

        let ue = "";
        if (result.properties.UE.select) {
            ue = result.properties.UE.select.name;
        }

        let coefficient = 0;
        if (result.properties.Coef.number) {
            coefficient = result.properties.Coef.number;
        }

        let course: Course = {
            id: result.id.replace(/-/g, ""),
            name: name.trim().replace("’", "'"),
            icon: icon,
            semester: semester,
            learnings: learningsList,
            teacherNames: teacherNames,
            ue: ue,
            coefficient: coefficient
        };
        courses.push(course);
    });
    return courses;
}

export function getMeanByCourse(courses: Course[], students: Users[]) {
    let meanByCourse: any = {};
    courses.forEach((course: Course) => {
        meanByCourse[course.name] = {};
        students.forEach((student: Users) => {
            let mean = 0;
            let count = 0;
            course.learnings.forEach((learning: Learning) => {
                if (learning.critical) {
                    if (learning.studentsValidating.find((s: Users) => s.id === student.id)) {
                        mean += 1;
                    }
                    count += 1;
                }
            });
            if (course.name === "Projets d’entreprise") {
                meanByCourse[course.name][student.name] = Math.round((mean / 10 * 20) * 100) / 100;
            }
            else {
                meanByCourse[course.name][student.name] = Math.round((mean / count * 20) * 100) / 100;
            }
        });
    });
    return meanByCourse;
}
