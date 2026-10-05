-- Lookup data for local development and fresh environments.

insert into public.categories (slug, name, description, sort_order) values
  ('personal-trainer', 'Personal Trainer', 'One-on-one or small group training sessions.', 1),
  ('athletic-coach', 'Athletic Coach', 'Sport-specific performance and conditioning coaching.', 2),
  ('online-coach', 'Online Coach', 'Remote programming, check-ins and accountability.', 3)
on conflict (slug) do nothing;

insert into public.modalities (slug, name, sort_order) values
  ('home', 'At home', 1),
  ('gym', 'Gym', 2),
  ('outdoor', 'Outdoor', 3),
  ('online', 'Online', 4)
on conflict (slug) do nothing;

insert into public.specialties (slug, name, sort_order) values
  ('weight-loss', 'Weight loss', 1),
  ('strength-training', 'Strength training', 2),
  ('muscle-gain', 'Muscle gain', 3),
  ('injury-recovery', 'Injury recovery', 4),
  ('mobility', 'Mobility & flexibility', 5),
  ('hiit', 'HIIT & conditioning', 6),
  ('sports-performance', 'Sports performance', 7),
  ('prenatal-postnatal', 'Prenatal & postnatal', 8),
  ('senior-fitness', 'Senior fitness', 9)
on conflict (slug) do nothing;

insert into public.cities (slug, name, region, country_code, latitude, longitude, is_published) values
  ('madrid', 'Madrid', 'Community of Madrid', 'ES', 40.4168, -3.7038, true),
  ('barcelona', 'Barcelona', 'Catalonia', 'ES', 41.3874, 2.1686, true),
  ('valencia', 'Valencia', 'Valencian Community', 'ES', 39.4699, -0.3763, true),
  ('sevilla', 'Sevilla', 'Andalusia', 'ES', 37.3891, -5.9845, false),
  ('miami', 'Miami', 'Florida', 'US', 25.7617, -80.1918, true),
  ('new-york', 'New York', 'New York', 'US', 40.7128, -74.0060, true),
  ('los-angeles', 'Los Angeles', 'California', 'US', 34.0522, -118.2437, true),
  ('austin', 'Austin', 'Texas', 'US', 30.2672, -97.7431, false),
  ('mexico-city', 'Mexico City', 'CDMX', 'MX', 19.4326, -99.1332, true),
  ('guadalajara', 'Guadalajara', 'Jalisco', 'MX', 20.6597, -103.3496, false),
  ('bogota', 'Bogotá', 'Bogotá D.C.', 'CO', 4.7110, -74.0721, true),
  ('medellin', 'Medellín', 'Antioquia', 'CO', 6.2442, -75.5812, true),
  ('buenos-aires', 'Buenos Aires', 'Buenos Aires', 'AR', -34.6037, -58.3816, true),
  ('santiago', 'Santiago', 'Santiago Metropolitan', 'CL', -33.4489, -70.6693, false),
  ('lima', 'Lima', 'Lima', 'PE', -12.0464, -77.0428, false),
  ('london', 'London', 'England', 'GB', 51.5074, -0.1278, true)
on conflict (slug) do nothing;
