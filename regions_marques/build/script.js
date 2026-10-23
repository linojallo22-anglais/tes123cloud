// Narration : [sous-titre affiché, texte prononcé]. *mot* = mot-clé surligné.
const SCRIPT = [
[["*CLERMONT-FERRAND*","Clermont-Ferrand"],["A *MICHELIN*.","a Michelin."],["LE PNEU…","Le pneu…"],["ET LES *ÉTOILES* DES RESTAURANTS.","et les étoiles des restaurants."]],
[["*TOULOUSE* A *AIRBUS*.","Toulouse a Airbus."]],
[["*LILLE* A *DÉCATHLON*,","Lille a Décathlon,"],["NÉ EN *1976*.","né en mille neuf cent soixante-seize."]],
[["*NANTES* A *LU*,","Nantes a LU,"],["ET SON *PETIT BEURRE*,","et son Petit Beurre,"],["DEPUIS *1886*.","depuis mille huit cent quatre-vingt-six."]],
[["LA *BRETAGNE* A *LECLERC*,","La Bretagne a Leclerc,"],["NÉ À LANDERNEAU,","né à Landerneau,"],["EN *1949*.","en mille neuf cent quarante-neuf."]],
[["LA *NORMANDIE* A","La Normandie a"],["*ELLE & VIRE*,","Elle et Vire,"],["LE BEURRE NORMAND.","le beurre normand."]],
[["*PARIS* A *LOUIS VUITTON*,","Paris a Louis Vuitton,"],["DEPUIS *1854*.","depuis mille huit cent cinquante-quatre."]],
[["*SOCHAUX* A *PEUGEOT*,","Sochaux a Peugeot,"],["ET SON *LION*.","et son lion."]],
[["LES *VOSGES* ONT","Les Vosges ont"],["*CLAIREFONTAINE*,","Clairefontaine,"],["TES CAHIERS D'ÉCOLE.","tes cahiers d'école."]],
[["*BOURGES* A *MONIN*,","Bourges a Monin,"],["LES SIROPS VENDUS DANS","les sirops vendus dans"],["PLUS DE *150 PAYS*.","plus de cent cinquante pays."]],
[["*BORDEAUX* A *CDISCOUNT*,","Bordeaux a Cdiscount,"],["NÉ EN *1998*.","né en mille neuf cent quatre-vingt-dix-huit."]],
[["*MANOSQUE* A *L'OCCITANE*…","Manosque a L'Occitane…"],["QUI N'EST MÊME PAS","qui n'est même pas"],["EN *OCCITANIE* !","en Occitanie !"]],
[["ET *BASTIA* A","Et Bastia a"],["*CORSICA FERRIES*.","Corsica Ferries."]],
[["*13 RÉGIONS*,","Treize régions,"],["*13 MARQUES*.","treize marques."],["CHAQUE RÉGION DE FRANCE","Chaque région de France"],["A LA SIENNE.","a la sienne."],["ET TOI, TA RÉGION,","Et toi, ta région,"],["C'EST QUELLE *MARQUE* ?","c'est quelle marque ?"],["DIS-LE EN *COMMENTAIRE*.","Dis-le en commentaire."],["ET *ABONNE-TOI*.","Et abonne-toi."]]
];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
