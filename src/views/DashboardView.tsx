import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrder } from "../context/OrderContext";
import { useSettings } from "../context/SettingsContext";
import axios from "axios";

export default function DashboardView() {
  const [orderType, setOrderType] = useState<'restaurante' | 'para llevar' | 'pickup'>('restaurante');
  const [client, setClient] = useState("");
  const [table, setTable] = useState("");
  const [address, setAddress] = useState("");
  const [inProgressOrders, setInProgressOrders] = useState<any[]>([]);
  const { yellowLimit, redLimit } = useSettings();
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  const { selectedProducts, addProduct, removeProduct, clearProducts } = useOrder();
  const navigate = useNavigate();

  function getOrderColor(createdAt: string, yellowLimit: number, redLimit: number): string {
    const createdTime = new Date(createdAt).getTime();
    const now = Date.now();
    const diffInMinutes = (now - createdTime) / 60000;

    if (diffInMinutes < yellowLimit) return "bg-green-500";
    if (diffInMinutes < redLimit) return "bg-yellow-500";
    return "bg-red-500";
  }

  const markAsPaid = async (orderId: string) => {
    try {
      await axios.patch(`http://localhost:4000/api/orders/${orderId}/status`, { status: "pagado" });
      setPendingOrders(prev => prev.filter(order => order._id !== orderId)); // eliminar de UI
    } catch (error) {
      console.error("Error al marcar como pagada:", error);
    }
  };

  const markAsReady = async (orderId: string) => {
    try {
      await axios.patch(`http://localhost:4000/api/orders/${orderId}/status`, { status: "pago pendiente" });
      fetchInProgressOrders();
      fetchPendingPaymentOrders(); 
    } catch (error) {
      console.error("Error al marcar como lista:", error);
    }
  };

  const fetchPendingPaymentOrders = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/orders/pending-payment");
      setPendingOrders(res.data);
    } catch (error) {
      console.error("Error al cargar órdenes de pago pendiente", error);
    }
  };

  const formatElapsedTime = (createdAt: string): string => {
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    const diff = Math.max(0, now - created);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await axios.delete(`http://localhost:4000/api/orders/${orderId}`);
      const res = await axios.get("http://localhost:4000/api/orders/in-progress");
      setInProgressOrders(res.data);
    } catch (error) {
      console.error("Error al eliminar la orden:", error);
      alert("Hubo un problema al eliminar la orden.");
    }
  };

  const handleEditOrder = (order: any) => {
    setEditingOrderId(order._id);
    setClient(order.client);
    setOrderType(order.type);
    setTable(order.table || "");
    setAddress(order.address || "");

    const formattedProducts = order.products.map((p: any) => ({
      productId: p.product._id,
      name: p.product.name,
      price: p.product.price,
      extras: p.extras || [],
    }));

    clearProducts();
    formattedProducts.forEach(addProduct);
  };

  const fetchInProgressOrders = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/orders/in-progress");
      setInProgressOrders(res.data);
    } catch (error) {
      console.error("Error al cargar órdenes en curso", error);
    }
  };

  useEffect(() => {
    const savedData = localStorage.getItem("tempOrderData");
    if (savedData) {
      const { client, table, address, orderType, editingOrderId } = JSON.parse(savedData);
      setClient(client || "");
      setTable(table || "");
      setAddress(address || "");
      setOrderType(orderType || "restaurante");
      setEditingOrderId(editingOrderId || null);
      localStorage.removeItem("tempOrderData");
    }

    fetchInProgressOrders();
    fetchPendingPaymentOrders();

    const interval = setInterval(() => {
      setInProgressOrders((prev) => [...prev]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    if (!client || selectedProducts.length === 0) return;

    const payload = {
      client,
      type: orderType,
      table: orderType === 'restaurante' ? Number(table) : undefined,
      address: orderType === 'para llevar' ? address : undefined,
      products: selectedProducts.map(p => ({
        product: p.productId,
        quantity: 1,
        extras: p.extras,
      })),
    };

    try {
      if (editingOrderId) {
        await axios.patch(`http://localhost:4000/api/orders/${editingOrderId}`, payload);
      } else {
        await axios.post("http://localhost:4000/api/orders", payload);
      }

      // resetear formulario
      setClient("");
      setTable("");
      setAddress("");
      clearProducts();
      setEditingOrderId(null);
      fetchInProgressOrders(); // actualizar lista
    } catch (error) {
      console.error("Error al enviar la orden", error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      {/* Órdenes en curso */}
      <div className="w-full lg:w-[30%] bg-white rounded-none lg:rounded-3xl p-4 shadow-lg overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Órdenes en curso</h2>
        {inProgressOrders.length === 0 ? (
          <p className="text-gray-500">No hay órdenes en curso.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {inProgressOrders.map((order) => (
              <div
                key={order._id}
                className={`relative text-white p-4 rounded-lg shadow ${getOrderColor(order.createdAt, yellowLimit, redLimit)}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-sm sm:text-base">Cliente: {order.client}</p>
                  <span className="text-xs bg-white text-black px-2 py-1 rounded">
                    {formatElapsedTime(order.createdAt)}
                  </span>
                </div>
                <p className="text-sm">Tipo: {order.type}</p>
                <p className="mt-2 font-semibold text-sm">Productos:</p>
                <ul className="ml-4 list-disc mb-4 text-sm">
                  {order.products.map((p: any, index: number) => (
                    <li key={index}>
                      {p.product.name} x{p.quantity}
                      {p.extras?.length > 0 && (
                        <> - Extras: {p.extras.map((e: any) => e.name).join(", ")}</>
                      )}
                    </li>
                  ))}
                </ul>

                <p>Total: ${order.total.toFixed(2)}</p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto px-3 py-1 rounded"
                    onClick={() => markAsReady(order._id)}
                  >
                    Marcar como lista
                  </button>
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    onClick={() => handleEditOrder(order)}
                  >
                    ✎
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    onClick={() => handleDeleteOrder(order._id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col justify-start px-4 sm:px-6 py-4 gap-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-black">Crear una nueva orden</h2>
        {/* Tabs de tipo de orden */}
        <div className="flex flex-wrap gap-2">
          {["restaurante", "para llevar", "pickup"].map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type as typeof orderType)}
              className={`px-4 py-2 rounded text-sm ${orderType === type ? "bg-blue-600 text-white" : "bg-white text-black"
                }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Formulario */}
        <div className="bg-blue-500 p-4 rounded-lg shadow-xl flex flex-col gap-2">
          <input
            type="text"
            placeholder="Cliente"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="p-2 rounded bg-white text-sm"
          />

          {orderType === 'restaurante' && (
            <input
              type="number"
              placeholder="Mesa"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              className="p-2 rounded bg-white text-sm"
            />
          )}

          {orderType === 'para llevar' && (
            <input
              type="text"
              placeholder="Dirección"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="p-2 rounded bg-white text-sm"
            />
          )}

          <label className="text-white mt-2 font-semibold text-sm">Productos:</label>

          <button
            onClick={() => {
              localStorage.setItem("tempOrderData", JSON.stringify({
                client,
                table,
                address,
                orderType,
                editingOrderId
              }));
              navigate("/ordenes/productos");
            }}
            className="bg-green-500 text-white w-full py-2 rounded text-sm"
          >
            Agregar producto
          </button>

          {selectedProducts.map((prod, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-green-600 text-white p-2 rounded mb-1 text-sm"
            >
              <span>
                {prod.name}
                {Array.isArray(prod.extras) && prod.extras.length > 0 && (
                  <> (Extras: {prod.extras.map(extra => extra.name).join(", ")})</>
                )}
              </span>
              <button
                onClick={() => removeProduct(index)}
                className="text-white hover:text-red-300"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            className="bg-yellow-400 text-white font-bold py-2 px-6 mt-4 rounded cursor-pointer text-sm"
            onClick={handleSubmit}
          >
            {editingOrderId ? "Editar Pedido" : "Enviar Pedido"}
          </button>
        </div>

        {/* Órdenes de pago pendiente */}
        <div className="mt-6 w-full">
          <h2 className="text-2xl font-bold mb-4">Órdenes de pago pendiente</h2>

          <div className="flex gap-4 overflow-x-auto pb-2 max-w-full">
            {pendingOrders.map((order) => (
              <div
                key={order._id}
                className="min-w-[260px] max-w-[280px] bg-blue-500 text-white p-4 rounded shadow-lg flex-shrink-0"
              >
                <p className="font-bold text-sm">Cliente: {order.client}</p>
                <p className="text-sm">Tipo: {order.type}</p>
                <p className="mt-2 font-semibold text-sm">Productos:</p>
                <ul className="ml-4 list-disc text-sm">
                  {order.products.map((p: any, index: number) => (
                    <li key={index}>
                      {p.product.name} x{p.quantity}
                      {p.extras?.length > 0 && (
                        <> - Extras: {p.extras.map((e: any) => e.name).join(", ")}</>
                      )}
                    </li>
                  ))}
                </ul>

                <p>Total: ${order.total.toFixed(2)}</p>

                <button
                  className="mt-4 bg-green-600 text-white w-full py-2 rounded hover:bg-green-700 text-sm"
                  onClick={() => markAsPaid(order._id)}
                >
                  Pagada
                </button>
              </div>
            ))}
        </div>
      </div>
    </div> 
    </div >   
  );
}
