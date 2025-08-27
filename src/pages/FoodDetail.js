import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Badge, Button } from "react-bootstrap";

export default function FoodDetail() {
  const { id } = useParams();
  const [foods, setFoods] = useState([]);
  const [food, setFood] = useState(null);

  useEffect(() => {
    fetch("http://localhost:9999/food")
      .then((response) => response.json())
      .then((result) => {
        setFoods(result);
        const found = result.find((x) => String(x.id) === String(id));
        setFood(found || null);
      })
      .catch((err) => console.error(err));
  }, [id]);

  if (!food) return <div>Đang tải...</div>;

  return (
    <div className="food-detail">
      <img
        src={food.image}
        alt={food.title}
        className="detail-cover mb-3"
      />
      <h3 className="mb-2">{food.title}</h3>

      <div className="mb-3">
        {(food.tags || []).map((t) => (
          <Badge key={t} bg="secondary" className="me-1">{t}</Badge>
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
      <ol>
        {(food.steps || []).map((s, idx) => (
          <li key={idx} className="mb-2">{s.text}</li>
        ))}
      </ol>

      <Link to="/all">
        <Button variant="secondary" className="mt-2">← Quay lại</Button>
      </Link>
    </div>
  );
}