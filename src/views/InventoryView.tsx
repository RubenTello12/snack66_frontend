import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, X } from "lucide-react";

interface InventoryItem {
  _id: string;
  name: string;
  stock: number;
  minStock: number;
  provider: string;
}

export default function InventoryView() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [form, setForm] = useState({
    name: "",
    stock: 0,
    minStock: 0,
    provider: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const fetchInventory = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/inventory`);
    setItems(res.data);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = async () => {
    if (isEditing && editId) {
      await axios.put(`${import.meta.env.VITE_API_URL}/inventory/${editId}`, form);
    } else {
      await axios.post(`${import.meta.env.VITE_API_URL}/inventory`, form);
    }
    setForm({ name: "", stock: 0, minStock: 0, provider: "" });
    setIsEditing(false);
    setEditId(null);
    setShowModal(false);
    fetchInventory();
  };

  const handleEdit = (item: InventoryItem) => {
    setForm({
      name: item.name,
      stock: item.stock,
      minStock: item.minStock,
      provider: item.provider,
    });
    setIsEditing(true);
    setEditId(item._id);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem || deleteConfirmText.trim().toLowerCase() !== deleteItem.name.trim().toLowerCase()) {
      setDeleteError("El texto no coincide con el nombre del producto.");
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/inventory/${deleteItem._id}`);
      setItems(prev => prev.filter(i => i._id !== deleteItem._id));
      setShowDeleteModal(false);
    } catch (error: any) {
      if (error.response?.status === 400) {
        setDeleteError(error.response.data.message || "Este producto no puede ser eliminado.");
      } else {
        console.error("Error al eliminar producto:", error);
        setDeleteError("Hubo un problema al eliminar el producto.");
      }
    }
  };

  const getColor = (item: InventoryItem) => {
    if (item.stock < item.minStock) return "bg-red-500 text-white";
    if (item.stock === item.minStock) return "bg-yellow-400";
    return "bg-blue-500 text-white";
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 uppercase">Administra tu Inventario</h1>

      <button
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded shadow mb-6"
        onClick={() => {
          setForm({ name: "", stock: 0, minStock: 0, provider: "" });
          setIsEditing(false);
          setShowModal(true);
        }}
      >
        Agregar Producto
      </button>

      <div className="grid gap-4">
        <div className="hidden sm:grid sm:grid-cols-4 gap-4 px-4 py-2 font-bold uppercase text-black">
        <div>Producto</div>
        <div className="text-center">Stock Actual</div>
        <div className="text-center">Stock Mínimo</div>
        <div className="text-right">Proveedor</div>
      </div>

      {items.map((item) => (
        <div
          key={item._id}
          className={`grid grid-cols-1 sm:grid-cols-4 gap-4 px-4 py-3 rounded-lg shadow-md items-center ${getColor(item)}`}
        >
          {/* Producto */}
          <div className="text-center sm:text-left font-bold uppercase">
            {item.name}
          </div>

          {/* Stock Actual */}
          <div className="text-center">{item.stock}</div>

          {/* Stock Mínimo */}
          <div className="text-center">{item.minStock}</div>

          {/* Proveedor + Acciones */}
          <div className="flex justify-center sm:justify-end items-center gap-3 text-center sm:text-right font-semibold uppercase">
            {item.provider}
            <button onClick={() => handleEdit(item)}>
              <Pencil size={20} />
            </button>
            <button onClick={() => {
              setDeleteItem(item);
              setDeleteConfirmText("");
              setDeleteError("");
              setShowDeleteModal(true);
            }}>
              <X size={20} />
            </button>
          </div>
        </div>
      ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-blue-500 p-6 rounded-xl shadow-lg w-[90%] max-w-md">
            <h2 className="text-3xl font-bold mb-4 text-center w-full text-white">
              {isEditing ? "Editar Producto" : "Agregar Producto"}
            </h2>
            <div className="flex flex-col gap-3">
              <p className="font-bold text-white">Nombre del producto:</p>
              <input
                type="text"
                placeholder="Nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border p-2 rounded w-full bg-white border-none"
              />
              <p className="font-bold text-white">Stock Actual:</p>
              <input
                type="number"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: +e.target.value })}
                className="border p-2 rounded w-full bg-white border-none"
              />
              <p className="font-bold text-white">Stock Minimo:</p>
              <input
                type="number"
                placeholder="Stock mínimo"
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: +e.target.value })}
                className="border p-2 rounded w-full bg-white border-none"
              />
              <p className="font-bold text-white">Proveedor:</p>
              <input
                type="text"
                placeholder="Proveedor"
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                className="border p-2 rounded w-full bg-white border-none"
              />
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  {isEditing ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deleteItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-blue-500 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-3xl font-bold mb-2 text-red-600 text-center">¿Seguro que quieres eliminar este producto?</h2>
            <p className="text-white mb-4 text-center">
              Para confirmar, escribe <span className="font-bold">"{deleteItem.name}" </span>
               y asegurate de no tener este articulo dentro de una orden en curso
            </p>
            <input
              type="text"
              className="bg-white border-none p-2 rounded w-full mb-4"
              placeholder="Escribe el nombre del producto"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
            {deleteError && <p className="text-red-500 text-sm mb-2">{deleteError}</p>}
            <div className="flex justify-between">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
