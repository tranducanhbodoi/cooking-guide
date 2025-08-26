import { useEffect, useState } from "react";
import { Row, Col, Card, Button, Badge, Pagination } from "react-bootstrap";
import { Link } from "react-router-dom";
import TagFilter from "./TagFilter";
import FavoriteButton from "../components/FavoriteButton";

import { useContext } from "react";
import { SearchContext } from "../context/SearchContext";

export default function Food({ mode }) {
  const [foods, setFoods] = useState([]);
  const [data, setData] = useState([]);
  const [favFoodIds, setFavFoodIds] = useState([]);
  const userId = String(localStorage.getItem("userId") || "1");

  const { search } = useContext(SearchContext);
  const [selectedTags, setSelectedTags] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleFavChange = (evt) => {
    const idStr = String(evt.foodId);
    if (evt.type === "added") {
      setFavFoodIds((prev) => (prev.includes(idStr) ? prev : [...prev, idStr]));
    } else if (evt.type === "removed") {
      setFavFoodIds((prev) => prev.filter((x) => x !== idStr));
      if (mode === "favorite") {
        setFoods((prev) => prev.filter((x) => String(x.id) !== idStr));
      }
    }
  };

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
    fetch(`http://localhost:9999/favorites?userId=${userId}`)
      .then((r) => r.json())
      .then((arr) => {
        const ids = arr.map((x) => String(x.foodId));
        setFavFoodIds(ids);
      })
      .catch(console.error);
  }, [userId]);

  useEffect(() => {
    let filtered = data;

    if (mode === "favorite") {
      filtered = filtered.filter((f) => favFoodIds.includes(String(f.id)));
    }

    if (search.trim() !== "") {
      filtered = filtered.filter((f) =>
        f.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((f) =>
        f.tags.some((t) => selectedTags.includes(t))
      );
    }

    setFoods(filtered);
    setCurrentPage(1);
  }, [mode, favFoodIds, search, selectedTags, data]);

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
                    <Card.Title className="fs-6 mb-2 d-flex justify-content-between align-items-center">
                      <span>{f.title}</span>

                      <FavoriteButton foodId={f.id} size={22} onChange={handleFavChange} />
                    </Card.Title>

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
