-- Drop directed follow model
DROP TABLE IF EXISTS public.connections;
DROP INDEX IF EXISTS idx_connections_follower;
DROP INDEX IF EXISTS idx_connections_following;

-- Bidirectional friend model
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'declined');

CREATE TABLE public.connections (
  requester_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        connection_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  PRIMARY KEY (requester_id, addressee_id),
  CONSTRAINT no_self_friend CHECK (requester_id <> addressee_id)
);

CREATE INDEX idx_connections_requester ON public.connections(requester_id);
CREATE INDEX idx_connections_addressee ON public.connections(addressee_id);
CREATE INDEX idx_connections_status    ON public.connections(status);

-- updated_at trigger
CREATE TRIGGER connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Users can see requests they sent or received
CREATE POLICY "connections_select_own" ON public.connections FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Only the requester can send a request
CREATE POLICY "connections_insert_own" ON public.connections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

-- Only the addressee can accept/decline
CREATE POLICY "connections_update_addressee" ON public.connections FOR UPDATE TO authenticated
  USING (auth.uid() = addressee_id);

-- Either party can remove (cancel request or unfriend)
CREATE POLICY "connections_delete_own" ON public.connections FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
