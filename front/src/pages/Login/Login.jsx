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
        fetch(`${process.env.REACT_APP_API_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(res => res.json())
            .then(data => {
                if (data.accessToken) {
                    localStorage.setItem('token', data.accessToken);
                    window.location.href = '/admin';
                }
            });
    }
    
    return (
        <div className="d-flex justify-content-center align-items-center flex-column
        " style={{height: '100vh'}}>
            <div className="d-flex justify-content-center align-items-center flex-column mb-5">
                <h3 className="text-center">Login</h3>
                <Button variant='outline-secondary' size="sm" href="/">Back</Button>
            </div>
        <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email BDS</Form.Label>
                <Form.Control type="email" placeholder="Enter email" onChange={(e) => setData({...data, email: e.target.value})} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" onChange={(e) => setData({...data, password: e.target.value})} />
            </Form.Group>
            <Button variant="primary" type="submit" onClick={handleSubmit}>
                Submit
            </Button>
        </Form>
        </div>
    );
}
