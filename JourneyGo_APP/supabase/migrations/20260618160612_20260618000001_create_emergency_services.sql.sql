CREATE TABLE IF NOT EXISTS emergency_services (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  phone       text NOT NULL,
  type        text NOT NULL CHECK (type IN ('police','hospital','pharmacy','helpline')),
  lat         numeric NOT NULL,
  lng         numeric NOT NULL,
  address     text,
  city        text NOT NULL,
  area        text,
  available24h boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE emergency_services ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (public data)
CREATE POLICY "select_public_emergency_services" ON emergency_services
  FOR SELECT USING (true);

-- Insert seed data for Jharkhand / Kolkata corridor
INSERT INTO emergency_services (name, phone, type, lat, lng, address, city, area, available24h) VALUES
  -- Tatanagar / Jamshedpur
  ('Tatanagar Police Station', '0657-2291234', 'police', 22.7667, 86.1985, 'Bistupur, Sakchi', 'Jamshedpur', 'Bistupur', true),
  ('Jugsalai Police Outpost', '0657-2278901', 'police', 22.7600, 86.1800, 'Jugsalai Main Road', 'Jamshedpur', 'Jugsalai', true),
  ('Tata Main Hospital', '0657-6631234', 'hospital', 22.7920, 86.1830, 'C Road, Northern Town', 'Jamshedpur', 'Northern Town', true),
  ('TMH Emergency Wing', '0657-6631000', 'hospital', 22.7930, 86.1840, 'Tata Main Hospital Campus', 'Jamshedpur', 'Northern Town', true),
  ('Apollo Pharmacy Bistupur', '0657-2288777', 'pharmacy', 22.7963, 86.1837, 'Bistupur Market', 'Jamshedpur', 'Bistupur', true),
  ('MedPlus 24/7', '0657-2211999', 'pharmacy', 22.7890, 86.1800, 'Aam Bagan', 'Jamshedpur', 'Aam Bagan', true),
  ('Guardian Pharmacy Sakchi', '0657-2299000', 'pharmacy', 22.7770, 86.1860, 'Sakchi Market', 'Jamshedpur', 'Sakchi', false),
  -- Howrah / Kolkata
  ('Howrah City Police', '033-26412310', 'police', 22.5830, 88.3425, 'Golabari, Howrah', 'Kolkata', 'Howrah', true),
  ('Santragachi Police', '033-26424638', 'police', 22.5802, 88.2774, 'Santragachi, Howrah', 'Kolkata', 'Santragachi', true),
  ('Beliaghata I.D. Hospital', '033-23202033', 'hospital', 22.5600, 88.3900, 'Beliaghata, Kolkata', 'Kolkata', 'Beliaghata', true),
  ('Howrah General Hospital', '033-26411625', 'hospital', 22.5800, 88.3400, 'Bhairabpur, Howrah', 'Kolkata', 'Howrah', true),
  ('Frank Ross Pharmacy', '033-24660182', 'pharmacy', 22.5800, 88.3500, 'Near Howrah Station', 'Kolkata', 'Howrah', true),
  -- Chaibasa
  ('Chaibasa Police Station', '06582-255220', 'police', 22.5533, 85.8058, 'Kachahari Road', 'Chaibasa', 'Town', true),
  ('Sadar Hospital Chaibasa', '06582-255100', 'hospital', 22.5500, 85.8100, 'Hospital Road', 'Chaibasa', 'Town', true),
  ('Life Care Medical', '06582-254321', 'pharmacy', 22.5550, 85.8080, 'Main Market', 'Chaibasa', 'Town', true),
  -- Kharagpur
  ('Kharagpur PS', '03222-255013', 'police', 22.3330, 87.3250, 'Inda, Kharagpur', 'West Bengal', 'Kharagpur', true),
  ('Kharagpur Sub-Division Hospital', '03222-255225', 'hospital', 22.3350, 87.3280, 'Inda', 'West Bengal', 'Kharagpur', true),
  ('Kharagpur Medical', '03222-255100', 'pharmacy', 22.3340, 87.3270, 'Main Road', 'West Bengal', 'Kharagpur', true),
  -- Ranchi
  ('Ranchi Police Control', '0651-2210193', 'police', 23.3441, 85.3096, 'Lower Bazar', 'Ranchi', 'Lower Bazar', true),
  ('RIMS Hospital', '0651-2540700', 'hospital', 23.3500, 85.3400, 'Bariatu', 'Ranchi', 'Bariatu', true),
  ('Raj Medicals', '0651-2541122', 'pharmacy', 23.3400, 85.3100, 'Main Road', 'Ranchi', 'Main Road', true)
ON CONFLICT (id) DO NOTHING;

-- RPC: find nearby emergency services (earth distance, ~15 km default)
CREATE OR REPLACE FUNCTION nearby_emergency_services(
  user_lat    numeric,
  user_lng    numeric,
  max_km      numeric DEFAULT 15,
  type_filter text    DEFAULT NULL
)
RETURNS TABLE (
  id           uuid,
  name         text,
  phone        text,
  type         text,
  lat          numeric,
  lng          numeric,
  address      text,
  city         text,
  area         text,
  available24h boolean,
  distance_km  numeric
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    e.id,
    e.name,
    e.phone,
    e.type,
    e.lat,
    e.lng,
    e.address,
    e.city,
    e.area,
    e.available24h,
    (
      6371 * acos(
        cos(radians(user_lat)) *
        cos(radians(e.lat)) *
        cos(radians(e.lng) - radians(user_lng)) +
        sin(radians(user_lat)) *
        sin(radians(e.lat))
      )
    )::numeric AS distance_km
  FROM emergency_services e
  WHERE
    (type_filter IS NULL OR e.type = type_filter)
    AND (6371 * acos(
        cos(radians(user_lat)) *
        cos(radians(e.lat)) *
        cos(radians(e.lng) - radians(user_lng)) +
        sin(radians(user_lat)) *
        sin(radians(e.lat))
      )) <= max_km
  ORDER BY distance_km
  LIMIT 30;
$$;

