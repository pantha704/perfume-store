-- 0005: optional review title (client batch follow-up, Sep 2026)
-- Reviewers can give their review a short headline; shown on the product page.

alter table public.reviews add column if not exists title text;
