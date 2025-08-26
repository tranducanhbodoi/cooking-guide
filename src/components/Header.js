import { useEffect, useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import AvatarMenu from "./AvatarMenu";
import { Link } from "react-router-dom";

import { useContext } from "react";
import { SearchContext } from "../context/SearchContext";

export default function Header() {
  const [users, setUsers] = useState([]);
  const [currentUser, setUser] = useState(null);
  const {search, setSearch} = useContext(SearchContext);

  useEffect(() => {
    fetch("http://localhost:9999/users")
      .then((response) => response.json())
      .then((result) => {
        setUsers(result);
        const u =
          result.find((x) => (x.role || "").toUpperCase() === "USER") ||
          result[0] ||
          null;
        setUser(u);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="app-header sticky-top py-2">
      <Container fluid>
        <Row className="align-items-center">
          <Col md={3} xs={12} className="mb-2 mb-md-0">
            <Link to="/all" className="logo-link text-white text-decoration-none">
              <span className="logo-box me-2">🍳</span>
              <strong>RecipeBook</strong>
            </Link>
          </Col>

          <Col md={8} xs={10} className="mb-2 mb-md-0">
            
              <Form.Control
                type="text"
                placeholder="Tìm công thức..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            
          </Col>

          <Col md={1} xs={2} className="text-end">
            <AvatarMenu user={currentUser} />
          </Col>
        </Row>
      </Container>
    </div>
  );
}