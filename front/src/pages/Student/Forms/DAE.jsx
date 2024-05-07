import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { CiCircleRemove } from "react-icons/ci";

import React, { useEffect, useState } from "react";

export default function FormDAE() {
  const [adminList, setAdminList] = useState([]);
  const [groups, setGroups] = useState([]);
  const [student, setStudent] = useState({
    nom: "",
    prenom: "",
    classe: "",
    groupeTD: "",
    mail: "",
    date: "",
    motif: "",
    sendToGroup: "",
    sendTo: "",
  });

  const [courses, setCourses] = useState([
    {
      matiere: "",
      heureDebut: "",
      heureFin: "",
    },
  ]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // remove thoses who has user_hide == 1
        setAdminList(data.users.filter((user) => user.users_hide == 0));
        console.log(data);
      });

    fetch(`${process.env.REACT_APP_API_URL}/api/groups`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setGroups(data.groups);
        console.log(data);
      });
  }, []);

  const handleAddCourse = () => {
    setCourses([
      ...courses,
      {
        matiere: "",
        heureDebut: "",
        heureFin: "",
      },
    ]);
  };

  const handleRemoveCourse = (index) => {
    setCourses(courses.filter((course, i) => i !== index));
  };

  const handleInputChange = (e, index) => {
    const { id, value } = e.target;
    if (index === -1) {
      setStudent({ ...student, [id]: value });
    } else {
      const updatedCourses = [...courses];
      //if the end hour is before the start hour, we set the end hour to the start hour
      if (id === "heureDebut" && updatedCourses[index].heureFin < value) {
        updatedCourses[index].heureFin = value;
      }

      updatedCourses[index][id] = value;
      setCourses(updatedCourses);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(student);
    console.log(courses);
    // check if te date is not more than 1 year in the past
    const date = new Date(student.date);
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    if (date < oneYearAgo) {
      alert("La date ne peut pas être antérieure à un an");
      return;
    }

    // check if all the fields are filled
    for (const key in student) {
      if (student[key] === "") {
        // set the focus on the first empty field
        document.getElementById(key).focus();
        // alert the user
        alert("Veuillez remplir tous les champs");
        return;
      }
    }
    for (const course of courses) {
      if (course.heureDebut > course.heureFin) {
        alert(
          "L'heure de début doit être avant l'heure de fin (pour le cours : " +
            course.matiere +
            ")"
        );
        return;
      }
      for (const key in course) {
        if (course[key] === "") {
          document.getElementById(key).focus();
          alert("Veuillez remplir tous les champs");
          return;
        }
      }
    }

    const data = {
      formData: {
        nom: student.nom,
        prenom: student.prenom,
        classe: student.classe,
        groupeTD: student.groupeTD,
        mail: student.mail,
        date: student.date,
        motif: student.motif,
        courses: courses,
      },
      sendToGroup: student.sendToGroup,
      sendTo: student.sendTo,
      type: "DAE",
    };
    data.courses = courses;

    fetch(`${process.env.REACT_APP_API_URL}/api/form`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        console.log(res.status);
        if (res.status === 201) {
          alert(
            "DAE envoyée ✅\nVous la recevrez signée par mail si elle est validée."
          );
          setStudent({
            nom: "",
            prenom: "",
            classe: "",
            groupeTD: "",
            mail: "",
            date: "",
            motif: "",
            sendToGroup: "",
            sendTo: "",
          });
          setCourses([
            {
              matiere: "",
              heureDebut: "",
              heureFin: "",
            },
          ]);
        }
      })
      .catch((err) => {
        alert("Erreur lors de l'envoi de la DAE");
      });
  };

  return (
    <div className="container-fluid my-5">
      <div className="row justify-content-center">
        <div className="col-sm-12 col-lg-8">
          <h3 className="text-center w-100 pb-3">Formulaire DAE</h3>
          <Form className="d-flex justify-content-between flex-column w-100 m-auto px-5 ">
            <div>
              <div className="d-flex justify-content-between gap-0 gap-sm-3 flex-column flex-sm-row">
                <Form.Group className="mb-3 w-100" controlId="nom">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Entrez votre nom"
                    required
                    onChange={(e) => handleInputChange(e, -1)}
                    value={student.nom}
                  />
                </Form.Group>
                <Form.Group className="mb-3 w-100" controlId="prenom">
                  <Form.Label>Prénom</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Entrez votre prénom"
                    required
                    onChange={(e) => handleInputChange(e, -1)}
                    value={student.prenom}
                  />
                </Form.Group>
              </div>
              <div className="d-flex justify-content-between gap-0 gap-sm-3 flex-column flex-sm-row">
                <Form.Group className="mb-3 w-100" controlId="classe">
                  <Form.Label>Classe</Form.Label>
                  <Form.Control
                    as="select"
                    required
                    onChange={(e) => handleInputChange(e, -1)}
                  >
                    <option defaultValue selected disabled value="">
                      Choisissez votre classe
                    </option>
                    <option value="L1">L1</option>
                    <option value="L2">L2</option>
                    <option value="L3">L3</option>
                    <option value="M1">M1</option>
                    <option value="M2">M2</option>
                    <option valut="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="B3">B3</option>
                    <option value="Autre">Autre</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3 w-100" controlId="groupeTD">
                  <Form.Label>Groupe de TD</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Entrez votre groupe de TD"
                    required
                    onChange={(e) => handleInputChange(e, -1)}
                    value={student.groupeTD}
                  />
                </Form.Group>
              </div>
              <div className="d-flex justify-content-between gap-0 gap-sm-3 flex-column flex-sm-row">
                <Form.Group className="mb-3 w-100" controlId="mail">
                  <Form.Label>Mail</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Entrez votre mail pour recevoir la DAE"
                    required
                    onChange={(e) => handleInputChange(e, -1)}
                    value={student.mail}
                  />
                </Form.Group>
                <Form.Group className="mb-3  w-100" controlId="date">
                  <Form.Label>Date d'absence</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    onChange={(e) => handleInputChange(e, -1)}
                    value={student.date}
                  />
                </Form.Group>
              </div>
              <div className="d-flex justify-content-between gap-0 gap-sm-3 flex-column flex-sm-row">
                <Form.Group className="mb-3 w-100" controlId="motif">
                  <Form.Label>Motif</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Entrez le motif de la DAE"
                    required
                    onChange={(e) => handleInputChange(e, -1)}
                    value={student.motif}
                  />
                </Form.Group>
                <Form.Group className="mb-3  w-100" controlId="sendToGroup">
                  <Form.Label>Envoyer à</Form.Label>
                  <Form.Control
                    as="select"
                    onChange={(e) => {
                      handleInputChange(e, -1);
                    }}
                  >
                    <option defaultValue selected disabled value="">
                      Choisissez un destinataire
                    </option>
                    {adminList.length > 0 &&
                      adminList
                        .filter(
                          (admin, index, self) =>
                            index ===
                            self.findIndex(
                              (a) =>
                                a.users_groups_name === admin.users_groups_name
                            )
                        )
                        .map((admin, index) => (
                          <>
                            {
                              // get the group of the admin and compare it to the group variable to see if groups.users_groups_type ==== 'ASSO'
                              groups?.find(
                                (group) =>
                                  group.users_groups_name ===
                                  admin.users_groups_name
                              )?.users_groups_type === "ASSO" && (
                                <option
                                  key={index}
                                  value={admin.users_groups_name}
                                >
                                  {admin.users_groups_name}
                                </option>
                              )
                            }
                          </>
                        ))}
                  </Form.Control>
                </Form.Group>
                {student.sendToGroup !== "" && (
                  <Form.Group className="mb-3  w-100" controlId="sendTo">
                    <Form.Label>Envoyer à</Form.Label>
                    <Form.Control
                      as="select"
                      onChange={(e) => handleInputChange(e, -1)}
                    >
                      <option defaultValue selected disabled value="">
                        Choisissez un destinataire
                      </option>
                      {/*<option value="all">Tous</option>*/}
                      {adminList.length > 0 &&
                        adminList.map(
                          (admin, index) =>
                            admin.users_groups_name === student.sendToGroup && (
                              <option key={index} value={admin.users_email}>
                                {admin.users_username}
                              </option>
                            )
                        )}
                    </Form.Control>
                  </Form.Group>
                )}
              </div>
            </div>
            <div className="d-flex justify-content-between flex-column w-100 mb-3">
              {courses.map((course, index) => (
                <div
                  key={index}
                  className="mb-3 d-flex justify-content-between flex-column align-items-center w-100 border p-3"
                >
                  <div className="d-flex justify-content-between w-100">
                    <p className="fw-semibold">Cours {index + 1}</p>
                    <CiCircleRemove
                      className="text-secondary"
                      style={{
                        cursor: "pointer",
                        width: "1.5em",
                        height: "1.5em",
                      }}
                      onClick={() => handleRemoveCourse(index)}
                    />
                  </div>
                  <Form.Group className="mb-3 w-100" controlId="matiere">
                    <Form.Label>Code et intitulé du cours concerné</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Entrez le code et l'intitulé du cours"
                      required
                      onChange={(e) => handleInputChange(e, index)}
                      value={course.matiere}
                    />
                  </Form.Group>
                  <div className="d-flex w-100 justify-content-between gap-0 gap-sm-3 flex-column flex-sm-row">
                    <Form.Group className="mb-3 w-100" controlId="heureDebut">
                      <Form.Label>Heure de début</Form.Label>
                      <Form.Control
                        type="time"
                        required
                        onChange={(e) => handleInputChange(e, index)}
                        value={course.heureDebut}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3 w-100" controlId="heureFin">
                      <Form.Label>Heure de fin</Form.Label>
                      <Form.Control
                        type="time"
                        required
                        onChange={(e) => handleInputChange(e, index)}
                        value={course.heureFin}
                      />
                    </Form.Group>
                  </div>
                </div>
              ))}
              <Button
                variant="secondary"
                className={`m-auto ${
                  window.innerWidth < 576 ? "w-75" : "w-50"
                }`}
                onClick={handleAddCourse}
              >
                {" "}
                + Ajouter un cours
              </Button>
            </div>
            <Button variant="primary" type="submit" onClick={handleSubmit}>
              Submit
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
