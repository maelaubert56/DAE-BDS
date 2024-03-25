import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/esm/Button';
import { FaEdit } from 'react-icons/fa';
import Accordion from 'react-bootstrap/Accordion';

export default function ManageMembers() {

    const [user, setUser] = useState([]);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);

    // if not connected, redirect to /login
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

        fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
            method: 'GET',
            headers: {
                'Authorization': `${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
            .then(data => {
                const users = data.users;
                setUsers(users);
                // list all the possible groups 
                let groups = [];
                console.log(users)
                for (let i = 0; i < users.length; i++) {
                    var alreadyIn = false;
                    for (let j = 0; j < groups.length; j++) {
                        if (users[i].users_group === groups[j]) {
                            alreadyIn = true;
                        }
                    }
                    if (!alreadyIn) {
                        groups.push(users[i].users_group);
                    }
                }
                console.log(groups)
                setGroups(groups);
            });
    }, []);


    return (
        <div className="container w-100 h-100 d-flex gap-1 flex-column justify-content-start align-items-center">
            <div className="d-flex w-100 gap-0 flex-column justify-content-between align-items-center">
            <h2 className="text-center p-0 m-0 pt-2">Manage Members</h2>
            <Button href="/admin/add-member" className="my-3">Create Member</Button>
            </div>
            <div className={`d-flex gap-1 flex-column justify-content-between align-items-center ${window.innerWidth < 768 ? 'w-100' : 'w-50'}`}>
                { // map throught all the users[i].group
                    groups?.map(group => {
                        return (
                            <Accordion key={group} className="w-100">
                                <Accordion.Item eventKey={group}>
                                    <Accordion.Header>{group}</Accordion.Header>
                                    <Accordion.Body>
                                        <div className="d-flex w-100 gap-1 flex-column justify-content-between align-items-center">
                                            { // map throught all the users[i]
                                                users.map((user, i) => {
                                                    if (user.users_group === group) {
                                                        return (
                                                            <div key={i} className="d-flex w-100 gap-1 flex-column justify-content-between align-items-center border-bottom py-2">
                                                                <div className="d-flex w-100 gap-1 flex-row justify-content-between align-items-center">
                                                                    <div className="d-flex w-100 gap-1 flex-column justify-content-between align-items-start">
                                                                        <span className="fw-semibold">{user.users_username}</span>
                                                                        <span>{user.users_email}</span>
                                                                    </div>
                                                                    <Button href={`/admin/edit-member/${user.users_email}`}>Edit</Button>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                })
                                            }
                                        </div>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        );
                    })
                }
            </div>
        </div>
    );
};
