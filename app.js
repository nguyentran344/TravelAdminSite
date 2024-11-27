const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const multer = require("multer");
const path = require("path");

const app = express();

// Configuración de EJS y middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));

// Configuración de Multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// API base URL
const API_BASE_URL = "https://api-ltdd-flutter-5wp1.onrender.com/v1/tour";

// Ruta principal - Lista de Tours
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(API_BASE_URL);
    res.render("tours/index", { tours: response.data });
  } catch (error) {
    res.status(500).send("Error fetching tours");
  }
});

// Formulario de Nuevo Tour
app.get("/tours/new", (req, res) => {
  res.render("tours/new");
});

// Crear Nuevo Tour
app.post("/tours", upload.single("avatar"), async (req, res) => {
  try {
    const tourData = {
      cityName: req.body.cityName,
      countryName: req.body.countryName,
      price: req.body.price,
      startDate: req.body.startDate,
      duration: req.body.duration,
      avatar: req.file ? `/uploads/${req.file.filename}` : "",
    };

    await axios.post(API_BASE_URL, tourData);
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error creating tour");
  }
});

// Formulario de Edición de Tour
app.get("/tours/edit/:id", async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${req.params.id}`);
    res.render("tours/edit", { tour: response.data });
  } catch (error) {
    res.status(500).send("Error fetching tour");
  }
});

// Actualizar Tour
app.put("/tours/:id", upload.single("avatar"), async (req, res) => {
  try {
    const tourData = {
      cityName: req.body.cityName,
      countryName: req.body.countryName,
      price: req.body.price,
      startDate: req.body.startDate,
      duration: req.body.duration,
    };

    // Si se sube una nueva imagen, actualizar avatar
    if (req.file) {
      tourData.avatar = `/uploads/${req.file.filename}`;
    }

    await axios.put(`${API_BASE_URL}/${req.params.id}`, tourData);
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error updating tour");
  }
});

// Eliminar Tour
app.delete("/tours/:id", async (req, res) => {
  try {
    await axios.delete(`${API_BASE_URL}/${req.params.id}`);
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error deleting tour");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
