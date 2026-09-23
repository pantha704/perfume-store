-- Demo reviews (client demo, Sep 2026)
--
-- Seeded sample rows so the review section reads alive while the storefront is
-- still a demo. They are unique per product and reference each scent's actual
-- notes so nothing reads generic.
--
-- Marker: user_id is null — real submissions always carry the signed-in user,
-- so demo rows are identifiable and removable in one statement:
--     delete from reviews where user_id is null;
--
-- This file is idempotent: it clears existing demo rows before inserting.

delete from reviews where user_id is null;

insert into reviews (product_id, author_name, title, rating, body, status, created_at, published_at) values
  -- Invictus
  ('prod_invictus', 'Aarav Mehta', 'Office-safe but not boring', 5,
   'Sprayed it before a 9am meeting and it was still there when I left at seven. The grapefruit opening is sharp for the first ten minutes, then the sea note settles in. My wife asked what I was wearing, which has never happened with a blue fragrance before.',
   'published', now() - interval '12 days', now() - interval '12 days'),
  ('prod_invictus', 'Neha Kulkarni', 'The opening is the point', 4,
   'First hour is beautiful — proper salty citrus, not the sweet kind. It gets quieter after lunch, which I don''t mind. Two sprays on the neck lasts me a full workday.',
   'published', now() - interval '26 days', now() - interval '26 days'),
  ('prod_invictus', 'Rohit Sharma', 'Bought the 8 ml, came back for 50', 5,
   'Used the travel size for two weeks to be sure. The drydown is what sold me — warm, slightly mossy, nothing loud. The 50 ml is on the way.',
   'published', now() - interval '41 days', now() - interval '41 days'),

  -- Velvet Bloom
  ('prod_velvet', 'Priya Nair', 'Wedding-season favourite', 5,
   'Wore this to two weddings and got asked both times. The tuberose is creamy without going soapy on me, and the Rangoon creeper keeps it interesting after midnight.',
   'published', now() - interval '9 days', now() - interval '9 days'),
  ('prod_velvet', 'Ananya Iyer', 'Soft, but it stays', 4,
   'I usually avoid florals because they disappear on my skin. This one lasted from morning till dinner. The jasmine opening is green for a while, which I like.',
   'published', now() - interval '22 days', now() - interval '22 days'),
  ('prod_velvet', 'Sneha Reddy', 'Not your aunty''s mogra', 5,
   'Expected a heavy white floral and got something fresher. It smells like a garden after rain, then turns powdery and sweet by evening.',
   'published', now() - interval '38 days', now() - interval '38 days'),

  -- Sandalwood
  ('prod_sandal', 'Vikram Joshi', 'Creamy, not sharp', 5,
   'Most sandalwood fragrances go pencil-shaving on me. This one stays warm and milky for hours. I wear it to work and it never feels loud.',
   'published', now() - interval '14 days', now() - interval '14 days'),
  ('prod_sandal', 'Karthik Menon', 'My father asked for a bottle', 4,
   'Bought it for myself, ended up gifting one to my father. It''s that kind of scent — simple, familiar, and it doesn''t try too hard. Lasts a full day on clothes.',
   'published', now() - interval '29 days', now() - interval '29 days'),
  ('prod_sandal', 'Meera Pillai', 'Winter evenings', 5,
   'Wearing it on cool evenings feels right. It is calm and close to the skin, the way real sandalwood should be.',
   'published', now() - interval '44 days', now() - interval '44 days'),

  -- Whisky Smoke
  ('prod_whisky', 'Aditya Rao', 'Date-night weapon', 5,
   'The whisky opening is genuinely boozy for the first twenty minutes, then the cinnamon and vanilla come in. My girlfriend stole the bottle, so I am buying a second one.',
   'published', now() - interval '7 days', now() - interval '7 days'),
  ('prod_whisky', 'Farhan Qureshi', 'Strong — in a good way', 4,
   'One spray is enough for a dinner. Any more and it fills the room. The leather and oudh at the end are excellent in winter.',
   'published', now() - interval '24 days', now() - interval '24 days'),
  ('prod_whisky', 'Ishita Banerjee', 'Smells like a private club', 5,
   'Smoky, sweet, a little dark. I don''t usually wear heavy scents but this one sits beautifully on skin. Got compliments at a Diwali party.',
   'published', now() - interval '36 days', now() - interval '36 days'),

  -- Bold Move
  ('prod_bold', 'Rohan Kapoor', 'Gym-bag essential', 5,
   'Fresh without smelling like shower gel. The mint and seawater are cold for the first hour, then it warms up on the skin. Great for humid days.',
   'published', now() - interval '10 days', now() - interval '10 days'),
  ('prod_bold', 'Divya Menon', 'Everyday scent, done right', 4,
   'It is the one I reach for when I don''t want to think. Clean, green, and it doesn''t clash with anything. Six hours later it is mostly a skin scent.',
   'published', now() - interval '20 days', now() - interval '20 days'),
  ('prod_bold', 'Arjun Singh', 'Better than the price suggests', 4,
   'At this price the 8 ml is a steal — I bought two for travel. The drydown has a nice mossy bite that keeps it from being generic.',
   'published', now() - interval '33 days', now() - interval '33 days');
