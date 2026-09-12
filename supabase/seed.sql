-- Safe demo/staging seed. Replace all merchant data and provider mappings before launch.
-- Demo mode does not require this file; it uses data/demo-products.ts.

insert into public.products
(id,slug,name,eyebrow,short_description,description,family,concentration,image_url,image_alt,accent,notes,metadata,featured,sort_order)
values
('00000000-0000-4000-8000-000000000001','nocturne-01','Nocturne 01','After dark','Black pepper and cold iris folding into suede, smoked cedar and amber.','A dry, smoky composition designed as placeholder catalogue data.','Smoky','Eau de Parfum','/products/nocturne.svg','Placeholder artwork for Nocturne 01','#8d6c4f','{"top":["Black pepper","Bergamot"],"heart":["Suede","Iris","Cedar"],"base":["Amber","Vetiver","Smoke"]}'::jsonb,'{"story":"Built for evenings when the air cools.","performance":{"longevityHours":[7,9],"sillage":"noticeable","seasons":["Autumn","Winter"],"occasions":["Dinner","Evening events"],"dayNight":"night","wearsLike":"dry woods, soft leather and warm skin"}}'::jsonb,true,10),
('00000000-0000-4000-8000-000000000002','velvet-bloom','Velvet Bloom','Soft power','Saffron, rose and violet wrapped in vanilla and clean white musk.','A soft floral placeholder composition.','Floral','Eau de Parfum','/products/velvet.svg','Placeholder artwork for Velvet Bloom','#a96d72','{"top":["Saffron","Pink pepper","Pear"],"heart":["Rose","Jasmine","Violet"],"base":["Vanilla","White musk","Sandalwood"]}'::jsonb,'{"story":"A floral made to feel textured, not decorative.","performance":{"longevityHours":[6,8],"sillage":"noticeable","seasons":["Spring","Autumn"],"occasions":["Dinner","Everyday"],"dayNight":"both","wearsLike":"petals, saffron and warm musky fabric"}}'::jsonb,true,20),
('00000000-0000-4000-8000-000000000003','sandalwood-atelier','Sandalwood Atelier','Quiet woods','Cardamom and iris sharpen creamy sandalwood, cedar and pale musk.','A polished woody placeholder composition.','Woody','Eau de Parfum','/products/sandalwood.svg','Placeholder artwork for Sandalwood Atelier','#9a7c56','{"top":["Cardamom","Lemon peel","Juniper"],"heart":["Sandalwood","Cypress","Iris"],"base":["Cedar","Musk","Amberwood"]}'::jsonb,'{"story":"Planed wood, linen and open windows.","performance":{"longevityHours":[7,10],"sillage":"close","seasons":["All year","Monsoon"],"occasions":["Office","Travel"],"dayNight":"both","wearsLike":"creamy wood cut with dry spice and clean air"}}'::jsonb,true,30),
('00000000-0000-4000-8000-000000000004','whiskey-smoke','Whiskey Smoke','Barrel room','Dried plum, toasted oak and labdanum with tobacco leaf and patchouli.','A dark amber placeholder composition.','Amber','Extrait de Parfum','/products/whiskey.svg','Placeholder artwork for Whiskey Smoke','#6f5139','{"top":["Dried plum","Cinnamon","Orange"],"heart":["Toasted oak","Labdanum","Tobacco leaf"],"base":["Patchouli","Amber","Vanilla"]}'::jsonb,'{"story":"Warm wood, dark fruit and low light.","performance":{"longevityHours":[9,12],"sillage":"noticeable","seasons":["Winter","Autumn"],"occasions":["Dinner","Evening events"],"dayNight":"night","wearsLike":"dark fruit, toasted wood and resinous warmth"}}'::jsonb,false,40),
('00000000-0000-4000-8000-000000000005','boldmove','Boldmove','Daylight energy','Grapefruit and mint over aromatic herbs, vetiver and mineral woods.','A bright fresh placeholder composition.','Fresh','Eau de Parfum','/products/boldmove.svg','Placeholder artwork for Boldmove','#53796f','{"top":["Grapefruit","Mandarin","Mint"],"heart":["Lavender","Clary sage","Geranium"],"base":["Vetiver","Mineral woods","Musk"]}'::jsonb,'{"story":"A cleaner line for hot days and movement.","performance":{"longevityHours":[5,7],"sillage":"close","seasons":["Summer","All year"],"occasions":["Office","Travel"],"dayNight":"day","wearsLike":"bitter citrus, green herbs and mineral woods"}}'::jsonb,false,50),
('00000000-0000-4000-8000-000000000006','discovery-set','Discovery Set','Five scents · one decision','Five 2 ml vials across the collection.','Wear the collection before committing to a bottle.','Fresh','Mixed concentrations','/products/discovery.svg','Placeholder artwork for Discovery Set','#7e766b','{"top":["Five openings"],"heart":["Five signatures"],"base":["Five drydowns"]}'::jsonb,'{"story":"A week of testing is more useful than a hundred adjectives.","isDiscoverySet":true,"performance":{"longevityHours":[5,12],"sillage":"noticeable","seasons":["All year"],"occasions":["Discovery","Gifting"],"dayNight":"both","wearsLike":"the entire collection in one box"}}'::jsonb,false,60)
on conflict (slug) do update set
name=excluded.name, eyebrow=excluded.eyebrow, short_description=excluded.short_description,
description=excluded.description, family=excluded.family, concentration=excluded.concentration,
image_url=excluded.image_url, image_alt=excluded.image_alt, accent=excluded.accent,
notes=excluded.notes, metadata=excluded.metadata, featured=excluded.featured, sort_order=excluded.sort_order;

