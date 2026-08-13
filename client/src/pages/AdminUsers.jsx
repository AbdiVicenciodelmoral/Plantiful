import { useEffect, useState } from "react";

const roles = ["user", "manager", "admin"];

function AdminUsers({ onNavigate }) {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("Loading users...");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const response = await fetch("/api/admin/users", {
      credentials: "include",
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || "Could not load users.");
      return;
    }

    setUsers(data.users || []);
    setStatus("");
  }

  async function updateRole(userId, role) {
    setMessage("");

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        role,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Could not update user.");
      return;
    }

    setMessage(data.message || "User updated.");
    await loadUsers();
  }

  async function deleteUser(userId) {
    setMessage("");

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Could not delete user.");
      return;
    }

    setMessage(data.message || "User deleted.");
    setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
  }

  if (status) {
    return (
      <main className="page-shell admin-page">
        <button className="text-link-button" type="button" onClick={() => onNavigate("admin")}>
          Back to admin
        </button>
        <p>{status}</p>
      </main>
    );
  }

  return (
    <main className="page-shell admin-page">
      <button className="text-link-button" type="button" onClick={() => onNavigate("admin")}>
        Back to admin
      </button>

      <section className="page-heading">
        <p className="section-eyebrow">Admin</p>
        <h1>Manage Users</h1>
        <p>Delete accounts and change roles for Plantiful users.</p>
      </section>

      {message && <p className="success">{message}</p>}

      <section className="admin-table">
        <div className="admin-table-head admin-user-row">
          <span>ID</span>
          <span>Username</span>
          <span>Email</span>
          <span>Role</span>
          <span>Actions</span>
        </div>

        {users.map((user) => (
          <article className="admin-user-row" key={user.id}>
            <span>{user.id}</span>
            <strong>{user.username}</strong>
            <span>{user.email || "none"}</span>
            <select value={user.role} onChange={(event) => updateRole(user.id, event.target.value)}>
              {roles.map((role) => (
                <option value={role} key={role}>
                  {role}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => deleteUser(user.id)}>
              Delete
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}

export default AdminUsers;
