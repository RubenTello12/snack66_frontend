import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useOrder } from "../context/OrderContext";

interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  extras?: { name: string; price: number }[];
  ingredients: { name: string; quantity: number }[];
  category: string;
}

interface Extra {
  name: string;
  price: number;
}

export default function OrderProductListView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [selectedExtras, setSelectedExtras] = useState<Record<string, Extra[]>>({});

  const { addProduct } = useOrder();

  const fetchProducts = async () => {
    const res = await axios.get(`http://localhost:4000/api/products?category=${id}`);
    setProducts(res.data);
  };

  const fetchCategory = async () => {
    const res = await axios.get(`http://localhost:4000/api/categories/${id}`);
    setCategoryName(res.data.name);
  };

  const toggleExtra = (productId: string, extra: Extra) => {
    setSelectedExtras(prev => {
      const currentExtras = prev[productId] || [];
      const exists = currentExtras.find(e => e.name === extra.name);

      return {
        ...prev,
        [productId]: exists
          ? currentExtras.filter(e => e.name !== extra.name)
          : [...currentExtras, extra]
      };
    });
  };

  const handleAddToOrder = (product: Product) => {
    const extras = selectedExtras[product._id] || [];

    addProduct({
      productId: product._id,
      name: product.name,
      price: product.price,
      extras
    });

    navigate("/ordenes");
  };

  useEffect(() => {
    fetchProducts();
    fetchCategory();
  }, [id]);

  return (
    <div className="p-4 sm:p-6 max-w-screen-lg mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold uppercase text-center sm:text-left">{categoryName}</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded"
          onClick={() => navigate("/ordenes/productos")}
        >
          Volver a Categorías
        </button>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-blue-500 text-white p-4 rounded-lg shadow flex flex-col gap-2"
          >
            <div>
              <p className="text-lg font-bold uppercase">{product.name}</p>
              <p className="text-md">${product.price}</p>
            </div>

            {product.extras && product.extras.length > 0 && (
              <div className="text-white">
                <p className="font-semibold mb-1">Selecciona extras:</p>
                {product.extras.map((extra, index) => {
                  const isChecked = selectedExtras[product._id]?.some(e => e.name === extra.name);
                  return (
                    <label key={index} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleExtra(product._id, extra)}
                      />
                      {extra.name} - ${extra.price}
                    </label>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => handleAddToOrder(product)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Agregar Producto
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}