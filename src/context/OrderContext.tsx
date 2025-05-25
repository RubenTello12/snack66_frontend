import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Extra = { name: string; price: number };
type OrderedProduct = { productId: string; name: string; price: number; extras?: Extra[] };

interface OrderContextType {
  selectedProducts: OrderedProduct[];
  addProduct: (product: OrderedProduct) => void;
  removeProduct: (index: number) => void;
  clearProducts: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProducts, setSelectedProducts] = useState<OrderedProduct[]>([]);

  const addProduct = (product: OrderedProduct) => {
    setSelectedProducts(prev => [...prev, product]);
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const clearProducts = () => {
    setSelectedProducts([]);
  };

  return (
    <OrderContext.Provider value={{ selectedProducts, addProduct, removeProduct, clearProducts }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrder must be used within an OrderProvider");
  return context;
};
