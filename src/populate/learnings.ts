import { Learning } from "../models/learnings";
import { Student } from "../models/students";
import * as fs from "fs";

export async function postLearnings(token: string, learnings: Learning[]) {
    let response = await fetch('http://localhost:8080/learnings', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`
        },
    });
    let jsonLearnings = await response.json();

    for (let i = 0; i < learnings.length; i++) {
        let jsonDbLearning = jsonLearnings.find((dbLearning: any) => {
            return dbLearning.name === learnings[i].name;
        });
        if (jsonDbLearning !== undefined) {
            console.log(`Learning '${learnings[i].name}' already exists in db`);
            learnings[i]._id = jsonDbLearning._id;
            continue;
        }

        let obj = {
            "name": learnings[i].name,
            "description": learnings[i].description,
            "example": learnings[i].example,
            "isCritical": learnings[i].critical,
            // "studentsValidating": learnings[i].studentsValidating.map((student) => {
            //     return student._id;
            // }),
        };
        let response = await fetch('http://localhost:8080/learnings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify(obj),
        });
        let json = await response.json();
        if (json._id !== undefined) {
            learnings[i]._id = json._id;
        } else {
            console.log(json);
        }
    }
}