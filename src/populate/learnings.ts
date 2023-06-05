import { Learning } from "../models/learnings";
import fetch from "node-fetch";

export async function postLearnings(token: string, learnings: Learning[]) {
    let response = await fetch(`${process.env.API_HOST}/learnings`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`
        },
    });
    let jsonLearnings: any = await response.json();

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
            icon: learnings[i].icon,
            "description": learnings[i].description,
            "example": learnings[i].example,
            "isCritical": learnings[i].critical,
            "teachers": learnings[i].teachers.map((teacher) => {
                return teacher._id;
            }),
        };
        let response = await fetch(`${process.env.API_HOST}/learnings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify(obj),
        });
        let json: any = await response.json();
        if (json._id !== undefined) {
            learnings[i]._id = json._id;
        } else {
            console.log("Learnings", json);
            console.log(obj);
        }
    }
}
