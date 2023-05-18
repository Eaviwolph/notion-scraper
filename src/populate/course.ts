import { Course } from "../models/courses";
import { Users } from "../models/users";

export async function postCourses(token: string, courses: Course[], students: Users[]) {
    let allStudentsIDs = students.map((student) => {
        return student._id;
    });

    let response = await fetch('http://localhost:8080/courses', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`
        },
    });
    let jsonCourses = await response.json();

    for (let i = 0; i < courses.length; i++) {
        let jsonDbCourse = jsonCourses.find((dbCourse: any) => {
            return dbCourse.name === courses[i].name;
        });
        if (jsonDbCourse !== undefined) {
            console.log(`Course '${courses[i].name}' already exists in db`);
            courses[i]._id = jsonDbCourse._id;
            continue;
        }

        let obj = {
            "name": courses[i].name,
            "semester": courses[i].semester,
            "learnings": courses[i].learnings.map((learning) => {
                return learning._id;
            }),
            "students": allStudentsIDs,
        };

        let response = await fetch('http://localhost:8080/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify(obj),
        });
        let json = await response.json();
        if (json._id !== undefined) {
            courses[i]._id = json._id;
        } else {
            console.log(json);
        }
    }
}