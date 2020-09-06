import React from "react";
import {SignInForm} from './SignInForm';
import {SignUpForm} from "./SignUpForm";

export function AuthPage(props) {
    return (
        <div>
            <SignInForm />
            <SignUpForm />
        </div>
    )
}