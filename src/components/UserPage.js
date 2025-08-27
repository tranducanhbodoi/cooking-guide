import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Routes, Route, Navigate } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";
import Food from "../pages/Food";
import FoodDetail from "../pages/FoodDetail";

import "./style.css"
export default function UserPage({ onLogout }) {
  return (
    <>
      
      <Header onLogout={onLogout}/>

      
      <Container fluid className="mt-3">
        <Row>
          <Col md={2} className="mb-3">
            <Sidebar />
          </Col>

          <Col md={10}>
            <Routes>
              <Route path="/" element={<Navigate to="all" replace />} />
              <Route path="all" element={<Food mode="all" />} />
              <Route path="favorite" element={<Food mode="favorite" />} />
              <Route path="collections" element={<Food mode="collections" />} />
              <Route path="food/:id" element={<FoodDetail />} />
              <Route path="*" element={<div>404 — Không tìm thấy trang</div>} />
            </Routes>
          </Col>
        </Row>
      </Container>
    </>
  );
}
