import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import ImageGallery from "./pages/Home/ImageGallery";
import Login from "./pages/Admin/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import GenericGallery from "./pages/Home/GenericGallery";

function App() {
  return (
    <>
      <div className="gradient_background">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:categoryId" element={<GenericGallery galleryType="album" />} />
          <Route path="/:categoryId/:galleryId" element={<ImageGallery />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <GenericGallery galleryType="gallery" collectionName="albumCategories" adminMode={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/:categoryId"
            element={
              <ProtectedRoute>
                <GenericGallery galleryType="album" adminMode={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/:categoryId/:galleryId"
            element={
              <ProtectedRoute>
                <ImageGallery adminMode={true} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
