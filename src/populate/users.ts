import { Student } from "../models/students";

export async function postStudents(token: string, students: Student[]) {
    let dbStudents = await fetch('http://localhost:8080/students', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`
        },
    });
    let jsonDbStudents = await dbStudents.json();

    let dbTeachers = await fetch('http://localhost:8080/teachers', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`
        },
    });
    let jsonDbTeachers = await dbTeachers.json();
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
        let response: any;
        if (students[i].isStudent) {
            response = await fetch('http://localhost:8080/students', {
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
        } else {
            response = await fetch('http://localhost:8080/teachers', {
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
                }),
            });
        }

        let json = await response.json();
        if (json._id !== undefined) {
            students[i]._id = json._id;
        } else {
            console.log(json);
        }
    }
}