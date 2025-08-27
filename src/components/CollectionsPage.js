import { useEffect, useState } from "react";
import { Card, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const userId = String(localStorage.getItem("userId") || "1");

  useEffect(() => {
    fetch(`http://localhost:9999/collections?userId=${userId}`)
      .then(r => r.json())
      .then(setCollections)
      .catch(console.error);
  }, [userId]);

  return (
    <div>
      <Card>
        <Card.Body>
          <Card.Title className="fs-5 mb-3">Bộ sưu tập của bạn</Card.Title>
          <ListGroup>
            {collections.map(c => (
              <ListGroup.Item key={c.id} className="d-flex justify-content-between align-items-center">
                <Link to={`/user/collections/${c.id}`} className="text-decoration-none">
                  {c.name}
                </Link>
              </ListGroup.Item>
            ))}
            {collections.length === 0 && (
              <div className="text-muted p-3">Chưa có bộ sưu tập nào.</div>
            )}
          </ListGroup>
        </Card.Body>
      </Card>
    </div>
  );
}