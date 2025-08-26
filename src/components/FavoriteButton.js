import { useEffect, useState } from "react";
import { Heart, HeartFill } from "react-bootstrap-icons";

export default function FavoriteButton({ foodId, size = 22, color = "#66b2ff", onChange }) {
 
  const userId = String(localStorage.getItem("userId") || "1");
  const fId = String(foodId);

  const [favId, setFavId] = useState(null); 

  
  useEffect(() => {
    fetch(`http://localhost:9999/favorites?userId=${userId}&foodId=${fId}`)
      .then((r) => r.json())
      .then((arr) => setFavId(arr[0]?.id || null))
      .catch(console.error);
  }, [userId, fId]);

  const toggle = async (e) => {
    if (e?.stopPropagation) e.stopPropagation();
    try {
      if (!favId) {
        
        const res = await fetch("http://localhost:9999/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, foodId: fId })
        });
        const created = await res.json();
        setFavId(created.id);
        onChange?.({ type: "added", foodId: fId, favId: created.id });
      } else {
        
        await fetch(`http://localhost:9999/favorites/${favId}`, { method: "DELETE" });
        setFavId(null);
        onChange?.({ type: "removed", foodId: fId });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button className="heart-btn" onClick={toggle} aria-label="Yêu thích">
      {favId ? <HeartFill size={size} color={color} /> : <Heart size={size} />}
    </button>
  );
}