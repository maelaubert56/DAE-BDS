import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Form from "react-bootstrap/Form";

import React, { useEffect, useState } from "react";

export default function Header() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetch(`${process.env.REACT_APP_API_URL}/api/users/me`, {
        method: "GET",
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (res.status !== 200) {
            setIsLogged(false);
          }
          return res.json();
        })
        .then((data) => {
          setIsLogged(true);
          setUser(data.user);
        });
    }
  }, []);

  const handleChangeSendMail = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/users/update/sendmail`, {
      method: "PUT",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    }).then((res) => {
      if (res.status !== 200) {
        alert("Erreur lors de la mise à jour de la préférence");
      } else {
        fetch(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          method: "GET",
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        })
          .then((res) => {
            if (res.status !== 200) {
              setIsLogged(false);
            }
            return res.json();
          })
          .then((data) => {
            setIsLogged(true);
            setUser(data.user);
          });
      }
    });
  };

  return (
    <Navbar
      expand="lg"
      style={{ backgroundColor: "#242d52" }}
      data-bs-theme="dark"
    >
      <Container>
        <Navbar.Brand href="/">
          <img
            src={process.env.PUBLIC_URL + "/logo_fond_noir_low.png"}
            width="50"
            className="d-inline-block align-top"
            alt="BDS Efrei Logo"
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
            {isLogged ? (
              <NavDropdown
                title={user.users_username}
                id="basic-nav-dropdown"
                autoClose="outside"
              >
                <NavDropdown.Item href="/admin">Dashboard</NavDropdown.Item>
                {user.users_permissions === 2 && (
                  <NavDropdown.Item href="/admin/manage-members">
                    Manager les membres
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item href="/admin/edit-password">
                  Changer de mot de passe
                </NavDropdown.Item>
                <NavDropdown.Item onClick={handleChangeSendMail}>
                  <Form.Check
                    type="switch"
                    id="custom-switch"
                    label="Recevoir les mails"
                    checked={user.users_send_mail}
                    onChange={() => {
                      handleChangeSendMail();
                    }}
                  />
                </NavDropdown.Item>
                <NavDropdown.Item
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                  }}
                >
                  Deconnexion
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link href="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
