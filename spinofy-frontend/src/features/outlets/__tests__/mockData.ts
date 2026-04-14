import type { Outlet, OutletResponse, SingleOutletResponse, Product, OperationalSchedule, Media } from '../types/Outlet';
import { OutletType } from '../types/Outlet';

export const mockProduct: Product = {
    id: 1,
    uuid: 'product-uuid-1',
    name: 'Test Product',
    price: '50000',
    description: 'Test product description',
    is_available: 1,
    is_published: 1,
    is_recommended: 1,
    image: 'products/test-product.jpg',
    product_category_id: 1,
    outlet_id: 1,
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
};

export const mockOperationalSchedule: OperationalSchedule = {
    id: 1,
    uuid: 'schedule-uuid-1',
    outlet_id: 1,
    day: 1, // Monday
    open_time: '08:00',
    close_time: '22:00',
    is_open: 1,
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
};

export const mockMedia: Media = {
    id: 1,
    model_type: 'App\\Models\\Outlet',
    model_id: 1,
    uuid: 'media-uuid-1',
    collection_name: 'logo',
    name: 'outlet-logo',
    file_name: 'outlet-logo.jpg',
    mime_type: 'image/jpeg',
    disk: 'public',
    conversions_disk: 'public',
    size: 102400,
    manipulations: [],
    custom_properties: [],
    generated_conversions: [],
    responsive_images: [],
    order_column: 1,
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
    original_url: 'http://localhost:8000/storage/media/outlet-logo.jpg',
    preview_url: 'http://localhost:8000/storage/media/outlet-logo.jpg',
};

export const mockOutlet: Outlet = {
    id: 1,
    uuid: 'outlet-uuid-1',
    name: 'Test Outlet',
    slug: 'test-outlet',
    phone: '081234567890',
    address: 'Test Address 123',
    map: 'https://maps.google.com/test',
    is_active: 1,
    type: OutletType.TABLE_SERVICE,
    service_fee_config: 10,
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
    fee_tax: 5,
    products_count: 10,
    total_point: '1000',
    logo_url: 'http://localhost:8000/storage/logos/test-outlet.jpg',
    products: [mockProduct],
    media: [mockMedia],
    operational_schedules: [
        mockOperationalSchedule,
        { ...mockOperationalSchedule, id: 2, uuid: 'schedule-uuid-2', day: 2, outlet_id: 1 },
        { ...mockOperationalSchedule, id: 3, uuid: 'schedule-uuid-3', day: 3, outlet_id: 1 },
        { ...mockOperationalSchedule, id: 4, uuid: 'schedule-uuid-4', day: 4, outlet_id: 1 },
        { ...mockOperationalSchedule, id: 5, uuid: 'schedule-uuid-5', day: 5, outlet_id: 1 },
        { ...mockOperationalSchedule, id: 6, uuid: 'schedule-uuid-6', day: 6, outlet_id: 1 },
        { ...mockOperationalSchedule, id: 7, uuid: 'schedule-uuid-7', day: 0, outlet_id: 1 }, // Sunday
    ],
};

export const mockOutlet2: Outlet = {
    ...mockOutlet,
    id: 2,
    uuid: 'outlet-uuid-2',
    name: 'Test Outlet 2',
    slug: 'test-outlet-2',
    type: OutletType.PICKUP_CASHIER,
};

export const mockOutlet3: Outlet = {
    ...mockOutlet,
    id: 3,
    uuid: 'outlet-uuid-3',
    name: 'Test Outlet 3',
    slug: 'test-outlet-3',
    type: OutletType.BOTH,
};

export const mockClosedOutlet: Outlet = {
    ...mockOutlet,
    id: 4,
    uuid: 'outlet-uuid-4',
    name: 'Closed Outlet',
    slug: 'closed-outlet',
    operational_schedules: [
        { ...mockOperationalSchedule, is_open: 0 },
    ],
};

export const mockOutletResponse: OutletResponse = {
    status: 'success',
    message: 'Outlets retrieved successfully',
    data: {
        outlets: [mockOutlet, mockOutlet2, mockOutlet3],
    },
};

export const mockSingleOutletResponse: SingleOutletResponse = {
    status: 'success',
    message: 'Outlet retrieved successfully',
    data: {
        outlet: mockOutlet,
    },
};

export const mockErrorOutletResponse: OutletResponse = {
    status: 'error',
    message: 'Failed to fetch outlets',
    data: {
        outlets: [],
    },
};

export const mockErrorSingleOutletResponse: SingleOutletResponse = {
    status: 'error',
    message: 'Outlet not found',
    data: {
        outlet: {} as Outlet,
    },
};
