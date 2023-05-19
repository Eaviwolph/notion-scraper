import { Users } from "../models/users";
import fetch from "node-fetch";

export async function postStudents(token: string, students: Users[]) {
    let dbStudents = await fetch('http://localhost:8080/students', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`
        },
    });
    let jsonDbStudents: any = await dbStudents.json();

    let dbTeachers = await fetch('http://localhost:8080/teachers', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`
        },
    });
    let jsonDbTeachers: any = await dbTeachers.json();
    jsonDbStudents = jsonDbStudents.concat(jsonDbTeachers);

    for (let i = 0; i < students.length; i++) {
        let jsonDbStudent = jsonDbStudents.find((dbStudent: any) => {
            return dbStudent.firstName === students[i].name.split(" ")[0] && dbStudent.lastName === students[i].name.split(" ")[1];
        });
        if (jsonDbStudent !== undefined) {
            console.log(`Student '${students[i].name}' already exists in db`);
            students[i]._id = jsonDbStudent._id;
            continue;
        }
        let response = await fetch('http://localhost:8080/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                "firstName": students[i].name.split(" ")[0],
                "lastName": students[i].name.split(" ")[1],
                "email": students[i].name.split(" ")[0].toLowerCase() + "." + students[i].name.split(" ")[1].toLowerCase() + "@epita.fr",
                "password": students[i].name.split(" ")[0].toLowerCase() + "." + students[i].name.split(" ")[1].toLowerCase(),
                "promo": "2024",
                "major": "ICE",
            }),
        });

        let json: any = await response.json();
        if (json._id !== undefined) {
            students[i]._id = json._id;
        } else {
            console.log("Students", json);
        }
    }
}

export async function postTeachers(token: string, teachers: Users[]) {
    let dbTeachers = await fetch('http://localhost:8080/teachers', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`
        },
    });
    let jsonDbTeachers: any = await dbTeachers.json();

    for (let i = 0; i < teachers.length; i++) {
        let jsonDbTeacher = jsonDbTeachers.find((dbTeacher: any) => {
            return dbTeacher.firstName === teachers[i].name.split(" ")[0] && dbTeacher.lastName === teachers[i].name.split(" ")[1];
        });
        if (jsonDbTeacher !== undefined) {
            console.log(`Teacher '${teachers[i].name}' already exists in db`);
            teachers[i]._id = jsonDbTeacher._id;
            continue;
        }
        let response = await fetch('http://localhost:8080/teachers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                "firstName": teachers[i].name.split(" ")[0],
                "lastName": teachers[i].name.split(" ")[1],
                "email": teachers[i].name.split(" ")[0].toLowerCase() + "." + teachers[i].name.split(" ")[1].toLowerCase() + "@epita.fr",
                "password": teachers[i].name.split(" ")[0].toLowerCase() + "." + teachers[i].name.split(" ")[1].toLowerCase() + "38",
                "isAdmin": (teachers[i].name === "Michel Sasson" || teachers[i].name === "Helene Ouyang"),
            }),
        });

        let json: any = await response.json();
        if (json._id !== undefined) {
            teachers[i]._id = json._id;
        } else {
            console.log("Teachers", json);
        }
    }
}
