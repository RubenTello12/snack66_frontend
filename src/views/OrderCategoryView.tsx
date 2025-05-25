import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Category {
  _id: string;
  name: string;
  imageUrl?: string;
}

export default function OrderCategoryView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
      setCategories(res.data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold uppercase">Selecciona una categoría</h1>
      </div>

      {categories.length === 0 ? (
        <p className="text-gray-500">No hay categorías disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category._id}
              onClick={() => navigate(`/orden/categoria/${category._id}`)}
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
    </div>
  );
}
