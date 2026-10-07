export type Kind = "Régional" | "Service";
export type Ent = { id: string; name: string; area: string; kind: Kind; logo?: string };
export type Dept = { code: string; name: string };

const DEPTS =
  "01 Ain|02 Aisne|03 Allier|04 Alpes-de-Haute-Provence|05 Hautes-Alpes|06 Alpes-Maritimes|07 Ardèche|08 Ardennes|09 Ariège|10 Aube|11 Aude|12 Aveyron|13 Bouches-du-Rhône|14 Calvados|15 Cantal|16 Charente|17 Charente-Maritime|18 Cher|19 Corrèze|2A Corse-du-Sud|2B Haute-Corse|21 Côte-d'Or|22 Côtes-d'Armor|23 Creuse|24 Dordogne|25 Doubs|26 Drôme|27 Eure|28 Eure-et-Loir|29 Finistère|30 Gard|31 Haute-Garonne|32 Gers|33 Gironde|34 Hérault|35 Ille-et-Vilaine|36 Indre|37 Indre-et-Loire|38 Isère|39 Jura|40 Landes|41 Loir-et-Cher|42 Loire|43 Haute-Loire|44 Loire-Atlantique|45 Loiret|46 Lot|47 Lot-et-Garonne|48 Lozère|49 Maine-et-Loire|50 Manche|51 Marne|52 Haute-Marne|53 Mayenne|54 Meurthe-et-Moselle|55 Meuse|56 Morbihan|57 Moselle|58 Nièvre|59 Nord|60 Oise|61 Orne|62 Pas-de-Calais|63 Puy-de-Dôme|64 Pyrénées-Atlantiques|65 Hautes-Pyrénées|66 Pyrénées-Orientales|67 Bas-Rhin|68 Haut-Rhin|69 Rhône|70 Haute-Saône|71 Saône-et-Loire|72 Sarthe|73 Savoie|74 Haute-Savoie|75 Paris|76 Seine-Maritime|77 Seine-et-Marne|78 Yvelines|79 Deux-Sèvres|80 Somme|81 Tarn|82 Tarn-et-Garonne|83 Var|84 Vaucluse|85 Vendée|86 Vienne|87 Haute-Vienne|88 Vosges|89 Yonne|90 Territoire de Belfort|91 Essonne|92 Hauts-de-Seine|93 Seine-Saint-Denis|94 Val-de-Marne|95 Val-d'Oise|971 Guadeloupe|972 Martinique|973 Guyane|974 La Réunion|976 Mayotte";

export const DEPARTMENTS: Dept[] = DEPTS.split("|").map((d) => {
  const i = d.indexOf(" ");
  return { code: d.slice(0, i), name: d.slice(i + 1) };
});

export const deptEnt = (d: Dept): Ent => ({
  id: `dept-${d.code}`,
  name: `ENT de ${d.name}`,
  area: `Département · ${d.name} (${d.code})`,
  kind: "Régional",
});

const brands: Omit<Ent, "id">[] = [
  { name: "Skolengo", logo: "/logos/skolengo.png", area: "Vie scolaire · National", kind: "Service" },
  { name: "Pronote", logo: "/logos/pronote.png", area: "Vie scolaire · National", kind: "Service" },
  { name: "EcoleDirecte", logo: "/logos/ecoledirecte.png", area: "Vie scolaire · National", kind: "Service" },
  { name: "ÉduConnect", logo: "/logos/educonnect.png", area: "Portail parents/élèves · National", kind: "Service" },
  { name: "ONE / NEO", logo: "/logos/one.png", area: "Open ENT · Plusieurs territoires", kind: "Service" },
  { name: "Mon Bureau Numérique", area: "Plusieurs territoires", kind: "Service" },
  { name: "itslearning", logo: "/logos/itslearning.png", area: "Cours en ligne · National", kind: "Service" },
  { name: "Beneylu School", logo: "/logos/beneylu.png", area: "Écoles primaires · National", kind: "Service" },
  { name: "Toutatice", logo: "/logos/toutatice.ico", area: "Bretagne", kind: "Régional" },
  { name: "e-lyco", area: "Pays de la Loire", kind: "Régional" },
  { name: "L'Educ de Normandie", logo: "/logos/normandie.png", area: "Normandie", kind: "Régional" },
  { name: "Lilie", logo: "/logos/lilie.webp", area: "Centre-Val de Loire", kind: "Régional" },
  { name: "MonLycée.net", area: "Lycées · Régional", kind: "Régional" },
  { name: "Arsène 76", area: "Seine-Maritime", kind: "Régional" },
  { name: "Savoirs Numériques 62", area: "Pas-de-Calais", kind: "Régional" },
  { name: "Autre ENT (adresse à saisir)", area: "Établissement non listé", kind: "Service" },
];

export const ENTS: Ent[] = brands.map((e, i) => ({ ...e, id: String(i) }));

export const LOGOS: string[] = ENTS.flatMap((e) => (e.logo ? [e.logo] : []));

const DOWN_BRANDS = new Set(["Lilie", "Savoirs Numériques 62", "MonLycée.net"]);
export const isUnreachable = (e: Ent): boolean => {
  if (e.kind !== "Régional") return false;
  if (e.id.startsWith("dept-")) return parseInt(e.id.slice(5), 10) % 3 === 0;
  return DOWN_BRANDS.has(e.name);
};
