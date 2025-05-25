import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Pencil, X } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  extras?: { name: string; price: number }[];
  ingredients: { name: string; quantity: number }[];
  category: string;
}

interface InventoryItem {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Extra {
  name: string;
  price: number;
}

export default function CategoryDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [newExtra, setNewExtra] = useState<Extra>({ name: '', price: 0 });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const [form, setForm] = useState({
    name: "",
    price: 0,
    description: "",
    category: id || "",
    ingredients: [] as { name: string; quantity: number }[]
  });

  const fetchProducts = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/products?category=${id}`);
    setProducts(res.data);
  };

  const fetchCategory = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories/${id}`);
    setCategoryName(res.data.name);
  };

  const fetchInventory = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/inventory`);
    setInventoryItems(res.data);
  };

  const fetchCategories = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
    setCategories(res.data);
  };

  const handleDeleteCategory = async () => {
    try {
      if (confirmText !== categoryName) return;

      await axios.delete(`${import.meta.env.VITE_API_URL}/categories/${id}`);
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/by-category/${id}`);

      setShowConfirmModal(false);
      navigate("/menu");
    } catch (error) {
      console.error("Error al eliminar la categoría o productos:", error);
      alert("Ocurrió un error al eliminar la categoría.");
    }
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      price: form.price,
      description: form.description,
      ingredients: form.ingredients,
      category: form.category,
      extras: extras.map(extra => ({ ...extra, quantity: 1 }))
    };

    if (editingId) {
      await axios.put(`${import.meta.env.VITE_API_URL}/products/${editingId}`, payload);
    } else {
      await axios.post(`${import.meta.env.VITE_API_URL}/products`, payload);
    }

    setShowModal(false);
    setForm({ name: "", price: 0, description: "", category: id || "", ingredients: [] });
    setExtras([]);
    setEditingId(null);
    fetchProducts();
  };

  const handleEditProduct = (product: Product) => {
    setForm({
      name: product.name,
      price: product.price,
      description: product.description || "",
      category: product.category,
      ingredients: product.ingredients || []
    });
    setExtras(product.extras || []);
    setEditingId(product._id);
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/products/${productId}`);
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
    fetchCategory();
    fetchInventory();
    fetchCategories();
  }, [id]);

  return (
    <div className="p-4 sm:p-6 max-w-screen-lg mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold uppercase text-center sm:text-left">{categoryName}</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded"
            onClick={() => {
              setShowModal(true);
              setEditingId(null);
              setForm({ name: "", price: 0, description: "", category: id || "", ingredients: [] });
              setExtras([]);
            }}
          >
            Agregar Producto
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded"
            onClick={() => navigate("/menu")}
          >
            Volver a Categorías
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-blue-500 text-white p-4 rounded-lg shadow flex flex-col sm:flex-row justify-between items-center"
          >
            <div className="w-full sm:w-1/2">
              <p className="text-lg font-bold uppercase">{product.name}</p>
              <p className="text-md">${product.price}</p>
              {product.extras && product.extras.length > 0 && (
                <div className="mt-2 text-yellow-300">
                  <p className="font-semibold">Extras:</p>
                  {product.extras.map((extra, index) => (
                    <p key={index}>{extra.name} - ${extra.price}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <button onClick={() => handleEditProduct(product)} className="bg-yellow-400 p-2 rounded hover:bg-yellow-500">
                <Pencil size={18} />
              </button>
              <button onClick={() => handleDeleteProduct(product._id)} className="bg-red-500 p-2 rounded hover:bg-red-600">
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center sm:justify-end">
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded shadow"
          onClick={() => setShowConfirmModal(true)}
        >
          Eliminar Categoría
        </button>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-blue-500 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-3xl font-bold mb-2 text-red-600 text-center">¿Seguro que quieres eliminar esta categoría?</h2>
            <p className="text-white mb-4 text-center">
              Toma en cuenta que todos los productos asociados a esta categoría también serán eliminados.
            </p>
            <p className="text-sm mb-2 text-white">Para eliminar esta categoría escribe "{categoryName}"</p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="bg-white border-none p-2 rounded w-full mb-4"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                disabled={confirmText !== categoryName}
                onClick={handleDeleteCategory}
                className={`px-4 py-2 rounded text-white ${confirmText !== categoryName ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-blue-500 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-center text-white">
              {editingId ? "Editar Producto" : "Agregar Producto"}
            </h2>
            <div className="flex flex-col gap-4">
              <p className="font-semibold mb-1 text-white">Nombre del producto:</p>
              <input
                type="text"
                placeholder="Nombre del producto"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border p-2 rounded border-none bg-white"
              />
              <p className="font-semibold mb-1 text-white">Precio del producto:</p>
              <input
                type="number"
                placeholder="Precio"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: +e.target.value })}
                className="border p-2 rounded border-none bg-white"
              />
              <p className="font-semibold mb-1 text-white">Descripcion del producto:</p>
              <textarea
                placeholder="Descripción"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="border p-2 rounded border-none bg-white"
              />

              {/* Ingredientes con cantidad */}
              <div>
                <p className="font-semibold mb-1 text-white">Ingredientes:</p>
                <div className="max-h-40 overflow-y-auto border rounded p-2 border-none bg-white flex flex-col gap-2">
                  {inventoryItems.map((item) => {
                    const isSelected = form.ingredients.some(i => i.name === item.name);
                    const quantity = form.ingredients.find(i => i.name === item.name)?.quantity || 1;

                    return (
                      <div key={item._id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                ingredients: [...form.ingredients, { name: item.name, quantity: 1 }]
                              });
                            } else {
                              setForm({
                                ...form,
                                ingredients: form.ingredients.filter(i => i.name !== item.name)
                              });
                            }
                          }}
                        />
                        <span className="w-1/2">{item.name}</span>
                        {isSelected && (
                          <input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) => {
                              const updated = form.ingredients.map(i =>
                                i.name === item.name ? { ...i, quantity: +e.target.value } : i
                              );
                              setForm({ ...form, ingredients: updated });
                            }}
                            className="w-16 p-1 rounded border"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Categoría */}
              <div>
                <p className="font-semibold mb-1 text-white">Categoría:</p>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="border p-2 rounded w-full border-none bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Extras */}
              <div>
                <p className="font-semibold mb-1 text-white">Extras:</p>
                <div className="flex gap-2 mb-2">
                  <select
                    value={newExtra.name}
                    onChange={(e) => setNewExtra({ ...newExtra, name: e.target.value })}
                    className="border p-2 rounded bg-white w-full border-none"
                  >
                    <option value="">Seleccionar ingrediente</option>
                    {inventoryItems.map((item) => (
                      <option key={item._id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="$"
                    value={newExtra.price}
                    onChange={(e) => setNewExtra({ ...newExtra, price: +e.target.value })}
                    className="border p-2 rounded bg-white w-24 border-none"
                  />
                  <button
                    onClick={() => {
                      if (newExtra.name && newExtra.price > 0) {
                        setExtras([...extras, newExtra]);
                        setNewExtra({ name: '', price: 0 });
                      }
                    }}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    +
                  </button>
                </div>
                {extras.map((extra, index) => (
                  <div key={index} className="text-white flex justify-between items-center bg-green-600 rounded px-3 py-1 mb-1">
                    <span>{extra.name} - ${extra.price}</span>
                    <button
                      onClick={() => setExtras(extras.filter((_, i) => i !== index))}
                      className="text-white hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
