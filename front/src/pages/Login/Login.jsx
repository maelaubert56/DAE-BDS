import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import React, { useEffect, useState } from 'react';

export default function Login() {

    // if already connected, redirect to /admin
    useEffect(() => {
        if (localStorage.getItem('token')) {
            fetch(`${process.env.REACT_APP_API_URL}/api/users/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            }).then(res => {
                if (res.status === 200) {
                    window.location.href = '/admin';
                }
            });
        }
    }, []);

    const [data, setData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.email || !data.password) {
            alert("Vous n'avez pas rempli tous les champs");
            return;
        }
        fetch(`${process.env.REACT_APP_API_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => {
            if (res.status === 404) {
                alert("User Not Found");
            } else if (res.status === 401) {
                alert("Wrong Password");
            }
            return res.json();
        }).then(data => {
            if (data.accessToken) {
                localStorage.setItem('token', data.accessToken);
                window.location.href = '/admin';
            }
        });
    }

    return (
        <div className="d-flex justify-content-center flex-fill align-items-center flex-column" style={{ backgroundImage: 'url(/banniere_bds.png)', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
            <div className={`d-flex justify-content-center align-items-center flex-column rounded-3 py-3 gap-3 ${window.innerWidth > 768 ? 'w-25' : 'w-75'}
            `} style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
                <div className="d-flex justify-content-center align-items-center flex-column">
                    <h3 className="text-center">Login</h3>
                    <Button variant='outline-secondary' size="sm" href="/">Back</Button>
                </div>
                <Form className="d-flex justify-content-center align-items-center flex-column">
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email BDS</Form.Label>
                        <Form.Control required type="email" placeholder="Enter email" onChange={(e) => setData({ ...data, email: e.target.value })} style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', borderColor: 'rgba(0, 0, 0, 0.3)' }} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control required type="password" placeholder="Password" onChange={(e) => setData({ ...data, password: e.target.value })} style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', borderColor: 'rgba(0, 0, 0, 0.3)' }} />
                    </Form.Group>
                    <Button variant="primary" type="submit" onClick={handleSubmit}>
                        Submit
                    </Button>
                </Form>
            </div>
        </div>
    );
}
