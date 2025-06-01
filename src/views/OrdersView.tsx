import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function OrdersView() {
  const [paidOrders, setPaidOrders] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayCortesias, setTodayCortesias] = useState(0);

  const handleOpenModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setConfirmText(""); 
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmText.toLowerCase() === "eliminar orden" && selectedOrderId) {
      const orderToDelete = paidOrders.find(order => order._id === selectedOrderId);
      if (!orderToDelete) return;

      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/orders/${selectedOrderId}`);
        setPaidOrders(prev => prev.filter(order => order._id !== selectedOrderId));

        const orderDate = new Date(orderToDelete.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isToday = orderDate.getTime() === today.getTime();
        const isCortesia = orderToDelete.paymethod?.toLowerCase() === "cortesia";

        if (isToday && !isCortesia) {
          setTodayEarnings(prev => prev - orderToDelete.total);
        }

        setShowModal(false);
      } catch (error) {
        console.error("Error al eliminar la orden:", error);
        alert("Hubo un problema al eliminar la orden.");
      }
    }
  };

  useEffect(() => {
    const fetchPaidOrders = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/paid`);
        const orders = res.data;
        setPaidOrders(orders);

        // Obtener la fecha actual sin hora
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calcular ganancias del día (excluyendo cortesías)
        const earnings = orders
          .filter((order: any) => {
            const createdAt = new Date(order.createdAt);
            createdAt.setHours(0, 0, 0, 0);
            return (
              createdAt.getTime() === today.getTime() &&
              order.paymethod?.toLowerCase() !== "cortesia" 
            );
          })
          .reduce((sum: number, order: any) => sum + order.total, 0);

        // Calcular total de cortesías del día
        const cortesias = orders
          .filter((order: any) => {
            const createdAt = new Date(order.createdAt);
            createdAt.setHours(0, 0, 0, 0);
            return (
              createdAt.getTime() === today.getTime() &&
              order.paymethod?.trim().toLowerCase() === "cortesia"
            );
          })
          .reduce((sum: number, order: any) => sum + order.total, 0);

        setTodayEarnings(earnings);
        setTodayCortesias(cortesias); 
      } catch (error) {
        console.error("Error al cargar órdenes pagadas", error);
      }
    };

    fetchPaidOrders();
  }, []);

  const downloadExcel = () => {
    const data = paidOrders.map((order) => ({
      Cliente: order.client,
      Tipo: order.type,
      Total: order.total,
      Pago: order.paymethod,
      Fecha: new Date(order.createdAt).toLocaleDateString("es-MX"),
      Productos: order.products
        .map(
          (p: any) =>
            `${p.product?.name || "Eliminado"} x${p.quantity}${p.extras?.length ? " - Extras: " + p.extras.map((e: any) => e?.name || "Extra eliminado").join(", ") : ""}`
        )
        .join(" | "),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `historial_ordenes_${new Date().toLocaleDateString("es-MX")}.xlsx`);
  };

  return (
    <div className="p-6 w-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-black">Historial de Órdenes</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-green-100 border-l-4 border-green-600 text-green-800 rounded shadow">
          <h3 className="text-lg font-bold">Ganancias de hoy</h3>
          <p className="text-2xl font-semibold">${todayEarnings.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-red-100 border-l-4 border-red-600 text-red-800 rounded shadow">
          <h3 className="text-lg font-bold">Cortesías de hoy</h3>
          <p className="text-2xl font-semibold">${todayCortesias.toFixed(2)}</p>
        </div>
      </div>

      <button
        onClick={downloadExcel}
        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
      >
        Descargar Historial
      </button>

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
              <p className="text-sm">
                Fecha: {new Date(order.createdAt).toLocaleDateString("es-MX", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
                })}
              </p>
              <p className="text-sm">
                Pago: {order.paymethod || "No especificado"}
              </p>
              <p className="font-bold">Total: ${order.total.toFixed(2)}</p>
              <button
                onClick={() => handleOpenModal(order._id)}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-blue-500 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-3xl font-bold mb-2 text-red-600 text-center">Confirmar eliminación</h2>
            <p className="text-white mb-4 text-center">
              Escribe <strong>eliminar orden</strong> para confirmar:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="bg-white border-none p-2 rounded w-full mb-4"
              placeholder="eliminar orden"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                className={`px-4 py-2 rounded text-white ${confirmText.toLowerCase() === "eliminar orden" ? "bg-red-600 hover:bg-red-700" : "bg-red-400 cursor-not-allowed"}`}
                onClick={handleConfirmDelete}
                disabled={confirmText.toLowerCase() !== "eliminar orden"}
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