import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers";
import * as yup from "yup";
import PasswordStrengthBar from 'react-password-strength-bar';

import "../Styles/SignUpForm.css"

const SignupSchema = yup.object().shape({
    lastName: yup
        .string()
        .required("Фамилия обязательна")
        .max(35, "Максимальная длина фамилии 35 символов")
        .matches(/^[a-zA-Zа-яА-ЯёЁ]+$/, 'В данном поле разрешены только буквенные выражения'),
    firstName: yup
        .string()
        .required("Имя обязательно")
        .max(40, "Максимальная длина имени 40 символов")
        .matches(/^[a-zA-Zа-яА-ЯёЁ]+$/, 'В данном поле разрешены только буквенные выражения'),
    patronymic: yup
        .string()
        .required("Отчество обязательно")
        .max(40, "Максимальная длина отчества 40 символов")
        .matches(/^[a-zA-Zа-яА-ЯёЁ]+$/, 'В данном поле разрешены только буквенные выражения'),
    age: yup
        .number()
        .typeError("Возрастом может быть только целое число от 16 до 150")
        .required("Возраст - требуемое поле для регистрации")
        .moreThan(15, "Возраст должен быть не менее 16 лет")
        .lessThan(151, "Вам не может быть больше 150 лет")
        .integer("Возраст должен быть целым числом"),
    login: yup
        .string()
        .required('Логин - обязательное поле')
        .min(4, "Минимально допустимая длина логина 4 символа")
        .max(30, "Длина логина должна быть не более 30 символов")
        .matches(/^(_*[A-Za-z0-9]+_*)*$/, 'В логине могут быть латинские буквы, цифры и нижнее подчеркивание'),
    email: yup
        .string()
        .required('Email должен быть указан')
        .email("Такой email не может существовать"),
    password: yup
        .string()
        .min(8, "Пароль должен быть длиной не менее 8 символов"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Пароли не совпадают')

});

export function SignUpForm() {
    const { register, handleSubmit, errors } = useForm({
        resolver: yupResolver(SignupSchema)
    });
    const scoreWords = ['очень слабый', 'слабый', 'средний', 'хороший', 'сильный'];
    const [password, setPassword] = useState("");
    const onChange = event => {setPassword(event.target.value)}
    const closeModal = () => {
        let modal = document.getElementById("myModal");
        modal.style.display = 'None';
    };

    const onSpanClick = () => {
        closeModal();
    }

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
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-type': 'Application/json'
            },
            body: JSON.stringify({...data, CSRFtoken: token})
        })
        if (response.status === 201) {
            closeModal()
        }
        const responseData = await response.json();
        alert(responseData.message);
    }

    return (
        <div id="myModal" className="modal">
            <div className="modal-content">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="cross">
                        <span onClick={onSpanClick} className="close">&times;</span>
                    </div>
                    <div>
                        <label>Фамилия</label>
                        <input type="text" name="lastName" ref={register} />
                        {errors.lastName && <p>{errors.lastName.message}</p>}
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        <label>Имя</label>
                        <input type="text" name="firstName" ref={register} />
                        {errors.firstName && <p>{errors.firstName.message}</p>}
                    </div>
                    <div>
                        <label>Отчество</label>
                        <input type="text" name="patronymic" ref={register}/>
                        {errors.patronymic && <p>{errors.patronymic.message}</p>}
                    </div>
                    <div>
                        <label>Возраст</label>
                        <input type="text" name="age" ref={register} />
                        {errors.age && <p>{errors.age.message}</p>}
                    </div>
                    <div>
                        <label>Логин</label>
                        <input type="text" name="login" ref={register} />
                        {errors.login && <p>{errors.login.message}</p>}
                    </div>
                    <div>
                        <label>Email</label>
                        <input type="text" name="email" ref={register} />
                        {errors.email && <p>{errors.email.message}</p>}
                    </div>
                    <div>
                        <label>Пароль</label>
                        <input type="password" onChange={onChange} name="password" ref={register}/>
                        {errors.password && <p>{errors.password.message}</p>}
                        <PasswordStrengthBar
                            shortScoreWord={""}
                            scoreWords={scoreWords}
                            password={password}
                        />
                    </div>
                    <div>
                        <label>Подтвердите пароль</label>
                        <input type="password" name="confirmPassword" ref={register}/>
                        {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
                    </div>
                    <input type="submit" value="Зарегистрироваться"/>
                </form>
            </div>
        </div>
    );
}
