import React, { useEffect, useState } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import { MultiSelect } from "react-multi-select-component";

import { FaCheck, FaHourglass, FaHourglassHalf, FaTimes } from "react-icons/fa";
import { CiCircleRemove } from "react-icons/ci";
import { FaSave } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

export default function Admin() {
  const [user, setUser] = useState({});
  const [users, setUsers] = useState([{}]);
  const [forms, setForms] = useState([]);
  const [nbForms, setNbForms] = useState(0);
  const [isLoading, setIsLoading] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [checkedForms, setCheckedForms] = useState([]);
  const [reviewModal, setReviewModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState({});
  const [refuseReasonInput, setRefuseReasonInput] = useState(false);
  const [filtersStatut, setFiltersStatut] = useState("to_review");
  const [filtersType, setFiltersType] = useState("");
  const [filtersFor, setFiltersFor] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [refuseReason, setRefuseReason] = useState("");
  // if the user click outside of the div .rejectanddelete, refuseReasonInput is set to false
  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.closest(".rejectanddelete") === null) {
        setRefuseReasonInput(false);
      }
      if (e.target.closest(".rejectanddelete") === null) {
        setRefuseReasonInput(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const handleOpenReview = () => setReviewModal(true);
  const handleCloseReview = () => setReviewModal(false);
  // if not connected, redirect to /login
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
          setFiltersStatut(
            data.user.users_groups_name === "Responsables Vie Associative"
              ? "waitingForAdmin"
              : "to_review"
          );
        });
    } else {
      window.location.href = "/login";
    }

    fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
      method: "GET",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users);
        setFiltersFor(
          data.users
            .filter(
              (user) =>
                user.users_groups_name !== "Responsables Vie Associative"
            )
            .map((user) => ({
              label: user.users_username,
              value: user.users_email,
            }))
        );
      });
  }, []);

  useEffect(() => {
    if (window.innerWidth < 576) {
      setShowFilters(false);
    } else {
      setShowFilters(true);
    }
  }, []);

  const downloadForm = (form_id) => {
    setIsLoading((prevState) => ({
      ...prevState,
      [form_id]: { pdf: prevState[form_id].pdf, docx: true },
    }));
    fetch(`${process.env.REACT_APP_API_URL}/api/form/download/${form_id}`, {
      method: "GET",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
      }, // if res.status === 200, then the form is downloaded , else, an error message is sent
      //first, check the status of the response
    }).then((res) => {
      if (res.status === 200) {
        res.blob().then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          //DAE_nom_date.docx
          const name = `DAE_${
            forms.find((form) => form.form_id === form_id).form_data.nom
          }_${
            forms.find((form) => form.form_id === form_id).form_data.date
          }.docx`;
          a.download = name;
          a.click();
          setIsLoading((prevState) => ({
            ...prevState,
            [form_id]: { pdf: prevState[form_id].pdf, docx: false },
          }));
        });
      } else {
        console.log("error downloading form");
        alert("Error downloading form");
        setIsLoading((prevState) => ({
          ...prevState,
          [form_id]: { pdf: prevState[form_id].pdf, docx: false },
        }));
      }
    });
  };

  const downloadFormPdf = (form_id) => {
    setIsLoading((prevState) => ({
      ...prevState,
      [form_id]: { pdf: true, docx: prevState[form_id].docx },
    }));
    fetch(`${process.env.REACT_APP_API_URL}/api/form/download/${form_id}/pdf`, {
      method: "GET",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
      }, // if res.status === 200, then the form is downloaded , else, an error message is sent
      //first, check the status of the response
    }).then((res) => {
      if (res.status === 200) {
        res.blob().then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          //DAE_nom_date.docx
          const name = `DAE_${
            forms.find((form) => form.form_id === form_id).form_data.nom
          }_${
            forms.find((form) => form.form_id === form_id).form_data.date
          }.pdf`;
          a.download = name;
          a.click();
          setIsLoading((prevState) => ({
            ...prevState,
            [form_id]: { pdf: false, docx: prevState[form_id].docx },
          }));
        });
      } else {
        console.log("error downloading form");
        alert("Error downloading form");
        setIsLoading((prevState) => ({
          ...prevState,
          [form_id]: { pdf: false, docx: prevState[form_id].docx },
        }));
      }
    });
  };

  const reloadData = () => {
    const filtresFor = filtersFor.map((user) => user.value).join(",");
    const queryString = new URLSearchParams({
      statut: filtersStatut,
      type: filtersType,
      search: searchFilter,
      forUser: filtresFor,
      date: filterDate,
    }).toString();
    fetch(`${process.env.REACT_APP_API_URL}/api/form?${queryString}`, {
      method: "GET",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        data.forms = data.forms.map((form) => {
          form.form_data = JSON.parse(form.form_data);
          return form;
        });
        setForms(data.forms);
        setNbForms(data.nb);
        console.log("data updated");
        //for each form, set isLoading to false
        data.forms.map((form) => {
          setIsLoading((prevState) => ({
            ...prevState,
            [form.form_id]: { pdf: false, docx: false },
          }));
          return form;
        });
      });
  };

  useEffect(() => {
    reloadData();
  }, [searchFilter, filtersStatut, filtersType, filtersFor, filterDate]);

  const handleSaveReview = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/form/${selectedForm.form_id}`, {
      method: "PUT",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedForm),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        reloadData();
        handleCloseReview();
      });
  };

  const handleAccept = () => {
    // save the form
    fetch(`${process.env.REACT_APP_API_URL}/api/form/${selectedForm.form_id}`, {
      method: "PUT",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedForm),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        // accept the form
        fetch(
          `${process.env.REACT_APP_API_URL}/api/form/accept/${selectedForm.form_id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        )
          .then((res) => res.json())

          .then((data) => {
            console.log(data);
            reloadData();
            handleCloseReview();
          });
      });
  };

  const handleAcceptChecked = () => {
    checkedForms.map((form_id) => {
      fetch(`${process.env.REACT_APP_API_URL}/api/form/accept/${form_id}`, {
        method: "PUT",
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          reloadData();
          handleCloseReview();
        });

      return form_id;
    });
  };

  const handleSetToWaiting = () => {
    fetch(
      `${process.env.REACT_APP_API_URL}/api/form/wait/${selectedForm.form_id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        reloadData();
        handleCloseReview();
      });
  };

  const handleRejectChecked = () => {
    checkedForms.map((form_id) => {
      fetch(`${process.env.REACT_APP_API_URL}/api/form/reject/${form_id}`, {
        method: "PUT",
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: refuseReason }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          reloadData();
          handleCloseReview();
        });

      return form_id;
    });
  };

  const handleDeleteChecked = () => {
    checkedForms.map((form_id) => {
      fetch(`${process.env.REACT_APP_API_URL}/api/form/delete/${form_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          reloadData();
          handleCloseReview();
        });
    });
  };

  const handleReject = () => {
    //ask for a reason
    if (!refuseReason) {
      alert("Veuillez entrer une raison");
      return;
    }

    fetch(
      `${process.env.REACT_APP_API_URL}/api/form/reject/${selectedForm.form_id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: refuseReason }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        reloadData();
        handleCloseReview();
        if (data.message === "Form rejected") {
          alert("Form rejeté");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDelete = () => {
    fetch(
      `${process.env.REACT_APP_API_URL}/api/form/delete/${selectedForm.form_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        reloadData();
        handleCloseReview();
      });
  };

  return (
    <>
      <div className="d-flex justify-content-start align-items-center flex-column w-100 h-100 p-3 pb-5 gap-3">
        <span className="d-flex flex-column justify-content-between align-items-center w-100 py-1 gap-0">
          <h3 className="text-center w-100 p-0 m-0">Admin Dashboard</h3>
          <span className="text-center text-secondary w-100">
            {forms.length} affichés / {nbForms} au total
          </span>
        </span>

        <Button
          variant="primary"
          onClick={() => setShowFilters(!showFilters)}
          className={`d-block d-sm-none w-50 ${
            window.innerWidth < 576 ? "d-block" : "d-none"
          } `}
        >
          {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
        </Button>
        <div
          className={`d-flex flex-row w-100 h-100 gap-3 ${
            window.innerWidth < 576 ? "flex-column" : "flex-row"
          }`}
        >
          <div
            className={`d-flex justify-content-start align-items-center flex-column border p-3 rounded ${
              showFilters ? "mb-3 d-flex" : "d-none"
            } ${window.innerWidth > 576 ? "w-25" : "w-100"}`}
            style={{ height: "fit-content" }}
          >
            <p className="text-center w-100 fw-semibold">Filtres</p>
            <div className="d-flex justify-content-between gap-3 p-3 w-100 flex-column">
              <Form.Control
                type="text"
                placeholder="Rechercher"
                onChange={(e) => {
                  setSearchFilter(e.target.value);
                }}
              />
              {user?.users_permissions === 2 && (
                <Form.Group
                  className={`d-flex mb-3 w-100 ${
                    window.innerWidth < 576
                      ? "flex-row gap-2 align-items-center"
                      : "flex-column"
                  }`}
                  controlId="for"
                >
                  <Form.Label>Reçu par</Form.Label>

                  <MultiSelect // by default, select all users
                    options={users
                      .filter(
                        (user) =>
                          user.users_groups_name !==
                          "Responsables Vie Associative"
                      )
                      .map((user) => ({
                        label: user.users_username,
                        value: user.users_email,
                      }))}
                    value={filtersFor}
                    onChange={(e) => {
                      setFiltersFor(e);
                    }}
                    labelledBy="Select"
                  />
                </Form.Group>
              )}
              <Form.Group
                className={`d-flex mb-3 w-100 ${
                  window.innerWidth < 576
                    ? "flex-row gap-2 align-items-center"
                    : "flex-column"
                }`}
                controlId="statut"
              >
                <Form.Label>Statut</Form.Label>
                <Form.Select
                  onChange={(e) => {
                    setFiltersStatut(e.target.value);
                  }}
                >
                  <option value="">Tous</option>
                  <option
                    selected
                    value={
                      user.users_groups_name === "Responsables Vie Associative"
                        ? "waitingForAdmin"
                        : "to_review"
                    }
                  >
                    A review
                  </option>
                  {user.users_groups_name !==
                    "Responsables Vie Associative" && (
                    <option value="waitingForAdmin">En attente</option>
                  )}
                  <option value="accepted">Accepté</option>
                  <option value="rejected">Rejeté</option>
                </Form.Select>
              </Form.Group>
              <Form.Group
                controlId="date"
                className={`d-flex mb-3 w-100 ${
                  window.innerWidth < 576
                    ? "flex-row gap-2 align-items-center"
                    : "flex-column"
                }`}
              >
                <Form.Label>Date</Form.Label>
                <div className="w-100 d-flex gap-2 align-items-center">
                  <Form.Control
                    type="date"
                    onChange={(e) => {
                      setFilterDate(e.target.value);
                    }}
                  />
                  <CiCircleRemove
                    className="text-secondary"
                    size={"26px"}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setFilterDate("");
                      document.querySelector("#date").value = "";
                    }}
                  />
                </div>
              </Form.Group>
              <Form.Group
                className={`d-flex mb-3 w-100 ${
                  window.innerWidth < 576
                    ? "flex-row gap-2 align-items-center"
                    : "flex-column"
                }`}
                controlId="type"
              >
                <Form.Label>Type</Form.Label>
                <Form.Select
                  onChange={(e) => {
                    setFiltersType(e.target.value);
                  }}
                >
                  <option value="">Tous</option>
                  <option value="DAE">DAE</option>
                </Form.Select>
              </Form.Group>

              {checkedForms.length > 0 && (
                <Form.Group
                  className={`d-flex mb-3 gap-3 w-100 flex-column align-items-center`}
                  controlId="actions"
                >
                  <div className="d-flex gap-3 align-items-center">
                    <p className="m-0 p-0">Télécharger :</p>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="text-black"
                      onClick={() => {
                        checkedForms.map((form_id) => {
                          downloadForm(form_id);
                          return form_id;
                        });
                      }}
                    >
                      <span>.docx</span>
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="text-black"
                      onClick={() => {
                        checkedForms.map((form_id) => {
                          downloadFormPdf(form_id);
                          return form_id;
                        });
                      }}
                    >
                      <span>.pdf</span>
                    </Button>
                  </div>
                  <div className={`d-flex gap-2 flex-column w-100`}>
                    <Button
                      variant="outline-success"
                      onClick={() => {
                        handleAcceptChecked();
                      }}
                    >
                      Accepter Tout
                    </Button>
                    <div className="d-flex gap-3 flex-row w-100">
                      <Form.Control
                        type="text"
                        placeholder="Raison du refus"
                        onChange={(e) => setRefuseReason(e.target.value)}
                      />
                      <Button
                        variant="outline-danger"
                        className="w-50"
                        onClick={() => {
                          handleRejectChecked();
                        }}
                      >
                        Rejeter Tout
                      </Button>
                    </div>
                    <Button
                      variant="outline-danger"
                      onClick={() => {
                        handleDeleteChecked();
                      }}
                    >
                      Supprimer Tout
                    </Button>
                  </div>
                </Form.Group>
              )}
            </div>
          </div>
          <ListGroup className="w-100 h-100 pb-3">
            {forms.map((form, index) => (
              <ListGroup.Item
                key={index}
                className={`d-flex justify-content-between align-items-center ${
                  window.innerWidth < 576 ? "flex-column" : "flex-row"
                } gap-3 border p-3`}
              >
                <div
                  className={`d-flex justify-content-start gap-3 align-items-center ${
                    window.innerWidth < 576 ? "flex-column" : "flex-row"
                  }`}
                >
                  {form.form_type === "DAE" ? (
                    <>
                      <div className="d-flex gap-3 align-items-center">
                        <input
                          type="checkbox"
                          checked={checkedForms.includes(form.form_id)}
                          onChange={(e) => {
                            setCheckedForms(
                              e.target.checked
                                ? [...checkedForms, form.form_id]
                                : checkedForms.filter(
                                    (id) => id !== form.form_id
                                  )
                            );
                          }}
                        />
                        <Badge bg="secondary">DAE</Badge>

                        <span className="d-flex flex-column">
                          <span>
                            {form.form_data.prenom} {form.form_data.nom}
                          </span>
                          <small className="text-muted">
                            {form.form_data.date.split("-").reverse().join("/")}
                          </small>
                        </span>
                      </div>
                      <div className="d-flex gap-3 align-items-center">
                        <span>
                          raison :{" "}
                          <span className="fw-semibold">
                            {form.form_data.motif}
                          </span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <input
                      type="checkbox"
                      checked={checkedForms.includes(form.form_id)}
                      onChange={(e) => {
                        setCheckedForms(
                          e.target.checked
                            ? [...checkedForms, form.form_id]
                            : checkedForms.filter((id) => id !== form.form_id)
                        );
                      }}
                    />
                  )}
                </div>
                <div
                  className={`d-flex justify-content-between h-100 align-items-center gap-3 ${
                    window.innerWidth < 576 ? "flex-column" : "flex-row"
                  }`}
                >
                  <span className="text-muted d-flex flex-row">
                    <small>
                      <span className="d-flex flex-column mx-3">
                        {form.form_statut === "to_review" && (
                          <span className="text-secondary">
                            En attente de{" "}
                            {
                              users.find(
                                (user) => user.users_email === form.form_sentTo
                              )?.users_username
                            }
                          </span>
                        )}
                        {form.form_statut === "waitingForAdmin" && (
                          <>
                            <span className="text-success">
                              Accepté par{" "}
                              {
                                users.find(
                                  (user) =>
                                    user.users_email === form.form_signedByAsso
                                )?.users_username
                              }
                            </span>
                            <span className="text-secondary">
                              En attente de l'admin
                            </span>
                          </>
                        )}
                        {form.form_statut === "accepted" && (
                          <>
                            <span className="text-success">
                              Accepté par{" "}
                              {
                                users.find(
                                  (user) =>
                                    user.users_email === form.form_signedByAsso
                                )?.users_username
                              }
                            </span>
                            <span className="text-success">
                              Accepté par{" "}
                              {
                                users.find(
                                  (user) =>
                                    user.users_email === form.form_signedByAdmin
                                )?.users_username
                              }
                            </span>
                          </>
                        )}
                        {form.form_statut === "rejected" && (
                          <>
                            {form.form_signedByAsso ? (
                              <>
                                <span className="text-success">
                                  Accepté par{" "}
                                  {
                                    users.find(
                                      (user) =>
                                        user.users_email ===
                                        form.form_signedByAsso
                                    )?.users_username
                                  }
                                </span>
                                <span className="text-danger">
                                  Rejeté par l'admin : {form.form_reject_reason}
                                </span>
                              </>
                            ) : (
                              <span className="text-danger">
                                Rejeté par{" "}
                                {
                                  users.find(
                                    (user) =>
                                      user.users_email === form.form_sentTo
                                  )?.users_username
                                }{" "}
                                : {form.form_reject_reason}
                              </span>
                            )}
                          </>
                        )}
                      </span>
                    </small>
                  </span>

                  {form.form_statut === "accepted" && (
                    <div className="d-flex gap-3 h-100 justify-content-between align-items-center">
                      <div className="h-75 border border-right-1" />
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="text-black d-flex flex-row gap-1 align-items-center"
                        onClick={() => {
                          downloadFormPdf(form.form_id);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {isLoading[form.form_id]?.pdf && (
                          <Spinner role="status" animation="border" size="sm">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                        )}
                        <span>.pdf</span>
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="text-black d-flex flex-row gap-1 align-items-center"
                        onClick={() => {
                          downloadForm(form.form_id);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {isLoading[form.form_id]?.docx && (
                          <Spinner role="status" animation="border" size="sm">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                        )}
                        <span>.docx</span>
                      </Button>
                      <div className="h-75 border border-right-1" />
                      <MdEdit
                        color="text-primary"
                        className="border rounded p-1"
                        style={{ cursor: "pointer" }}
                        size={"28px"}
                        onClick={() => {
                          setSelectedForm(form);
                          handleOpenReview();
                        }}
                      />
                      <FaCheck color="green" />
                    </div>
                  )}
                  {form.form_statut === "to_review" && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => {
                        setSelectedForm(form);
                        handleOpenReview();
                      }}
                    >
                      Review
                    </Button>
                  )}
                  {form.form_statut === "waitingForAdmin" &&
                    (user.users_groups_name ===
                    "Responsables Vie Associative" ? (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setSelectedForm(form);
                          handleOpenReview();
                        }}
                      >
                        Review
                      </Button>
                    ) : (
                      <FaHourglassHalf />
                    ))}
                  {form.form_statut === "rejected" && (
                    <div className="d-flex gap-3 justify-content-between align-items-center">
                      <MdEdit
                        color="text-primary"
                        className="border rounded p-1"
                        style={{ cursor: "pointer" }}
                        size={"28px"}
                        onClick={() => {
                          setSelectedForm(form);
                          handleOpenReview();
                        }}
                      />
                      <FaTimes color="red" />
                    </div>
                  )}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      </div>
      <Modal
        show={reviewModal}
        onHide={handleCloseReview}
        animation={false}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title
            className="d-flex
                    flex-row justify-content-between w-100 align-items-center"
          >
            <p className="">{selectedForm?.form_type} - à review</p>
            <FaSave
              className="text-primary mx-4"
              style={{ cursor: "pointer" }}
              onClick={() => {
                handleSaveReview();
              }}
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {selectedForm && selectedForm?.form_type === "DAE" ? (
            <div>
              <Form
                className={`d-flex justify-content-between flex-column w-100 m-auto ${
                  window.innerWidth < 576 ? "px-2" : "px-5"
                }`}
              >
                <div>
                  <div className="d-flex justify-content-between gap-0 gap-sm-3 flex-column flex-sm-row">
                    <Form.Group className="mb-3 w-100" controlId="nom">
                      <Form.Label>Nom</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrez votre nom"
                        required
                        value={selectedForm.form_data.nom}
                        onChange={(e) =>
                          setSelectedForm((prevState) => ({
                            ...prevState,
                            form_data: {
                              ...prevState.form_data,
                              nom: e.target.value,
                            },
                          }))
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-3 w-100" controlId="prenom">
                      <Form.Label>Prénom</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrez votre prénom"
                        required
                        value={selectedForm.form_data.prenom}
                        onChange={(e) =>
                          setSelectedForm((prevState) => ({
                            ...prevState,
                            form_data: {
                              ...prevState.form_data,
                              prenom: e.target.value,
                            },
                          }))
                        }
                      />
                    </Form.Group>
                  </div>
                  <div className="d-flex justify-content-between gap-0 gap-sm-3 flex-column flex-sm-row">
                    <Form.Group className="mb-3 w-100" controlId="classe">
                      <Form.Label>Classe</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrez votre classe"
                        required
                        value={selectedForm.form_data.classe}
                        onChange={(e) =>
                          setSelectedForm((prevState) => ({
                            ...prevState,
                            form_data: {
                              ...prevState.form_data,
                              classe: e.target.value,
                            },
                          }))
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-3 w-100" controlId="groupeTD">
                      <Form.Label>Groupe de TD</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrez votre groupe de TD"
                        required
                        value={selectedForm.form_data.groupeTD}
                        onChange={(e) =>
                          setSelectedForm((prevState) => ({
                            ...prevState,
                            form_data: {
                              ...prevState.form_data,
                              groupeTD: e.target.value,
                            },
                          }))
                        }
                      />
                    </Form.Group>
                  </div>
                  <div
                    className={`d-flex justify-content-between gap-3 ${
                      window.innerWidth < 576 ? "flex-column" : "flex-row"
                    }`}
                  >
                    <Form.Group className="mb-3 w-100" controlId="mail">
                      <Form.Label>Mail</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Entrez votre mail pour recevoir la DAE"
                        required
                        value={selectedForm.form_data.mail}
                        onChange={(e) =>
                          setSelectedForm((prevState) => ({
                            ...prevState,
                            form_data: {
                              ...prevState.form_data,
                              mail: e.target.value,
                            },
                          }))
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-3  w-100" controlId="date">
                      <Form.Label>Date d'absence</Form.Label>
                      <Form.Control
                        type="date"
                        required
                        value={selectedForm.form_data.date}
                        onChange={(e) =>
                          setSelectedForm((prevState) => ({
                            ...prevState,
                            form_data: {
                              ...prevState.form_data,
                              date: e.target.value,
                            },
                          }))
                        }
                      />
                    </Form.Group>
                  </div>
                  <Form.Group className="mb-3 w-100" controlId="motif">
                    <Form.Label>Motif de l'absence</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      required
                      value={selectedForm.form_data.motif}
                      onChange={(e) =>
                        setSelectedForm((prevState) => ({
                          ...prevState,
                          form_data: {
                            ...prevState.form_data,
                            motif: e.target.value,
                          },
                        }))
                      }
                    />
                  </Form.Group>
                </div>
                <div className="d-flex justify-content-between flex-column w-100 mb-3">
                  {selectedForm?.form_data.courses?.map((course, index) => (
                    <div
                      key={index}
                      className="mb-3 d-flex justify-content-between flex-column align-items-center w-100 border p-3"
                    >
                      <div className="d-flex justify-content-between w-100">
                        <p>Cours {index + 1}</p>
                        <CiCircleRemove
                          className="text-secondary"
                          style={{
                            cursor: "pointer",
                            width: "1.5em",
                            height: "1.5em",
                          }}
                          onClick={() => {
                            setSelectedForm((prevState) => ({
                              ...prevState,
                              form_data: {
                                ...prevState.form_data,
                                courses: prevState.form_data.courses.filter(
                                  (course, i) => i !== index
                                ),
                              },
                            }));
                          }}
                        />
                      </div>
                      <Form.Group className="mb-3 w-100" controlId="matiere">
                        <Form.Label>
                          Code et intitulé du cours concerné
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Entrez le code et l'intitulé du cours"
                          required
                          value={selectedForm.form_data.courses[index].matiere}
                          onChange={(e) =>
                            setSelectedForm((prevState) => ({
                              ...prevState,
                              form_data: {
                                ...prevState.form_data,
                                courses: prevState.form_data.courses.map(
                                  (course, i) =>
                                    i === index
                                      ? { ...course, matiere: e.target.value }
                                      : course
                                ),
                              },
                            }))
                          }
                        />
                      </Form.Group>
                      <div
                        className={`d-flex gap-3 w-100 ${
                          window.innerWidth < 576 ? "flex-column" : "flex-row"
                        }`}
                      >
                        <Form.Group
                          className="mb-3 w-100"
                          controlId="heureDebut"
                        >
                          <Form.Label>Heure de début</Form.Label>
                          <Form.Control
                            type="time"
                            required
                            value={
                              selectedForm.form_data.courses[index].heureDebut
                            }
                            onChange={(e) =>
                              setSelectedForm((prevState) => ({
                                ...prevState,
                                form_data: {
                                  ...prevState.form_data,
                                  courses: prevState.form_data.courses.map(
                                    (course, i) =>
                                      i === index
                                        ? {
                                            ...course,
                                            heureDebut: e.target.value,
                                          }
                                        : course
                                  ),
                                },
                              }))
                            }
                          />
                        </Form.Group>
                        <Form.Group className="mb-3 w-100" controlId="heureFin">
                          <Form.Label>Heure de fin</Form.Label>
                          <Form.Control
                            type="time"
                            required
                            value={
                              selectedForm.form_data.courses[index].heureFin
                            }
                            onChange={(e) =>
                              setSelectedForm((prevState) => ({
                                ...prevState,
                                form_data: {
                                  ...prevState.form_data,
                                  courses: prevState.form_data.courses.map(
                                    (course, i) =>
                                      i === index
                                        ? {
                                            ...course,
                                            heureFin: e.target.value,
                                          }
                                        : course
                                  ),
                                },
                              }))
                            }
                          />
                        </Form.Group>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="secondary"
                    className="w-50 m-auto"
                    onClick={() => {
                      setSelectedForm((prevState) => ({
                        ...prevState,
                        form_data: {
                          ...prevState.form_data,
                          courses: [
                            ...prevState.form_data.courses,
                            { matiere: "", heureDebut: "", heureFin: "" },
                          ],
                        },
                      }));
                    }}
                  >
                    {" "}
                    + Ajouter un cours
                  </Button>
                </div>
              </Form>
            </div>
          ) : (
            Object.entries(selectedForm)?.map(([key, value]) => (
              <p>
                {key} - {value}
              </p>
            ))
          )}
        </Modal.Body>
        <Modal.Footer className="w-100 d-flex justify-content-end align-items-center flex-row">
          <Button variant="outline-success" onClick={handleAccept}>
            Signer & envoyer
          </Button>
          <Button variant="outline-warning" onClick={handleSetToWaiting}>
            Attendre
          </Button>
          {refuseReasonInput ? (
            <div className="d-flex gap-2 flex-row rejectanddelete">
              <Form.Control
                type="text"
                className="w-100"
                placeholder="Raison du refus"
                onChange={(e) => setRefuseReason(e.target.value)}
              />
              <Button variant="outline-danger" onClick={handleReject}>
                Rejeter
              </Button>
            </div>
          ) : (
            <Button
              variant="outline-danger"
              className="rejectanddelete"
              onClick={() => setRefuseReasonInput(true)}
            >
              Rejeter
            </Button>
          )}
          <Button variant="outline-danger" onClick={handleDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
