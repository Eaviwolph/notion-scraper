import { Proof } from "../models/proofs";
import { Users } from "../models/users";
import fetch from "node-fetch";
import { getToken } from "./getToken";

const heleneID = "0b2977b623aa448ba811c1ab31d7ba5b";

export async function validateProof(token: string, proof: Proof) {
    let response = await fetch('http://localhost:8080/proofs/state', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            "_id": proof._id,
            "state": "VALIDATED",
        }),
    });

    if (response.status !== 200) {
        console.log(`Error validating proof ${proof._id}`);
        let json: any = await response.json();
        console.log(json);
    }
}

export async function postChat(token: string, proof: Proof, student: Users) {
    let studentToken = await getToken(
        student.name.split(" ")[0].toLowerCase() + "." + student.name.split(" ")[1].toLowerCase() + "@epita.fr",
        student.name.split(" ")[0].toLowerCase() + "." + student.name.split(" ")[1].toLowerCase());
    let response = await fetch('http://localhost:8080/chats', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({
            "proof_id": proof._id,
            "text": proof.firstChat,
        }),
    });

    if (response.status !== 200) {
        console.log(`Error posting chat on proof ${proof._id}`);
        let json: any = await response.json();
        console.log(json);
    }
}

export async function postProof(token: string, proof: Proof, validatedBy: Users) {
    for (let j = 0; j < proof.students.length; j++) {
        let obj = {
            "learnings": proof.learnings.map((learning) => {
                return learning._id;
            }),
            "student": proof.students[j]._id,
            "validatedBy": validatedBy._id,
        };

        let response = await fetch('http://localhost:8080/proofs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify(obj),
        });
        let json: any = await response.json();
        if (json._id !== undefined) {
            proof._id = json._id;
            await postChat(token, proof, proof.students[j]);
            validateProof(token, proof);
        } else {
            console.log("Proofs", json);
        }
    }
}

export async function postProofs(token: string, proofs: Proof[], teachers: Users[]) {
    let Michel = teachers.find((teacher) => {
        return teacher.name === "Michel Sasson";
    });
    if (Michel === undefined) {
        console.log("Michel not found");
        return;
    }
    let Helene = teachers.find((teacher) => {
        return teacher.name === "Helene Ouyang";
    });
    if (Helene === undefined) {
        console.log("Helene not found");
        return;
    }

    for (let i = 0; i < proofs.length; i++) {
        let validatedBy = Michel;
        if (proofs[i].validatedBy === heleneID) {
            validatedBy = Helene;
        }

        await postProof(token, proofs[i], validatedBy);
    }
}