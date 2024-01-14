import fetch from "node-fetch";
import { Users } from "~/models/users";

type Major = {
    _id?: string,
    major: string,
};

export async function postMajors(token: string, students: Users[]) {
    let majors: Major[] = [
        {
            major: "ICE",
        },
    ];

    let response = await fetch(`${process.env.API_HOST}/majors`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`
        },
    });

    let jsonDbMajors: any = await response.json();

    for (let i = 0; i < majors.length; i++) {
        let jsonDbMajor = jsonDbMajors.find((dbMajor: any) => {
            return dbMajor.major === majors[i].major;
        });
        if (jsonDbMajor !== undefined) {
            console.log(`Major '${majors[i]}' already exists in db`);
            continue;
        }

        let obj = {
            "major": majors[i].major,
        };
        let response = await fetch(`${process.env.API_HOST}/majors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify(obj),
        });
        let json: any = await response.json();
        if (json._id !== undefined) {
            majors[i]._id = json._id;
            console.log(`Major '${majors[i].major}' added to db`);
        } else {
            console.log("Majors", json);
            console.log(majors[i].major);
        }
    }

    students.forEach(async (student) => {
        student.major = majors[0]._id;
    });
}