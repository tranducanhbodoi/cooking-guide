import { useState, useEffect, forwardRef } from "react";
import { Bookmark, BookmarkFill } from "react-bootstrap-icons";
import { Dropdown, Modal, Button, Form } from "react-bootstrap";

export default function CollectionButton({
  foodId,
  size = 22,
  color = "#66b2ff",
  onChange,
}) {
  const userId = String(localStorage.getItem("userId") || "1");
  const fId = String(foodId);

  const [collections, setCollections] = useState([]);
  const [inCollections, setInCollections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetch(`http://localhost:9999/collections?userId=${userId}`)
      .then((r) => r.json())
      .then(async (cols) => {
        setCollections(cols);
        const items = await fetch(
          `http://localhost:9999/collectionItems?foodId=${fId}`
        ).then((r) => r.json());
        setInCollections(items.map((it) => String(it.collectionId)));
      });
  }, [userId, fId]);

  const toggleCollection = async (colId) => {
    const idStr = String(colId);

    if (inCollections.includes(idStr)) {
      
      const items = await fetch(
        `http://localhost:9999/collectionItems?collectionId=${idStr}&foodId=${fId}`
      ).then((r) => r.json());

      for (const it of items) {
        await fetch(`http://localhost:9999/collectionItems/${it.id}`, {
          method: "DELETE",
        });
      }

      setInCollections((prev) => prev.filter((x) => x !== idStr));
      onChange?.({ type: "removed", foodId: fId, collectionId: idStr });
    } else {
      
      const res = await fetch("http://localhost:9999/collectionItems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId: idStr, foodId: fId }),
      });
      const created = await res.json();
      setInCollections((prev) => [...prev, idStr]);
      onChange?.({ type: "added", foodId: fId, collectionId: idStr });
    }
  };
  const createNewCollection = async () => {
    if (!newName.trim()) return;
    const res = await fetch("http://localhost:9999/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, name: newName }),
    });
    const newCol = await res.json();
    await toggleCollection(newCol.id);
    setCollections([...collections, newCol]);
    setShowModal(false);
    setNewName("");
  };
  const IconToggle = forwardRef(({ onClick }, ref) => (
  <button
    ref={ref}
    className="icon-btn icon-toggle"
    onClick={(e) => { e.preventDefault(); onClick(e); }}
    aria-label="Bộ sưu tập"
  >
    {inCollections.length > 0
      ? <BookmarkFill size={size} color={color} />
      : <Bookmark size={size} />
    }
  </button>
));
  return (
    <>
      <Dropdown align="end">
        <Dropdown.Toggle as={IconToggle} />

        <Dropdown.Menu>
          {collections.map((c) => (
            <Dropdown.Item key={c.id} onClick={() => toggleCollection(c.id)}>
              {c.name} {inCollections.includes(String(c.id)) && "✓"}
            </Dropdown.Item>
          ))}
          <Dropdown.Divider />
          <Dropdown.Item onClick={() => setShowModal(true)}>
            + Bộ sưu tập mới
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tạo bộ sưu tập mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            placeholder="Tên bộ sưu tập"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={createNewCollection}>
            Tạo
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
