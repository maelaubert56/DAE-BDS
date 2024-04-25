import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default function EditMember() {
  const [user, setUser] = useState([]);
  const [form, setForm] = useState({
    user_old_password: "",
    users_password: "",
    users_password_confirm: "",
  });

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
            window.location.href = "/login";
          }
          return res.json();
        })
        .then((data) => {
          setUser(data.user);
        });
    } else {
      window.location.href = "/login";
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.users_password !== form.users_password_confirm) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    fetch(`${process.env.REACT_APP_API_URL}/api/users/update/changepassword`, {
      method: "PUT",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldPassword: form.user_old_password,
        newPassword: form.users_password,
      }),
    }).then((res) => {
      if (res.status !== 200) {
        if (res.status === 401) {
          alert("Mot de passe incorrect");
        } else {
          alert("Erreur lors de la mise à jour du mot de passe");
        }
      } else {
        alert("Mot de passe mis à jour");
      }
      return res.json();
    });
  };

  return (
    <div className="EditPassword">
      <Form
        className="d-flex justify-content-between flex-column m-auto px-5 gap-3 col col-md-4 mx-auto"
        onSubmit={handleSubmit}
      >
        <Form.Group id="users_password" className="mb-3 w-100">
          <Form.Label>Ancien mot de passe</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) =>
              setForm({ ...form, user_old_password: e.target.value })
            }
            required
          />
        </Form.Group>
        <Form.Group id="users_password_confirm" className="mb-3 w-100">
          <Form.Label>Nouveau mot de passe</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) =>
              setForm({ ...form, users_password: e.target.value })
            }
            required
          />
          <Form.Label>Confirmer le mot de passe</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) =>
              setForm({ ...form, users_password_confirm: e.target.value })
            }
            required
          />
        </Form.Group>
        <Button className="w-100" type="submit">
          Mettre à jour
        </Button>
      </Form>
    </div>
  );
}
