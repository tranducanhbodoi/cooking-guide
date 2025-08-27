import { useEffect, useState } from "react";
import { Row, Col, Card, Button, Badge, Pagination } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import TagFilter from "./TagFilter";
import FavoriteButton from "../components/FavoriteButton";
import CollectionButton from "../components/CollectionButton";
import { useContext } from "react";
import { SearchContext } from "../context/SearchContext";

export default function Food({ mode }) {
  const [foods, setFoods] = useState([]);
  const [data, setData] = useState([]);
  const [favFoodIds, setFavFoodIds] = useState([]);

  const [colFoodIds, setColFoodIds] = useState([]);
  const [collectionName, setCollectionName] = useState("");

  const userId = String(localStorage.getItem("userId") || "1");

  const { search } = useContext(SearchContext);
  const [selectedTags, setSelectedTags] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { id: paramCollectionId } = useParams();
  const collectionId = paramCollectionId ? String(paramCollectionId) : null;

  const navigate = useNavigate();

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

  const handleCollectionChange = (evt) => {
    const fid = String(evt.foodId);
    const cid = String(evt.collectionId);
    if (evt.type === "removed") {
      setColFoodIds((prev) => {
        const next = prev.filter((x) => x !== fid);
        setFoods((cur) => cur.filter((x) => String(x.id) !== fid));

        // nếu bộ sưu tập đang xem trở thành trống thì xóa hẳn collection trong db
        if (
          mode === "collection" &&
          collectionId === cid &&
          next.length === 0
        ) {
          fetch(`http://localhost:9999/collections/${collectionId}`, {
            method: "DELETE",
          })
            .catch(console.error)
            .finally(() => navigate("/user/collections"));
        }

        return next;
      });
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
    if (mode !== "collection" || !collectionId) {
      setColFoodIds([]);
      setCollectionName("");
      return;
    }
    fetch(`http://localhost:9999/collectionItems?collectionId=${collectionId}`)
      .then((r) => r.json())
      .then((arr) => setColFoodIds(arr.map((x) => String(x.foodId))))
      .catch(console.error);

    fetch(`http://localhost:9999/collections/${collectionId}`)
      .then((r) => r.json())
      .then((col) => setCollectionName(col.name))
      .catch(console.error);
  }, [mode, collectionId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTags]);

  useEffect(() => {
    let filtered = data;

    if (mode === "collection") {
      filtered = filtered.filter((f) => colFoodIds.includes(String(f.id)));
    }

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
  }, [mode, colFoodIds, favFoodIds, search, selectedTags, data]);

  const totalPages = Math.ceil(foods.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFoods = foods.slice(startIndex, endIndex);

  return (
    <Row>
      {mode === "collection" && (
        <h5 className="mb-3">Bộ sưu tập: {collectionName}</h5>
      )}
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
                      <div>
                        <FavoriteButton
                          foodId={f.id}
                          size={22}
                          onChange={handleFavChange}
                        />
                        <CollectionButton
                          foodId={f.id}
                          size={20}
                          onChange={handleCollectionChange}
                        />
                      </div>
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
              <h6>Không có món nào</h6>
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
