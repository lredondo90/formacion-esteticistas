-- Extra booking states from the product plan. Kept in its own migration because a new enum value
-- cannot be used in the same transaction that adds it.
alter type public.booking_status add value if not exists 'rejected';
alter type public.booking_status add value if not exists 'expired';
