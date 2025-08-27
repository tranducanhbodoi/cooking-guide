import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Badge, Button, Col, Row } from "react-bootstrap";
import FavoriteButton from "../components/FavoriteButton";
import CollectionButton from "../components/CollectionButton";
export default function FoodDetail() {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    fetch(`http://localhost:9999/food/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không tải được món ăn");
        return res.json();
      })
      .then((item) => {
        if (!ignore) setFood(item || null);
      })
      .catch((err) => {
        console.error(err);
        fetch("http://localhost:9999/food")
          .then((r) => r.json())
          .then((list) => {
            if (!ignore) {
              const found = Array.isArray(list)
                ? list.find((x) => String(x.id) === String(id))
                : null;
              setFood(found || null);
            }
          })
          .catch((e) => console.error(e));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) return <div>Đang tải...</div>;
  if (!food) return <div>Không tìm thấy món.</div>;

  const tags = Array.isArray(food.tags) ? food.tags : [];

  return (
    <div className="food-detail ">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, flex: 1 }}>{food.title}</h3>
        <span className="icon-row">
          <FavoriteButton foodId={food.id} size={22} onChange={() => {}} />
          <CollectionButton foodId={food.id} size={20} />
        </span>
      </div>

      {food.image && (
        <div style={{ textAlign: "center" }}>
          <img
            src={food.image}
            alt={food.title}
            className="detail-cover mb-3"
            style={{
              width: "60%",
              height: "500px",
              objectFit: "cover",
              borderRadius: "12px",
              display: "block",
              margin: "0 auto",
            }}
          />
        </div>
      )}

      <div className="mb-3">
        {tags.map((t) => (
          <Badge key={String(t)} bg="secondary" className="me-1">
            {t}
          </Badge>
        ))}
      </div>

      <div className="mb-3">
        <strong>Chuẩn bị:</strong> {food.prepTime} phút &nbsp;|&nbsp;
        <strong>Nấu:</strong> {food.cookTime} phút &nbsp;|&nbsp;
        <strong>Độ khó:</strong> {food.difficulty}
      </div>

      <h6>Nguyên liệu</h6>
      <ul>
        {(food.ingredients || []).map((ing, idx) => (
          <li key={idx}>
            {ing.name} {ing.qty ? `- ${ing.qty}` : ""} {ing.unit || ""}
          </li>
        ))}
      </ul>

      <h6>Các bước</h6>
      <Row>
        {(food.steps || []).map((s, idx) => (
          <Col md={6} key={idx} className="mb-4">
            <div className="p-2 border rounded h-100">
              <strong>Bước {idx + 1}:</strong>
              <p style={{ marginTop: 8 }}>{s.text || s}</p>
              {s.images && s.images.length > 0 && (
                <div>
                  {s.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`step-${idx + 1}-${i}`}
                      style={{
                        width: "100%",
                        height: 400,
                        objectFit: "cover",
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}
