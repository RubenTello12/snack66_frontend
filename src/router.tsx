import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import DashboardView from "./views/DashboardView";
import OrdersView from "./views/OrdersView";
import MenuView from "./views/MenuView";
import InventoryView from "./views/InventoryView";
import SettingsView from "./views/SettingsView";
import CategoryDetailView from "./views/CategoryDetailView";
import OrderCategoryView from "./views/OrderCategoryView";
import OrderProductListView from "./views/OrderProductListView";

export default function Router() {

    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<DashboardView />} />
                    <Route path="/orders" element={<OrdersView />} />
                    <Route path="/ordenes" element={<DashboardView />} />
                    <Route path="/ordenes/productos" element={<OrderCategoryView />} />
                    <Route path="/orden/categoria/:id" element={<OrderProductListView />} />
                    <Route path="menu" element={<MenuView />} />
                    <Route path="/menu/:id" element={<CategoryDetailView />} />
                    <Route path="inventory" element={<InventoryView />} />
                    <Route path="settings" element={<SettingsView />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}