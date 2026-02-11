
export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface SelectedProduct {
  id: string;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
}

export interface CustomItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface InvoiceState {
  logo: string | null;
  customer: CustomerDetails;
  selectedProducts: Record<string, number>; // id -> quantity
  customItems: CustomItem[];
  shippingCharges: number;
  amountPaid: number;
}
