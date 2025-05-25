import { useEffect, useState } from "react";
import axios from "axios";

export default function OrdersView() {
  const [paidOrders, setPaidOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchPaidOrders = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/paid`);
        setPaidOrders(res.data);
      } catch (error) {
        console.error("Error al cargar órdenes pagadas", error);
      }
    };

    fetchPaidOrders();
  }, []);

  return (
    <div className="p-6 w-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-black">Historial de Órdenes Pagadas</h2>

      {paidOrders.length === 0 ? (
        <p className="text-gray-500">No hay órdenes pagadas.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {paidOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white text-black p-4 rounded-lg shadow-md"
            >
              <p className="font-bold text-sm">Cliente: {order.client}</p>
              <p className="text-sm">Tipo: {order.type}</p>
              <p className="mt-2 font-semibold text-sm">Productos:</p>
              <ul className="ml-4 list-disc text-sm">
                {order.products.map((p: any, index: number) => (
                  <li key={index}>
                    {p.product?.name || "Producto eliminado"} x{p.quantity}
                    {Array.isArray(p.extras) && p.extras.length > 0 && (
                      <> - Extras: {p.extras.map((e: any) => e?.name || "Extra eliminado").join(", ")}</>
                    )}
                  </li>
                ))}
              </ul>
              <p className="font-bold">Total: ${order.total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}