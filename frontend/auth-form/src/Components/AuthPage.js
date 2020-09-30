import React, { useEffect } from "react";
import {SignInForm} from './SignInForm';
import {SignUpForm} from "./SignUpForm";

import '../Styles/AuthPage.css'

export function AuthPage(props) {
    const fetchToken = async () => {
        const response = await fetch('/csrf');
        const data = await response.json();
        return data.token;
    }
    const check_auth = async (token) => {
        const response = await fetch('/cookie', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({CSRFtoken: token})
        });
        if (response.status === 200) {
            window.location.replace('https://mail.ru');
        }
        const data = await response.json();
        console.log(data);
    }

    useEffect(() => {
        const checkCookie = async () => {
            const token = await fetchToken();
            await check_auth(token);
        }
        checkCookie();        
    })

    return (
        <div className="outerWrapper">
            <div className="innerWrapper">
                <SignInForm />
                <SignUpForm />
            </div>
        </div>
    )
}