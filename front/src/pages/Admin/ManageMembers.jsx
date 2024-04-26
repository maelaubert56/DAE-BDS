import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/esm/Button";
import { FaEdit, FaStar } from "react-icons/fa";
import Accordion from "react-bootstrap/Accordion";

export default function ManageMembers() {
  const [user, setUser] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  const loadDatas = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
      method: "GET",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const users = data.users;
        setUsers(users);
      });

    fetch(`${process.env.REACT_APP_API_URL}/api/groups`, {
      method: "GET",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const groups = data.groups;
        setGroups(groups);
      });
  };

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
        });
      loadDatas();
    } else {
      window.location.href = "/login";
    }
  }, []);

  const deleteGroup = (groupName) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/groups/${groupName}`, {
      method: "DELETE",
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
        loadDatas();
      });
  };

  return (
    <div className="container w-100 h-100 d-flex gap-1 flex-column justify-content-start align-items-center">
      <div className="d-flex w-100 gap-0 flex-column justify-content-between align-items-center">
        <h2 className="text-center p-0 m-0 pt-2">Manage Members</h2>
        <div className="d-flex gap-1 flex-row justify-content-between align-items-center">
          <Button href="/admin/add-member" className="my-3">
            Create Member
          </Button>
          <Button href="/admin/add-group" className="my-3">
            Create Group
          </Button>
        </div>
      </div>
      <div
        className={`d-flex gap-1 flex-column justify-content-between align-items-center ${
          window.innerWidth < 768 ? "w-100" : "w-50"
        }`}
      >
        {
          // map throught all the users[i].group
          groups?.map((group) => {
            return (
              <Accordion key={group.users_groups_name} className="w-100">
                <Accordion.Item eventKey={group.users_groups_name}>
                  <Accordion.Header>
                    <img
                      src={
                        group.users_groups_type === "ADMIN"
                          ? "/icon_pantheon.png"
                          : "/logo192.png"
                      }
                      alt="group"
                      className="group-icon mx-2"
                      style={{ width: "20px", height: "20px" }}
                    />
                    {group.users_groups_name} (
                    {
                      users.filter(
                        (user) =>
                          user.users_groups_name === group.users_groups_name
                      ).length
                    }
                    )
                  </Accordion.Header>
                  <Accordion.Body>
                    <div className="d-flex w-100 gap-1 flex-column justify-content-between align-items-center">
                      {
                        // if there is no users in the group
                        users.filter(
                          (user) =>
                            user.users_groups_name === group.users_groups_name
                        ).length === 0 && (
                          <div className="d-flex w-100 flex-row justify-content-center align-items-center border-bottom py-2 gap-3">
                            <span>Ce groupe est vide...</span>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                deleteGroup(group.users_groups_name);
                              }}
                            >
                              Supprimer
                            </Button>
                          </div>
                        )
                      }
                      {
                        // map throught all the users[i]
                        users.map((user, i) => {
                          if (
                            user.users_groups_name === group.users_groups_name
                          ) {
                            return (
                              <div
                                key={i}
                                className="d-flex w-100 gap-1 flex-column justify-content-between align-items-center border-bottom py-2"
                              >
                                <div className="d-flex w-100 gap-1 flex-row justify-content-between align-items-center">
                                  <div className="d-flex w-100 gap-1 flex-column justify-content-between align-items-start">
                                    <span className="fw-semibold d-flex gap-2 flex-row justify-content-between align-items-center">
                                      {user.users_username}
                                      {user.users_permissions == 2 ? (
                                        <FaStar className="text-warning" />
                                      ) : (
                                        user.users_permissions == 1 && (
                                          <FaStar className="text-default" />
                                        )
                                      )}
                                    </span>
                                    <span>{user.users_email}</span>
                                  </div>
                                  <Button
                                    href={`/admin/edit-member/${user.users_email}`}
                                  >
                                    Edit
                                  </Button>
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
}
