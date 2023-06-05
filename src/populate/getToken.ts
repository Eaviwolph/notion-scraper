import fetch from "node-fetch";

export async function getToken(email: string, password: string): Promise<string> {
    let response = await fetch(`${process.env.API_HOST}/sign-in`, {
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