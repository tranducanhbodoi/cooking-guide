import { useEffect, useState } from "react";
import { Container, Table, Row, Col, Form, Card, Badge, Button } from "react-bootstrap";
import "./AdminPage.css"; 

export default function AdminPage({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState([]);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("USER");

  useEffect(() => {
    fetch("http://localhost:9999/users")
      .then((response) => response.json())
      .then((result) => {
        setUsers(result);
        setUser(result);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    let data = [...user];

    if (roleFilter.length > 0 && !roleFilter.includes("all")) {
      data = data.filter(u => roleFilter.includes(u.role));
    }

    if (search.trim() !== "") {
      data = data.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (data.length === 0) {
      setMessage("Không tìm thấy người dùng");
      setUsers([]);
    } else {
      setMessage("");
      setUsers(data);
    }
  }, [search, roleFilter, user]);

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    if (value === "all") {
      if (checked) setRoleFilter(["all"]);
      else setRoleFilter([]);
    } else {
      if (checked) setRoleFilter(prev => [...prev.filter(r => r !== "all"), value]);
      else setRoleFilter(prev => prev.filter(r => r !== value));
    }
  };

  const roles = Array.from(new Set(user.map(u => u.role)));

  const handleAddUser = (e) => {
    e.preventDefault();

    const newUser = {
      id: Date.now().toString(),
      name: newName,
      email: newEmail,
      password: newPassword,
      role: newRole
    };

    fetch("http://localhost:9999/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    })
    .then(res => res.json())
    .then(data => {
      setUsers(prev => [...prev, data]);
      setUser(prev => [...prev, data]);
      setShowForm(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("USER");
    })
    .catch(err => console.error(err));
  };

  return (
    <Container fluid className="admin-page">
      <Row className="header-row align-items-center mb-4">
        <Col className="d-flex justify-content-between align-items-center">
          <h3 className="admin-greeting">Xin chào, Admin</h3>
          <Button variant="danger" onClick={onLogout}>Đăng xuất</Button>
        </Col>
      </Row>

      <Row className="header-row mb-3">
        <Col>
          <h1 className="page-title">Quản Lý Người Dùng</h1>
          <p className="page-subtitle">Tìm kiếm và lọc người dùng theo vai trò</p>
        </Col>
        <Col className="d-flex justify-content-end align-items-center">
          <Button variant="success" onClick={() => setShowForm(true)}>Thêm User</Button>
        </Col>
      </Row>

      {showForm && (
        <Row className="mb-4">
          <Col>
            <Card className="p-3">
              <h5>Thêm User Mới</h5>
              <Form onSubmit={handleAddUser}>
                <Form.Group className="mb-2">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" value={newName} onChange={e => setNewName(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Role</Form.Label>
                  <Form.Select value={newRole} onChange={e => setNewRole(e.target.value)} required>
                    <option value="USER">USER</option>
                    <option value="CHEF">CHEF</option>
                    <option value="ADMIN">ADMIN</option>
                  </Form.Select>
                </Form.Group>
                <Button type="submit" variant="primary" className="me-2">Thêm</Button>
                <Button variant="secondary" onClick={() => setShowForm(false)}>Hủy</Button>
              </Form>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="controls-row mb-3">
        <Col xs={12} md={4} className="search-col">
          <Form.Group>
            <Form.Label>Tìm kiếm theo tên</Form.Label>
            <Form.Control
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nhập tên người dùng..."
              className="search-input"
            />
          </Form.Group>
          {message && <p className="message">{message}</p>}
        </Col>

        <Col xs={12} md={8} className="filter-col">
          <Card className="filter-card">
            <Form.Label>Lọc người dùng theo vai trò:</Form.Label>
            <div className="filter-options">
              <Form.Check
                inline
                label={<Badge className={roleFilter.includes("all") ? "selected" : ""}>Tất cả</Badge>}
                type="checkbox"
                value="all"
                checked={roleFilter.includes("all")}
                onChange={handleRoleChange}
              />
              {roles.map((r, idx) => (
                <Form.Check
                  inline
                  key={idx}
                  label={<Badge className={roleFilter.includes(r) ? "selected" : ""}>{r}</Badge>}
                  type="checkbox"
                  value={r}
                  checked={roleFilter.includes(r)}
                  onChange={handleRoleChange}
                />
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="table-card">
            <Table striped bordered hover responsive className="user-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr key={u.id}>
                    <td>{index + 1}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><Badge bg="info" text="dark">{u.role}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
