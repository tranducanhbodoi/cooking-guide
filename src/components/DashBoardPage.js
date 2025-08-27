// DashboardPage.js
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [foods, setFoods] = useState([]);
  const [chefs, setChefs] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:9999/food").then((r) => r.json()),
      fetch("http://localhost:9999/users").then((r) => r.json()), // lấy danh sách user
    ]).then(([foodsData, usersData]) => {
      setFoods(foodsData);
      setChefs(usersData.filter((u) => u.role === "CHEF"));
    });
  }, []);

  // Tính số lượng món theo chefId
  const data = chefs.map((c) => {
    const count = foods.filter((f) => f.chefId === c.id).length;
    return { name: c.name, count };
  });

  return (
    <div className="p-4">
      <h2>Thống kê số món theo Chef</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            label={{
              value: "Tên Chef",
              position: "bottom",
              offset: 10,
            }}
          />
          <YAxis
            label={{
              value: "Số lượng món",
              angle: -90,
              position: "insideLeft",
              offset: -5,
            }}
          />
          <Tooltip />
          <Bar dataKey="count" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
