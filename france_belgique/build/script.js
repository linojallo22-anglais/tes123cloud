// Narration : [sous-titre affiché, texte prononcé]. *mot* = mot-clé surligné.
const SCRIPT = [
[["SI LA *BELGIQUE*","Si la Belgique"],["ATTAQUAIT LA *FRANCE*…","attaquait la France…"],["QUI VIENDRAIT L'AIDER ?","qui viendrait l'aider ?"],["TEAM *FRANCE*","Team France"],["CONTRE TEAM *BELGIQUE*.","contre Team Belgique."]],
[["LE *PROBLÈME* ?","Le problème ?"],["LES DEUX SONT DANS L'*OTAN*.","Les deux sont dans l'OTAN."],["ET LE *SIÈGE DE L'OTAN*…","Et le siège de l'OTAN…"],["EST À *BRUXELLES*.","est à Bruxelles."],["LE PAYS QUI ATTAQUE","Le pays qui attaque"],["ACCUEILLE L'ALLIANCE","accueille l'alliance"],["QUI DOIT L'*ARRÊTER*.","qui doit l'arrêter."]],
[["TEAM *BELGIQUE*.","Team Belgique."],["LES *PAYS-BAS* :","Les Pays-Bas :"],["DEPUIS *2017*,","depuis deux mille dix-sept,"],["CE SONT EUX QUI SURVEILLENT","ce sont eux qui surveillent"],["LE *CIEL BELGE*,","le ciel belge,"],["LA *MOITIÉ* DE L'ANNÉE.","la moitié de l'année."],["LE *LUXEMBOURG* :","Le Luxembourg :"],["C'EST LA BELGIQUE","c'est la Belgique"],["QUI PROTÈGE *SON CIEL*.","qui protège son ciel."]],
[["TEAM *FRANCE*.","Team France."],["L'*ALLEMAGNE*.","L'Allemagne."],["L'*ESPAGNE*.","L'Espagne."],["L'*ITALIE*.","L'Italie."],["TOUTE L'*UNION EUROPÉENNE*.","Toute l'Union européenne."]],
[["L'*ARMÉE BELGE* ?","L'armée belge ?"],["ENVIRON *30 000* SOLDATS.","Environ trente mille soldats."],["LA *FRANCE* ?","La France ?"],["PLUS DE *200 000*.","Plus de deux cent mille."],["*7 FOIS* PLUS.","Sept fois plus."]],
[["MAIS *BRUXELLES*","Mais Bruxelles"],["ET LA *WALLONIE*","et la Wallonie"],["PARLENT *FRANÇAIS*.","parlent français."],["*QUI ATTAQUE QUI* ?","Qui attaque qui ?"]],
[["LA DERNIÈRE FOIS","La dernière fois"],["QUE LA BELGIQUE","que la Belgique"],["A ATTAQUÉ LA FRANCE ?","a attaqué la France ?"],["*DEMI-FINALE*","Demi-finale"],["DE LA *COUPE DU MONDE 2018*.","de la Coupe du monde deux mille dix-huit."],["*1 À 0*.","Un à zéro."],["POUR LA *FRANCE*.","Pour la France."]],
[["LE PLUS *FOU* ?","Le plus fou ?"],["EN *1831*,","En mille huit cent trente et un,"],["LES BELGES ONT ÉLU","les Belges ont élu"],["COMME *ROI*…","comme roi…"],["LE *FILS DU ROI DE FRANCE*.","le fils du roi de France."]],
[["TEAM *FRANCE*","Team France"],["OU TEAM *BELGIQUE* ?","ou Team Belgique ?"],["DIS-LE EN *COMMENTAIRE*.","Dis-le en commentaire."],["ET *ABONNE-TOI*.","Et abonne-toi."]]
];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
