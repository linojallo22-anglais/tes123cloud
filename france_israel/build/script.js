// Narration : [sous-titre affiché, texte prononcé]. *mot* = mot-clé surligné.
const SCRIPT = [
[["SI *ISRAËL*","Si Israël"],["ATTAQUAIT LA *FRANCE*…","attaquait la France…"],["QUI VIENDRAIT L'AIDER ?","qui viendrait l'aider ?"],["TEAM *FRANCE*","Team France"],["CONTRE TEAM *ISRAËL*.","contre Team Israël."]],
[["TEAM *FRANCE*.","Team France."],["L'*ALLEMAGNE*.","L'Allemagne."],["L'*ITALIE*.","L'Italie."],["L'*ESPAGNE*.","L'Espagne."],["LA *POLOGNE*.","La Pologne."],["LA *BELGIQUE*.","La Belgique."],["LES *PAYS-BAS*.","Les Pays-Bas."],["LA *NORVÈGE*.","La Norvège."],["LE *CANADA*.","Le Canada."],["MÊME LA *TURQUIE*.","Même la Turquie."],["TOUTE L'*OTAN* :","Toute l'OTAN :"],["*32 PAYS*.","trente-deux pays."]],
[["PLUS L'*AUTRICHE*.","Plus l'Autriche."],["L'*IRLANDE*.","L'Irlande."],["*MALTE*.","Malte."],["*CHYPRE*.","Chypre."],["*36 PAYS*.","Trente-six pays."]],
[["TEAM *ISRAËL*.","Team Israël."],["LES *ÉTATS-UNIS* ?","Les États-Unis ?"],["SON *MEILLEUR AMI*.","Son meilleur ami."],["MAIS *AUCUN TRAITÉ*","Mais aucun traité"],["AVEC ISRAËL.","avec Israël."],["ET ILS SONT DANS L'*OTAN*.","Et ils sont dans l'OTAN."],["DONC… TEAM *FRANCE*.","Donc… Team France."]],
[["LA *GRÈCE* ET *CHYPRE* ?","La Grèce et Chypre ?"],["AMIES D'ISRAËL.","Amies d'Israël."],["MAIS DANS L'*EUROPE*.","Mais dans l'Europe."],["TEAM *FRANCE*.","Team France."]],
[["L'*ALLEMAGNE* ?","L'Allemagne ?"],["GRANDE AMIE D'ISRAËL.","Grande amie d'Israël."],["MAIS DANS L'*OTAN*.","Mais dans l'OTAN."],["TEAM *FRANCE*.","Team France."]],
[["POUR VENIR À *PARIS* :","Pour venir à Paris :"],["*3 300 KM*.","trois mille trois cents kilomètres."],["QUE DES PAYS","Que des pays"],["DE TEAM *FRANCE*.","de Team France."]],
[["LA *FRANCE* ?","La France ?"],["*25 FOIS* PLUS GRANDE.","Vingt-cinq fois plus grande."]],
[["RÉSULTAT :","Résultat :"],["*36 PAYS*…","trente-six pays…"],["CONTRE *UN*.","contre un."]],
[["MAIS *ISRAËL* A","Mais Israël a"],["UNE DES ARMÉES","une des armées"],["LES PLUS *FORTES* DU MONDE.","les plus fortes du monde."]],
[["TEAM *FRANCE*","Team France"],["OU TEAM *ISRAËL* ?","ou Team Israël ?"],["DIS-LE EN *COMMENTAIRE*.","Dis-le en commentaire."],["ET *ABONNE-TOI*.","Et abonne-toi."]]
];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
