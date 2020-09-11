import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers";
import * as yup from "yup";

import "../Styles/SignUpForm.css"

export function SignInForm() {
    const signInSchema = yup.object().shape({
        login: yup
        .string()
        .required('Логин - обязательное поле')
        .min(4, "Минимально допустимая длина логина 4 символа")
        .max(30, "Длина логина должна быть не более 30 символов")
        .matches(/^(_*[A-Za-z0-9]+_*)*$/, 'В логине могут быть латинские буквы, цифры и нижнее подчеркивание'),
        password: yup
        .string()
        .min(8, "Пароль должен быть длиной не менее 8 символов")
    })

    const { register, handleSubmit, errors } = useForm({
        resolver: yupResolver(signInSchema)
    });

    const onSubmit = async (data) => {
        const token = await fetchToken();
        await fetchData(data, token);
    };

    const fetchToken = async () => {
        const response = await fetch('/csrf');
        const data = await response.json();
        return data.token;
    }

    const fetchData = async (data, token) => {
        const response = await fetch('/authorize', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({...data, CSRFtoken: token})
        })
        if (response.status === 201) {
            window.location.replace('https://yandex.ru')
        }
        const responseData = await response.json()
        alert(responseData.message)
    }

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
                {errors.login && <p>{errors.login.message}</p>}
            </div>
            <div>
                <label>Пароль</label>
                <input type="password" name="password" ref={register}/>
                {errors.password && <p>{errors.password.message}</p>}
            </div>
            <div className="buttons">
                <div className="signIn"><input type="submit" value="Войти"/></div>
                <div className="signUp">
                    <button
                        id="myButton"
                        onClick={onClickButton}
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