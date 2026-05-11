import { apiClient } from '@/lib/api-client';
import { Address } from '@/types';

type BackendAddress = {
  id: string | number;
  title: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
};

type AddressMetadata = {
  type?: Address['type'];
  phone?: string;
  buildingNumber?: string;
  floorNumber?: string;
  apartmentNumber?: string;
  notes?: string;
};

function cleanString(value?: string | null): string | undefined {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : undefined;
}

function parseAddressMetadata(value?: string | null): AddressMetadata {
  const normalizedValue = cleanString(value);

  if (!normalizedValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(normalizedValue) as AddressMetadata;
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : {};
  } catch {
    return { notes: normalizedValue };
  }
}

function serializeAddressMetadata(data: Partial<Address>): string | undefined {
  const metadata: AddressMetadata = {
    type: data.type,
    phone: cleanString(data.phone),
    buildingNumber: cleanString(data.buildingNumber),
    floorNumber: cleanString(data.floorNumber),
    apartmentNumber: cleanString(data.apartmentNumber),
    notes: cleanString(data.notes),
  };

  const entries = Object.entries(metadata).filter(([, value]) => value !== undefined);

  if (entries.length === 0) {
    return undefined;
  }

  return JSON.stringify(Object.fromEntries(entries));
}

function normalizeAddress(address: BackendAddress): Address {
  const metadata = parseAddressMetadata(address.addressLine2);
  const fallbackType = address.title === 'billing' ? 'billing' : 'shipping';

  return {
    id: String(address.id),
    type: metadata.type ?? fallbackType,
    address1: address.addressLine1,
    address2: undefined,
    buildingNumber: metadata.buildingNumber,
    floorNumber: metadata.floorNumber,
    apartmentNumber: metadata.apartmentNumber,
    city: address.city,
    state: address.state,
    postalCode: address.zipCode,
    country: address.country,
    phone: metadata.phone ?? '',
    isDefault: Boolean(address.isDefault),
    notes: metadata.notes,
  };
}

function toBackendPayload(data: Partial<Address>) {
  return {
    title: data.type ?? 'shipping',
    addressLine1: cleanString(data.address1) ?? '',
    addressLine2: serializeAddressMetadata(data) ?? '',
    city: cleanString(data.city) ?? '',
    state: cleanString(data.state) ?? cleanString(data.city) ?? '',
    country: cleanString(data.country) ?? 'Jordan',
    zipCode: cleanString(data.postalCode) ?? '00000',
    isDefault: data.isDefault ?? false,
  };
}

export const addressService = {
  getAll: async (): Promise<Address[]> => {
    const response = await apiClient.get<BackendAddress[]>('/addresses');
    return response.map(normalizeAddress);
  },

  create: async (data: Partial<Address>): Promise<Address> => {
    const response = await apiClient.post<BackendAddress>('/addresses', toBackendPayload(data));
    return normalizeAddress(response);
  },

  update: async (id: string, data: Partial<Address>): Promise<Address> => {
    const response = await apiClient.put<BackendAddress>(`/addresses/${id}`, toBackendPayload(data));
    return normalizeAddress(response);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/addresses/${id}`);
  },
};
