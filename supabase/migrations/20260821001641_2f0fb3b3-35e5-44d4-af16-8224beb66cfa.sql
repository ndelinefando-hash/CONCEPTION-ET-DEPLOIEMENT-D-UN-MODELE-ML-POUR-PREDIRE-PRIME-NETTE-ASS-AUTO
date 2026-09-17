CREATE TABLE public.devis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  nom text NOT NULL,
  telephone text NOT NULL,
  email text,
  ville text,
  immatriculation text NOT NULL,
  marque text,
  modele_vehicule text,
  categorie text NOT NULL,
  puissance integer NOT NULL,
  age_vehicule integer NOT NULL,
  places integer NOT NULL,
  valeur_venale numeric NOT NULL DEFAULT 0,
  usage text,
  zone text NOT NULL,
  intermediaire text NOT NULL,
  renouvellement boolean NOT NULL DEFAULT false,
  effet date NOT NULL,
  echeance date NOT NULL,
  exposition numeric NOT NULL,
  garanties text[] NOT NULL DEFAULT '{}',
  prime_pure_annuelle numeric NOT NULL,
  prime_pure_prorata numeric NOT NULL,
  prime_ttc numeric NOT NULL,
  email_envoye_le timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.devis TO service_role;

ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;