-- Add updated_at column to meter_readings table
ALTER TABLE meter_readings ADD COLUMN updated_at timestamp with time zone;

-- Set updated_at to current time on update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_trigger ON meter_readings;
CREATE TRIGGER set_updated_at_trigger
BEFORE UPDATE ON meter_readings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
