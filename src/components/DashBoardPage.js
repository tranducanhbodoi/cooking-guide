import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./DashBoardPage.css";

export default function DashboardPage() {
  const [foods, setFoods] = useState([]);
  const [users, setUsers] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:9999/food").then((r) => r.json()),
      fetch("http://localhost:9999/users").then((r) => r.json()),
      fetch("http://localhost:9999/favorites").then((r) => r.json()),
    ]).then(([foodsData, usersData, favoritesData]) => {
      setFoods(foodsData);
      setUsers(usersData);
      setChefs(usersData.filter((u) => u.role === "CHEF"));
      setCustomers(usersData.filter((u) => u.role === "USER"));
      setFavorites(favoritesData);
    });
  }, []);

  const data = chefs.map((c) => {
    const count = foods.filter((f) => f.chefId === c.id).length;
    return { name: c.name, count };
  });

  const userIdsWithFav = new Set(favorites.map((f) => f.userId.toString()));
  const activeUsers = customers.filter((u) =>
    userIdsWithFav.has(u.id.toString())
  ).length;
  const inactiveUsers = customers.length - activeUsers;

  const pieData = [
    { name: "Người dùng có tương tác", value: activeUsers },
    { name: "Người dùng chỉ xem", value: inactiveUsers },
  ];

  const COLORS = ["#82ca9d", "#ffc658"];

  return (
    <div className="p-4">
      <h2 className="mb-4">Tổng quan</h2>
      <div className="stat-cards mb-4">
        <div className="stat-card">
          <h3>{users.length}</h3>
          <p>Tổng số User (tất cả)</p>
        </div>
        <div className="stat-card">
          <h3>{chefs.length}</h3>
          <p>Tổng số Chef</p>
        </div>
        <div className="stat-card">
          <h3>{customers.length}</h3>
          <p>Tổng số Khách truy cập</p>
        </div>
        <div className="stat-card">
          <h3>{foods.length}</h3>
          <p>Tổng số món ăn</p>
        </div>
      </div>

      <h2>Thống kê số món theo Chef</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            label={{ value: "Tên Chef", position: "bottom", offset: 10 }}
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

      <h2 className="mt-8">Thống kê hành vi người dùng</h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            outerRadius={150}
            fill="#8884d8"
            label
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
