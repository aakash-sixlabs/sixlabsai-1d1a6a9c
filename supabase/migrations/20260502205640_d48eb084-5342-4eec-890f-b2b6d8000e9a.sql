ALTER TABLE public.meta_connections
ADD CONSTRAINT meta_connections_user_id_key UNIQUE (user_id);