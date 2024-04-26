import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


export default function AddMember() {
    const [form, setForm] = useState({
        name: '',
        type: ''
    });

    const [groups, setGroups] = useState([]);

    useEffect(() => {
        if (localStorage.getItem('token')) {
            fetch(`${process.env.REACT_APP_API_URL}/api/users/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            }).then(res => {
                if (res.status !== 200) {
                    window.location.href = '/login';
                }
                return res.json();
            })

        } else {
            window.location.href = '/login';
        }

        fetch(`${process.env.REACT_APP_API_URL}/api/groups`, {
            method: 'GET',
            headers: {
                'Authorization': `${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.status !== 200) {
                window.location.href = '/login';
            }
            return res.json();
        }
        ).then(data => {
            setGroups(data.groups);

        })
    }, []);


    const handleSubmit = () => {
        
        fetch(`${process.env.REACT_APP_API_URL}/api/groups`, {
            method: 'POST',
            headers: {
                'Authorization': `${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form)
        }).then(res => {
            if (res.status === 400) { // bad request
                alert('Remplissez tous les champs');
            }
            else if (res.status === 409) { // conflict
                alert('Le groupe existe déjà');
            }
            else{
                window.location.href = '/admin/manage-members';
            }

        })
    }


    return (
        <div className="container-fluid my-5">
            <div className="row justify-content-center">
                <div className="col-sm-12 col-lg-8">
                    <h3 className='text-center w-100 pb-3'>Nouveau Groupe</h3>
                    <Form className='d-flex justify-content-between flex-column w-100 m-auto px-5 gap-3'>
                            <Form.Group className="mb-3 w-100" controlId="formBasicName">
                                <Form.Label>Nom du groupe</Form.Label>
                                <Form.Control type="text" placeholder="Entrez le nom du groupe" onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </Form.Group>
                            <Form.Group className="mb-3 w-100" controlId="formBasicType">
                                <Form.Label>Type de groupe</Form.Label>
                                <Form.Control as="select" onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                    <option value='' disabled selected
                                    >Choisir un type de groupe</option>
                                    <option value='ASSO'>BDS</option>
                                    <option value='ADMIN'>Admin</option>
                                </Form.Control>
                            </Form.Group>
                            <Button variant="primary" type="submit" onClick={(e) => {e.preventDefault(); handleSubmit()}}>
                                Submit
                            </Button>
                    </Form>
                </div>
            </div>
        </div>
    );
};