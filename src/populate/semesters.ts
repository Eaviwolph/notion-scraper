import fetch from "node-fetch";
import { Course } from "../models/courses";

type Semester = {
    _id?: string,
    semester: string,
};

export async function postSemesters(token: string, courses: Course[]) {
    let semesters: Semester[] = courses.map((course) => {
        return {
            semester: course.semester,
        };
    });

    semesters = semesters.filter((semester, index, self) =>
        index === self.findIndex((s) => (
            s.semester === semester.semester
        ))
    );

    let response = await fetch(`${process.env.API_HOST}/semesters`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`
        },
    });

    let jsonDbSemesters: any = await response.json();

    for (let i = 0; i < semesters.length; i++) {
        let jsonDbSemester = jsonDbSemesters.find((dbSemester: any) => {
            return dbSemester.semester === semesters[i].semester;
        });
        if (jsonDbSemester !== undefined) {
            console.log(`Semester '${semesters[i]}' already exists in db`);
            continue;
        }

        let obj = {
            "semester": semesters[i].semester,
        };
        let response = await fetch(`${process.env.API_HOST}/semesters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify(obj),
        });
        let json: any = await response.json();
        if (json._id !== undefined) {
            semesters[i]._id = json._id;
            console.log(`Semester '${semesters[i].semester}' added to db`);
        } else {
            console.log("Semesters", json);
            console.log(semesters[i].semester);
        }
    }

    courses.forEach(async (course) => {
        course.semester = semesters.find((semester) => {
            return semester.semester === course.semester;
        })?._id || "";
    });
}