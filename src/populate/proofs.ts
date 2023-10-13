import { Proof } from "../models/proofs";
import { Users } from "../models/users";
import fetch from "node-fetch";
import { getToken } from "./getToken";

const heleneID = "0b2977b623aa448ba811c1ab31d7ba5b";

export async function validateProof(token: string, proof: Proof) {
    let response = await fetch(`${process.env.API_HOST}/proofs/state`, {
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

export async function postChat(proof: Proof, student: Users) {
    let studentToken = await getToken(
        student.name.split(" ")[0].toLowerCase() + "." + student.name.split(" ")[1].toLowerCase() + "@epita.fr",
        student.name.split(" ")[0].toLowerCase() + "." + student.name.split(" ")[1].toLowerCase());
    let response = await fetch(`${process.env.API_HOST}/chats`, {
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
        console.log(`Error posting chat on proof ${proof.id}`);
        let json: any = await response.json();
        console.log(json);
        console.log(proof);
    }
}

export async function postProof(token: string, proof: Proof, validatedBy: Users) {
    let obj = {
        "learnings": proof.learnings.map((learning) => {
            return learning._id;
        }),
        "students": proof.students.map((student) => {
            return student._id;
        }),
        "validatedBy": validatedBy._id,
    };

    let response = await fetch(`${process.env.API_HOST}/proofs`, {
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
        await postChat(proof, proof.students[0]);
        validateProof(token, proof);
    } else {
        console.log("Proofs", json);
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