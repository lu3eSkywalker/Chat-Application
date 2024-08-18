import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface FormData {
    name: string;
    email: string;
    password: string;
};

export default function Signup() {

    const initialFormData = {
        name: '',
        email: '',
        password: ''
    };

    const [formData, setFormData] = useState<FormData>(initialFormData);
    const navigate = useNavigate();

    const changeHandler = (event: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const buttonHandler = async (event: FormEvent<HTMLButtonElement>): Promise<void> => {
        event.preventDefault();
        try {
            const savedUserResponse = await fetch(`http://localhost:5000/api/v1/signup`, {
            // const savedUserResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const res = await savedUserResponse.json();
            console.log(res);

            if (res.status) {
                // Adding a console log to check when navigate is called
                console.log("Navigation triggered");
                navigate('/message');
            }
        } catch (error) {
            console.log("Error: ", error);
        }
    };

    return (
        <div>
            <form className='flex flex-col py-2'>
                <input
                    type='text'
                    placeholder='Name'
                    onChange={changeHandler}
                    name='name'
                    value={formData.name}
                    className='border border-gray-300 rounded h-9 w-75 placeholder:px-2 mb-2'
                />

                <input
                    type='email'
                    placeholder='Email'
                    onChange={changeHandler}
                    name='email'
                    value={formData.email}
                    className='border border-gray-300 rounded h-9 w-75 placeholder:px-2 mb-2'
                />

                <input
                    type='password'
                    placeholder='Password'
                    onChange={changeHandler}
                    name='password'
                    value={formData.password}
                    className='border border-gray-300 rounded h-9 w-75 placeholder:px-2 mb-2'
                />

                <button
                    type='submit'
                    className='h-9 w-[225px] font-bold text-white bg-cyan-500'
                    onClick={buttonHandler}
                >
                    Submit
                </button>
            </form>

            <div>
                <button onClick={() => navigate('/message')}>
                    Go To message page
                </button>
            </div>
        </div>
    );
}
