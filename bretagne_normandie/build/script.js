// Narration : [sous-titre affiché, texte prononcé]. *mot* = mot-clé surligné.
const SCRIPT = [
[["TEAM *BRETAGNE*","Team Bretagne"],["CONTRE TEAM *NORMANDIE*.","contre Team Normandie."],["*1 POINT* PAR MANCHE.","Un point par manche."]],
[["LE *MONT-SAINT-MICHEL* ?","Le Mont-Saint-Michel ?"],["IL EST EN *NORMANDIE*.","Il est en Normandie."],["MÊME S'IL A ÉTÉ *BRETON*","Même s'il a été breton"],["AU *IXE SIÈCLE*.","au neuvième siècle."],["POINT *NORMANDIE*.","Point Normandie."]],
[["LES *HABITANTS* ?","Les habitants ?"],["BRETAGNE : *3,5 MILLIONS*.","Bretagne : trois millions et demi."],["NORMANDIE :","Normandie :"],["*3,35 MILLIONS*.","trois millions trois cent cinquante mille."],["POINT *BRETAGNE*.","Point Bretagne."]],
[["LA *MER* ?","La mer ?"],["BRETAGNE : ENVIRON","Bretagne : environ"],["*2 500 KM* DE CÔTES,","deux mille cinq cents kilomètres de côtes,"],["LE *RECORD DE FRANCE*.","le record de France."],["NORMANDIE : *640*.","Normandie : six cent quarante."],["POINT *BRETAGNE*.","Point Bretagne."]],
[["LE *FROMAGE* ?","Le fromage ?"],["*CAMEMBERT*, *LIVAROT*,","Camembert, livarot,"],["*PONT-L'ÉVÊQUE*, *NEUFCHÂTEL*.","pont-l'évêque, neufchâtel."],["POINT *NORMANDIE*.","Point Normandie."]],
[["L'*HISTOIRE* ?","L'histoire ?"],["LE *6 JUIN 1944*,","Le six juin mille neuf cent quarante-quatre,"],["LE *DÉBARQUEMENT*,","le Débarquement,"],["C'EST EN NORMANDIE.","c'est en Normandie."],["POINT *NORMANDIE*.","Point Normandie."]],
[["LE *FOOT* ?","Le foot ?"],["EN *LIGUE 1* :","En Ligue un :"],["*RENNES*, *BREST* ET *LORIENT*","Rennes, Brest et Lorient"],["POUR LA BRETAGNE.","pour la Bretagne."],["*LE HAVRE* POUR LA NORMANDIE.","Le Havre pour la Normandie."],["POINT *BRETAGNE*.","Point Bretagne."]],
[["LA *FÊTE* ?","La fête ?"],["LES *VIEILLES CHARRUES* :","Les Vieilles Charrues :"],["PRÈS DE *300 000* FESTIVALIERS","près de trois cent mille festivaliers"],["CHAQUE ÉTÉ.","chaque été."],["POINT *BRETAGNE*.","Point Bretagne."]],
[["L'*ART* ?","L'art ?"],["AU HAVRE, *MONET* PEINT","Au Havre, Monet peint"],["« *IMPRESSION, SOLEIL LEVANT* ».","Impression, soleil levant."],["LE TABLEAU QUI A LANCÉ","Le tableau qui a lancé"],["L'*IMPRESSIONNISME*.","l'impressionnisme."],["POINT *NORMANDIE*.","Point Normandie."]],
[["RÉSULTAT :","Résultat :"],["*4 PARTOUT*.","quatre partout."],["LE DERNIER POINT,","Le dernier point,"],["C'EST *TOI* QUI LE DONNES.","c'est toi qui le donnes."],["TEAM *BRETAGNE*","Team Bretagne"],["OU TEAM *NORMANDIE* ?","ou Team Normandie ?"],["DIS-LE EN *COMMENTAIRE*.","Dis-le en commentaire."],["ET *ABONNE-TOI*.","Et abonne-toi."]]
];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
