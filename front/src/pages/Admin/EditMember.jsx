import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default function EditMember() {
  const [deleteModal, setDeleteModal] = useState(false);
  const handleCloseModal = () => setDeleteModal(false);
  const handleShowModal = () => setDeleteModal(true);

  const [form, setForm] = useState({
    email: "",
    isAdmin: 0,
    hide: 0,
    nom: "",
    prenom: "",
    username: "",
    password: "",
    users_group: "",
    signature: null,
  });

  const [user, setUser] = useState([]);
  const [editedUser, setEditedUser] = useState([]);
  const [groups, setGroups] = useState([]);

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

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetch(
        `${process.env.REACT_APP_API_URL}/api/users/${
          window.location.pathname.split("/")[3]
        }`,
        {
          method: "GET",
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      )
        .then((res) => {
          if (res.status !== 200) {
            //window.location.href = '/login';
            console.log("error");
          }
          return res.json();
        })
        .then((data) => {
          console.log(data);
          setEditedUser(data.user);
          setForm({
            email: data.user.users_email,
            isAdmin:
              data.user.users_permissions.toString() === "2" ||
              data.user.users_permissions.toString() === "1"
                ? 1
                : 0,
            hide: data.user.users_hide,
            nom: data.user.users_nom,
            prenom: data.user.users_prenom,
            username: data.user.users_username,
            users_group: data.user.users_groups_name,
          });
        });

      fetch(`${process.env.REACT_APP_API_URL}/api/groups`, {
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
          setGroups(data.groups);
        });
    } else {
      //window.location.href = '/login';
      console.log("error");
    }
  }, []);

  const handleSubmit = (form) => {
    const formData = new FormData();
    formData.append("isAdmin", form.isAdmin);
    formData.append("hide", form.hide);
    formData.append("email", form.email);
    formData.append("nom", form.nom);
    formData.append("prenom", form.prenom);
    formData.append("username", form.username);
    formData.append("password", form.password);
    formData.append("users_group", form.users_group);
    formData.append("signature", form.signature);
    console.log(form);
    fetch(`${process.env.REACT_APP_API_URL}/api/users/${form.email}`, {
      method: "PUT",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
      },
      body: formData,
    }).then((res) => {
      if (res.status === 200) {
        window.location.href = "/admin/manage-members";
      } else {
        alert("Internal server error");
      }
    });
  };

  return (
    <div className="container-fluid my-5">
      <div className="row justify-content-center">
        <div className="col-sm-12 col-lg-8">
          <h3 className="text-center w-100 pb-3">Editer l'Utilisateur</h3>
          <Form className="d-flex justify-content-between flex-column w-100 m-auto px-5 gap-3">
            <div>
              <div className="d-flex justify-content-between gap-0 gap-sm-3 flex-column flex-sm-row">
                <Form.Group className="mb-3 w-100" controlId="formBasicEmail">
                  <Form.Label>Adresse email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    disabled
                    value={form.email}
                  />
                </Form.Group>
                <Form.Group className="mb-3 w-100" controlId="formBasicNom">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nom"
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    value={form.nom}
                  />
                </Form.Group>
              </div>
              <div className="d-flex justify-content-between gap-0 gap-sm-3 flex-column flex-sm-row">
                <Form.Group className="mb-3 w-100" controlId="formBasicPrenom">
                  <Form.Label>Prénom</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Prénom"
                    onChange={(e) =>
                      setForm({ ...form, prenom: e.target.value })
                    }
                    value={form.prenom}
                  />
                </Form.Group>
                <Form.Group
                  className="mb-3 w-100"
                  controlId="formBasicUsername"
                >
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="exemple : Marius Chevailler - Président"
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    value={form.username}
                  />
                </Form.Group>
              </div>
              <div className="d-flex justify-content-between gap-0 gap-sm-3 flex-column flex-sm-row">
                <Form.Group
                  className="mb-3 w-100"
                  controlId="formBasicPassword"
                >
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group
                  className="mb-3 w-100"
                  controlId="formBasicUsersGroup"
                >
                  <Form.Label>Groupe</Form.Label>
                  <Form.Control
                    as="select"
                    onChange={(e) =>
                      setForm({ ...form, users_group: e.target.value })
                    }
                    value={form.users_group}
                  >
                    {groups.map((group, index) => {
                      return (
                        <option key={index}>{group.users_groups_name}</option>
                      );
                    })}
                  </Form.Control>
                </Form.Group>
              </div>
              <div className="d-flex justify-content-between align-items-center gap-0 gap-sm-3 flex-column flex-sm-row">
                <Form.Group
                  className="mb-3 w-100"
                  controlId="formBasicSignature"
                >
                  <Form.Label>Signature</Form.Label>
                  <Form.Control
                    type="file"
                    placeholder="Signature"
                    onChange={(e) =>
                      setForm({ ...form, signature: e.target.files[0] })
                    }
                  />
                </Form.Group>
                <div className="w-100 d-flex justify-content-between align-items-center gap-0 gap-sm-3 flex-column flex-sm-row">
                  <Form.Group
                    className="d-flex align-items-center"
                    controlId="formBasicIsAdmin"
                  >
                    <div className="d-flex align-items-start flex-column">
                      {editedUser.users_permissions !== 2 && (
                        <Form.Check
                          type="switch"
                          label="Administrateur"
                          onChange={(e) =>
                            setForm({ ...form, isAdmin: e.target.checked })
                          }
                          checked={form.isAdmin}
                        />
                      )}
                      <Form.Check
                        type="switch"
                        label="Hide"
                        onChange={(e) =>
                          setForm({ ...form, hide: e.target.checked })
                        }
                        checked={form.hide}
                      />
                    </div>
                  </Form.Group>
                  {editedUser.users_permissions !== 2 &&
                    editedUser.users_email !== user.users_email && (
                      <Button variant="danger" onClick={handleShowModal}>
                        Supprimer l'utilisateur
                      </Button>
                    )}
                </div>
              </div>
            </div>
            <Button
              variant="primary"
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(form);
              }}
            >
              Submit
            </Button>
          </Form>
        </div>
      </div>

      <Modal show={deleteModal} onHide={handleCloseModal} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Supprimer l'utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Vous etes sur le point de supprimer {form.email}.<br />
          Voulez-vous continuer ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={(e) => {
              e.preventDefault();
              handleCloseModal();
              fetch(
                `${process.env.REACT_APP_API_URL}/api/users/${form.email}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `${localStorage.getItem("token")}`,
                  },
                }
              ).then((res) => {
                if (res.status === 200) {
                  window.location.href = "/admin/manage-members";
                }
              });
            }}
          >
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
