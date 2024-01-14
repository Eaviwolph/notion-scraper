import fetch from "node-fetch";
import { Users } from "../models/users";

type Promo = {
    _id?: string,
    promo: string,
};

export async function postPromos(token: string, students: Users[]) {
    let promos: Promo[] = [
        {
            promo: "2024",
        },
    ];

    let response = await fetch(`${process.env.API_HOST}/promos`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`
        },
    });

    let jsonDbPromos: any = await response.json();

    for (let i = 0; i < promos.length; i++) {
        let jsonDbPromo = jsonDbPromos.find((dbPromo: any) => {
            return dbPromo.promo === promos[i].promo;
        });
        if (jsonDbPromo !== undefined) {
            console.log(`Promo '${promos[i]}' already exists in db`);
            continue;
        }

        let obj = {
            "promo": promos[i].promo,
        };
        let response = await fetch(`${process.env.API_HOST}/promos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify(obj),
        });
        let json: any = await response.json();
        if (json._id !== undefined) {
            promos[i]._id = json._id;
            console.log(`Promo '${promos[i].promo}' added to db`);
        } else {
            console.log("Promos", json);
            console.log(promos[i].promo);
        }
    }

    students.forEach(async (student) => {
        student.promo = promos[0]._id;
    });
}