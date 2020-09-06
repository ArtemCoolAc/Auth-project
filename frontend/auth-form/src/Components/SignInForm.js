import React from "react";
import { useForm } from "react-hook-form";
import {SignUpForm} from './SignUpForm'

import "../Styles/SignUpForm.css"

export function SignInForm() {
    const { register, handleSubmit } = useForm({});
    const onSubmit = data => {
        alert(JSON.stringify(data));
    };
    const onClickButton = () => {
        let modal = document.getElementById("myModal");
        modal.style.display = 'block';
    }
    window.onclick = event => {
        let modal = document.getElementById("myModal");
        if (event.target === modal) {
            modal.style.display = 'None'
        }
    }

    const inputStyle = {
        display: 'block',
        boxSizing: 'border-box',
        width: '100%',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '40px',
        marginBottom: '10px',
        fontSize: '16px',
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label>Логин</label>
                <input type="text" name="login" ref={register} />
            </div>
            <div>
                <label>Пароль</label>
                <input type="password" name="password" ref={register}/>
            </div>
            <div className="buttons">
                <div className="signIn"><input type="submit" value="Войти"/></div>
                <div className="signUp">
                    <button
                        id="myButton"
                        onClick={onClickButton}
                        //form={SignUpForm}
                        style={inputStyle}
                        type="button"
                        value="Регистрация">
                        Регистрация
                    </button>
                </div>
            </div>
        </form>
    );
}