insert into public.variants
(id,product_id,sku,label,size_ml,price_paise,weight_grams,kind,preferred_fulfillment_provider,is_active)
values
('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','VEL-NOC-02','2 ml sample',2,24900,40,'sample','manual',true),
('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','VEL-NOC-50','50 ml',50,149900,320,'bottle','manual',true),
('10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000002','VEL-VBL-02','2 ml sample',2,22900,40,'sample','manual',true),
('10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000002','VEL-VBL-50','50 ml',50,139900,320,'bottle','manual',true),
('10000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000003','VEL-SAN-02','2 ml sample',2,24900,40,'sample','manual',true),
('10000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000003','VEL-SAN-100','100 ml',100,239900,480,'bottle','manual',true),
('10000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000004','VEL-WHS-02','2 ml sample',2,27900,40,'sample','manual',true),
('10000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000004','VEL-WHS-50','50 ml',50,179900,340,'bottle','manual',true),
('10000000-0000-4000-8000-000000000009','00000000-0000-4000-8000-000000000005','VEL-BLD-02','2 ml sample',2,19900,40,'sample','manual',true),
('10000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000005','VEL-BLD-50','50 ml',50,119900,320,'bottle','manual',true),
('10000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000006','VEL-DISC-10','5 × 2 ml',10,79900,160,'discovery','manual',true)
on conflict (sku) do update set label=excluded.label,size_ml=excluded.size_ml,price_paise=excluded.price_paise,weight_grams=excluded.weight_grams,kind=excluded.kind,is_active=excluded.is_active;

insert into public.variant_fulfillment_mappings (variant_id,provider,enabled,priority)
select id,'manual',true,100 from public.variants where sku like 'VEL-%'
on conflict (variant_id,provider) do update set enabled=true,priority=100;

-- Optional provider rows are deliberately disabled placeholders.
insert into public.variant_fulfillment_mappings (variant_id,provider,provider_sku,inventory_sku,enabled,priority,metadata)
select id,'amazon_mcf','REPLACE-AMAZON-SKU-'||sku,'REPLACE-SELLER-SKU-'||sku,false,10,'{"note":"Validate Seller Central/SP-API mapping before enabling"}'::jsonb
from public.variants where kind='bottle'
on conflict (variant_id,provider) do nothing;

insert into public.variant_fulfillment_mappings (variant_id,provider,provider_sku,enabled,priority,metadata)
select id,'shiprocket',sku,false,20,'{"note":"Validate Shiprocket pickup/serviceability before enabling"}'::jsonb
from public.variants where kind='bottle'
on conflict (variant_id,provider) do nothing;
