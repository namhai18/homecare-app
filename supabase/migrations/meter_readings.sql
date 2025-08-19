-- Create meter readings table
create table meter_readings (
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id),
    reading_date date default current_date not null,
    reading_year integer not null,
    reading_month integer not null,
    
    -- Water readings
    water_total decimal(10,2),
    water_business_before decimal(10,2),
    water_business_after decimal(10,2),
    
    -- Electricity readings
    electricity_total decimal(10,2),
    electricity_business_before decimal(10,2),
    electricity_business_after decimal(10,2),
    l1_small_left decimal(10,2),
    l1_small_right decimal(10,2),
    l1_large decimal(10,2),
    l2_small_left decimal(10,2),
    l2_small_right decimal(10,2),
    l2_large decimal(10,2),
    constraint meter_readings_pkey primary key (reading_date, reading_year, reading_month)
);

-- Create RLS (Row Level Security) policy
alter table meter_readings enable row level security;

-- Create policy for authenticated users
create policy "Users can view their own readings"
    on meter_readings for select
    using (auth.uid() = user_id);

create policy "Users can insert their own readings"
    on meter_readings for insert
    with check (auth.uid() = user_id);
