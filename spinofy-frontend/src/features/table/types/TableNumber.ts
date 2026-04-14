export interface TableNumbersResponse {
  status: string;
  message: string;
  data: {
    table_numbers: TableNumber[];
    table_locations: TableLocation[];
  };
}

export interface TableNumber {
  id: number;
  number: string;
  outlet_id: number;
  table_number_location_id: number;
  table_number_location: TableNumberLocation;
}

export interface TableNumberLocation {
  id: number;
  name: string;
  outlet_id: number;
  created_at: string;
  updated_at: string;
}

export interface TableLocation {
  id: number;
  name: string;
  outlet_id: number;
}

export interface TableNumberDetailResponse {
  status: string;
  message: string;
  data: {
    id: number;
    number: string;
    qr_code_path: string;
    table_number_location_id: number;
    outlet_id: number;
    created_at: string;
    updated_at: string;
  }
}