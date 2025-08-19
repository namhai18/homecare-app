export interface MeterReading {
    id?: string;
    created_at?: string;
    user_id?: string;
    reading_date?: string;
    
    // Water readings
    water_total: number | null;
    water_business_before: number | null;
    water_business_after: number | null;
    
    // Electricity readings
    electricity_total: number | null;
    electricity_business_before: number | null;
    electricity_business_after: number | null;
    l1_small_left: number | null;
    l1_small_right: number | null;
    l1_large: number | null;
    l2_small_left: number | null;
    l2_small_right: number | null;
    l2_large: number | null;
}
