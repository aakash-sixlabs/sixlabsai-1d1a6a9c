-- Fix infinite recursion on account_users policies
CREATE OR REPLACE FUNCTION public.is_account_admin(_user_id uuid, _account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.account_users
    WHERE user_id = _user_id
      AND account_id = _account_id
      AND role IN ('account_admin'::user_role, 'superadmin'::user_role)
  );
$$;

DROP POLICY IF EXISTS account_users_admin_write ON public.account_users;
DROP POLICY IF EXISTS account_users_read ON public.account_users;

-- Read: own membership, or superadmin. Avoid self-referential subquery.
CREATE POLICY account_users_read ON public.account_users
FOR SELECT
USING (user_id = auth.uid() OR public.is_superadmin(auth.uid()));

-- Write: superadmin, account admin (via SD function), or self-insert of own membership
CREATE POLICY account_users_insert ON public.account_users
FOR INSERT
WITH CHECK (
  public.is_superadmin(auth.uid())
  OR public.is_account_admin(auth.uid(), account_id)
  OR user_id = auth.uid()
);

CREATE POLICY account_users_update ON public.account_users
FOR UPDATE
USING (public.is_superadmin(auth.uid()) OR public.is_account_admin(auth.uid(), account_id))
WITH CHECK (public.is_superadmin(auth.uid()) OR public.is_account_admin(auth.uid(), account_id));

CREATE POLICY account_users_delete ON public.account_users
FOR DELETE
USING (public.is_superadmin(auth.uid()) OR public.is_account_admin(auth.uid(), account_id));