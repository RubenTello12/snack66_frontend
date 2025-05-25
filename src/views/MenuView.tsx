import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Category {
  _id: string;
  name: string;
  imageUrl?: string;
}

export default function MenuView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("${import.meta.env.VITE_API_URL}/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!name || !imageFile) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("image", imageFile);

    try {
      await axios.post("${import.meta.env.VITE_API_URL}/categories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setName("");
      setImageFile(null);
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Error al agregar categoría:", error);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold uppercase text-center sm:text-left">Administra tu Menú</h1>
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow w-full sm:w-auto"
          onClick={() => setShowModal(true)}
        >
          Agregar Categoría
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="text-gray-500 text-center">Aún no hay categorías disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category._id}
              onClick={() => navigate(`/menu/${category._id}`)}
              className="rounded-xl overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-all"
            >
              <img
                src={category.imageUrl || "/default-category.jpg"}
                alt={category.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 bg-black/70 text-white text-xl font-bold text-center">
                {category.name.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-blue-500 p-6 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-3 right-3 text-white"
              onClick={() => setShowModal(false)}
            >
              <X size={20} />
            </button>
            <h2 className="text-3xl font-bold mb-4 text-center text-white">
              Agrega una nueva categoría
            </h2>
            <div className="flex flex-col gap-4">
              <label className="text-white font-bold">Nombre de la categoría:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Hamburguesas"
                className="border p-2 rounded w-full bg-white border-none"
              />
              <label className="text-white font-bold">Imagen del producto:</label>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setImageFile(e.target.files[0]);
                  }
                }}
                className="border p-2 rounded w-full bg-white border-none"
              />
              <button
                onClick={handleAddCategory}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded shadow"
              >
                Agregar Categoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
