import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

import React, { useEffect, useState } from 'react';


export default function Header() {

    const [isLogged, setIsLogged] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('token')) {
            // do a request to /api/me to check if the token is still valid
            setIsLogged(true);
        }
    }, []);

    return (
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand href="/">
                    <img
                        src={process.env.PUBLIC_URL + '/logo_fond_noir_low.png'}
                        width="50"

                        className="d-inline-block align-top"
                        alt="React Bootstrap logo"
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto justify-content-between w-100">
                        <div className="d-flex">
                            <NavDropdown title="Formulaires" id="basic-nav-dropdown">
                                <NavDropdown.Item href="/#DAE">DAE</NavDropdown.Item>
                            </NavDropdown>
                        </div>
                        {isLogged ?(
                            <NavDropdown title="Admin" id="basic-nav-dropdown">
                                <NavDropdown.Item href="/admin">Dashboard</NavDropdown.Item>
                                <NavDropdown.Item href="/admin/manage-members">Manage Members</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}>
                                    Log out
                                </NavDropdown.Item>
                                
                            </NavDropdown>) : <Nav.Link href="/login">Login</Nav.Link>}

                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}