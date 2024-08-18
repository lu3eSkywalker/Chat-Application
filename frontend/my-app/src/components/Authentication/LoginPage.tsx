import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';


interface FormData {
    email: string,
    password: string;
}

// interface UseLoginReturnType {
//     formData: FormData;
//     userData: any[]; // Change 'any[]' to the appropriate type of your user data
//     changeHandler: (event: ChangeEvent<HTMLInputElement>) => void;
//     buttonHandler: (event: FormEvent<HTMLButtonElement>) => Promise<void>;
// }

export default function Login() {

    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: ''
    });

    const changeHandler = (event: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const navigate = useNavigate();


    const buttonHandler = async(event: FormEvent<HTMLButtonElement>): Promise<void> => {
        event.preventDefault();
        try { 
            // const savedUserResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/login`, {
                const savedUserResponse = await fetch(`http://localhost:5000/api/v1/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const res = await savedUserResponse.json();
            console.log(res.data);

            localStorage.setItem('userId', res.data.id);

            if(res.success) {
                navigate('/message');
            }

        }
        catch (error) {
            console.log("Error: ", error);
        }
    }

    return (
        <div>
            <form className='flex flex-col py-2'>
                    <input 
                        type='text'
                        placeholder='email'
                        name='email'
                        onChange={changeHandler}
                        value={formData.email}
                        className='border border-gray-300 rounded h-9 w-75 placeholder: px-2 mb-2'
                    />
                    <input 
                        type='password'
                        placeholder='password'
                        name='password'
                        onChange={changeHandler}
                        value={formData.password}
                        className='border border-gray-300 rounded h-9 w-75 placeholder: px-2 mb-2'
                    />

                    <div className='flex justify-center'>
                    <button 
                    className='h-9 w-[225px] font-bold text-white bg-green-500 rounded'
                    onClick={buttonHandler}>Submit</button>
                    </div>


                </form>
        </div>
    )
    
}