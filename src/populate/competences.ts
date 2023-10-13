import { Competence } from "../models/competences";
import fetch from "node-fetch";

export async function postCompetences(token: string, competence: Competence[]) {
    let response = await fetch(`${process.env.API_HOST}/competences`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`
        },
    });
    let jsonDbCompetences: any = await response.json();

    for (let i = 0; i < competence.length; i++) {
        let jsonDbCompetence = jsonDbCompetences.find((dbCompetence: any) => {
            return dbCompetence.name === competence[i].name;
        });
        if (jsonDbCompetence !== undefined) {
            console.log(`Competence '${competence[i].name}' already exists in db`);
            competence[i]._id = jsonDbCompetence._id;
            continue;
        }

        let obj = {
            "name": competence[i].name,
            "learnings": competence[i].learnings.map((learning) => {
                return learning._id;
            }),
        };
        let response = await fetch(`${process.env.API_HOST}/competences`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify(obj),
        });
        let json: any = await response.json();
        if (json._id !== undefined) {
            competence[i]._id = json._id;
        } else {
            console.log("Competences", json);
            console.log(competence[i]);
        }
    }
}