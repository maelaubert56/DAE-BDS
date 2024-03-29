import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


export default function AddMember() {
    const [form, setForm] = useState({
        email: '',
        isAdmin: 0,
        nom: '',
        prenom: '',
        username: '',
        password: '',
        users_group: '',
        signature: null
    });

    const [user, setUser] = useState([]);
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
            }
            ).then(data => {
                setUser(data.user);

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
        const formData = new FormData();
        formData.append('email', form.email);
        if (form.isAdmin) {
            formData.append('isAdmin', 1);
        } else {
            formData.append('isAdmin', 0);
        }
        formData.append('nom', form.nom);
        formData.append('prenom', form.prenom);
        formData.append('username', form.username);
        formData.append('password', form.password);
        formData.append('users_group', form.users_group);
        formData.append('signature', form.signature);
        console.log(form);
        fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Authorization': `${localStorage.getItem('token')}`
            },
            body: formData,
        }).then(res => {
            if (res.status === 200) {
                window.location.href = '/admin/manage-members';
            } else {
                if (res.status === 409) {
                    alert('User already exists');
                } else {
                    alert('Internal server error');
                }
            }
        });
    }


    return (
        <div className="container-fluid my-5">
            <div className="row justify-content-center">
                <div className="col-sm-12 col-lg-8">
                    <h3 className='text-center w-100 pb-3'>Nouvel Utilisateur</h3>
                    <Form className='d-flex justify-content-between flex-column w-100 m-auto px-5 gap-3'>
                        <div>
                            <div className="d-flex justify-content-between gap-0 gap-sm-3 flex-column flex-sm-row">
                                <Form.Group className="mb-3 w-100" controlId="formBasicEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control type="email" placeholder="Enter email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                </Form.Group>
                                <Form.Group className="mb-3 w-100" controlId="formBasicNom">
                                    <Form.Label>Nom</Form.Label>
                                    <Form.Control type="text" placeholder="Nom" onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                                </Form.Group>
                            </div>
                            <div className="d-flex justify-content-between gap-0 gap-sm-3 flex-column flex-sm-row">
                                <Form.Group className="mb-3 w-100" controlId="formBasicPrenom">
                                    <Form.Label>Prénom</Form.Label>
                                    <Form.Control type="text" placeholder="Prénom" onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
                                </Form.Group>
                                <Form.Group className="mb-3 w-100" controlId="formBasicUsername">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control type="text" placeholder="exemple : Marius Chevailler - Président" onChange={(e) => setForm({ ...form, username: e.target.value })} />
                                </Form.Group>
                            </div>
                            <div className="d-flex justify-content-between gap-0 gap-sm-3 flex-column flex-sm-row">
                                <Form.Group className="mb-3 w-100" controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
                                </Form.Group>
                                <Form.Group className="mb-3 w-100" controlId="formBasicUsersGroup">
                                    <Form.Label>Groupe</Form.Label>
                                    <Form.Control as="select" onChange={(e) => setForm({ ...form, users_group: e.target.value })}>
                                        <option value=''>Choisir un groupe</option>
                                        {groups?.map((group, index) => {
                                            return <option key={index} value={group.users_groups_name}>{group.users_groups_name}</option>
                                        })}
                                    </Form.Control>
                                </Form.Group>
                            </div>
                            <div className="d-flex justify-content-between align-items-center gap-0 gap-sm-3 flex-column flex-sm-row">
                                <Form.Group className="mb-3 w-100" controlId="formBasicSignature">
                                    <Form.Label>Signature</Form.Label>
                                    <Form.Control type="file" placeholder="Signature" onChange={(e) => setForm({ ...form, signature: e.target.files[0] })} />
                                </Form.Group>
                                <Form.Group className=" w-100 d-flex align-items-center" controlId="formBasicIsAdmin">
                                    <Form.Check type="switch" label="is admin" onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })} />
                                </Form.Group>
                            </div>
                        </div>
                        <Button variant="primary" type="submit" onClick={(e) => {e.preventDefault(); handleSubmit()}}>
                            Submit
                        </Button>
                    </Form>
                </div>
            </div>
        </div>
    );
};