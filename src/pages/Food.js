import { useEffect, useState } from "react";
import { Row, Col, Card, Button, Badge, Pagination } from "react-bootstrap";
import { Link } from "react-router-dom";
import TagFilter from "./TagFilter";

import { useContext } from "react";
import { SearchContext } from "../context/SearchContext";

export default function Food({ mode }) {
  const [foods, setFoods] = useState([]);
  const [data, setData] = useState([]);

  const { search } = useContext(SearchContext);
  const [selectedTags, setSelectedTags] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetch("http://localhost:9999/food")
      .then((response) => response.json())
      .then((result) => {
        setFoods(result);
        setData(result);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    let filtered = data;

    // Search theo title
    if (search.trim() !== "") {
      filtered = filtered.filter((f) =>
        f.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter theo tag (chỉ lấy món có ít nhất 1 tag thuộc selectedTags)
    if (selectedTags.length > 0) {
      filtered = filtered.filter((f) =>
        f.tags.some((t) => selectedTags.includes(t))
      );
    }

    setFoods(filtered);
    setCurrentPage(1); // reset về trang 1 khi search hoặc filter
  }, [search, selectedTags, data]);

  const totalPages = Math.ceil(foods.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFoods = foods.slice(startIndex, endIndex);

  return (
    <Row>
      <Col md={9} className="food-list">
        <Row className="row-cols-2 row-cols-md-3 g-3">
          {currentFoods.length > 0 ? (
            currentFoods.map((f) => (
              <Col key={f.id}>
                <Card className="h-100">
                  <Card.Img
                    variant="top"
                    src={f.image}
                    alt={f.title}
                    style={{ height: 200, objectFit: "cover" }}
                  />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="fs-6 mb-2">{f.title}</Card.Title>
                    <div className="mb-2">
                      {(f.tags || []).slice(0, 3).map((t) => (
                        <Badge key={t} bg="secondary" className="me-1">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-auto">
                      <Link to={`/user/food/${f.id}`}>
                        <Button size="sm" className="btn-detail">
                          Xem chi tiết
                        </Button>
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <div className="text-center w-100 py-5">
              <h6>Không có món bạn muốn</h6>
            </div>
          )}
        </Row>

        <div className="d-flex justify-content-center mt-3">
          <Pagination size="sm">
            <Pagination.Prev
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            />
            {[...Array(totalPages)].map((_, idx) => (
              <Pagination.Item
                key={idx + 1}
                active={idx + 1 === currentPage}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            />
          </Pagination>
        </div>
      </Col>

      <Col md={3} className="mt-3 mt-md-0">
        <TagFilter
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />
      </Col>
    </Row>
  );
}
