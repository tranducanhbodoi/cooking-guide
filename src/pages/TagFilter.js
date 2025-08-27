import React, { useEffect, useState } from "react";
import { Form, Card } from "react-bootstrap";

export default function TagFilter({selectedTags, setSelectedTags}) {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetch("http://localhost:9999/tags")
      .then((response) => response.json())
      .then((result) => setTags(result))
      .catch((err) => console.error(err));
  }, []);
  const handleChange = (key) => {
  if (selectedTags.includes(key)) {
    setSelectedTags(selectedTags.filter((t) => t !== key));
  } else {
    setSelectedTags([...selectedTags, key]);
  }
};
  return (
    <Card>
      <Card.Body>
        <Card.Title className="fs-6">Lọc theo tag</Card.Title>
        <div className="tag-list-scroll">
          {tags.map((t) => (
            <Form.Check
              key={t.key}
              type="checkbox"
              id={`tag-${t.key}`}
              label={t.label}
              checked={selectedTags.includes(t.key)}
              onChange={() => {handleChange(t.key)}}
            />
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}