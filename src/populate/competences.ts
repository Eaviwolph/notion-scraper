import { Competence } from "../models/competences";

export async function postCompetences(token: string, competence: Competence[]) {
    let response = await fetch('http://localhost:8080/competences', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`
        },
    });
    let jsonDbCompetences = await response.json();

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
        let response = await fetch('http://localhost:8080/competences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify(obj),
        });
        let json = await response.json();
        if (json._id !== undefined) {
            competence[i]._id = json._id;
        } else {
            console.log(json);
        }
    }
}