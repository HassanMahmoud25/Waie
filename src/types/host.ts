/** A recurring on-air voice of Waie (see data/hosts.ts). */
export type Host = {
  id: string;
  slug: string;
  name: string;
  role?: string;
  photoUrl: string;
};
