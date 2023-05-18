import { Proof } from "../models/proofs";
import { Student } from "../models/students";

const heleneID = "0b2977b623aa448ba811c1ab31d7ba5b";
const michelID = "f58a4417ba3e4653b87aadf15238fd38";

export async function validateProof(token: string, proof: Proof) {
    let response = await fetch('http://localhost:8080/proofs/validate', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            "_id": proof._id,
        }),
    });

    if (response.status !== 200) {
        console.log(`Error validating proof ${proof._id}`);
    }
}

export async function postProofs(token: string, proofs: Proof[], students: Student[]) {
    let Michel = students.find((student) => {
        return student.name === "Michel Sasson";
    });
    if (Michel === undefined) {
        console.log("Michel not found");
        return;
    }
    let Helene = students.find((student) => {
        return student.name === "Helene Ouyang";
    });
    if (Helene === undefined) {
        console.log("Helene not found");
        return;
    }

    for (let i = 0; i < proofs.length; i++) {
        let members: (string | undefined)[] = [];
        if (proofs[i].students.length > 1) {
            members = proofs[i].students.splice(1).map((student) => {
                return student._id;
            });
        }

        let validatedBy = Michel;
        if (proofs[i].validatedBy === heleneID) {
            validatedBy = Helene;
        }

        let obj = {
            "learnings": proofs[i].learnings.map((learning) => {
                return learning._id;
            }),
            "lead": proofs[i].students[0]._id,
            "members": members,
            "teachers": [validatedBy._id],
        };

        let response = await fetch('http://localhost:8080/proofs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify(obj),
        });
        let json = await response.json();
        if (json._id !== undefined) {
            proofs[i]._id = json._id;
            validateProof(token, proofs[i]);
        } else {
            console.log(json);
        }
    }
}