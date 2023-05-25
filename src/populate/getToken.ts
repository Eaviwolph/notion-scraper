import fetch from "node-fetch";

export async function getToken(email: string, password: string): Promise<string> {
    let response = await fetch('http://localhost:8080/sign-in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "email": email,
            "password": password,
        }),
    });
    let data: any = await response.json();

    return data.token;
}