// Narration : [sous-titre affiché, texte prononcé]. *mot* = mot-clé surligné.
const SCRIPT = [
[["TEAM *PARIS*","Team Paris"],["CONTRE TEAM *MARSEILLE*.","contre Team Marseille."],["UN POINT PAR *MANCHE*.","Un point par manche."]],
[["LA *TAILLE* ?","La taille ?"],["PARIS : *105 KM²*.","Paris : cent cinq kilomètres carrés."],["MARSEILLE : *240*.","Marseille : deux cent quarante."],["POINT *MARSEILLE*.","Point Marseille."]],
[["LES *HABITANTS* ?","Les habitants ?"],["PARIS : PLUS DE *2 MILLIONS*.","Paris : plus de deux millions."],["MARSEILLE :","Marseille :"],["MOINS DE *900 000*.","moins de neuf cent mille."],["POINT *PARIS*.","Point Paris."]],
[["LA *MER* ?","La mer ?"],["MARSEILLE A LES *CALANQUES*.","Marseille a les Calanques."],["PARIS A… *PARIS PLAGES*.","Paris a… Paris Plages."],["POINT *MARSEILLE*.","Point Marseille."]],
[["LE *SOLEIL* ?","Le soleil ?"],["MARSEILLE : PRÈS DE *3 000 HEURES*","Marseille : près de trois mille heures"],["DE SOLEIL.","de soleil."],["PARIS : *1 700*.","Paris : mille sept cents."],["POINT *MARSEILLE*.","Point Marseille."]],
[["LE *MÉTRO* ?","Le métro ?"],["PARIS : *16 LIGNES*.","Paris : seize lignes."],["MARSEILLE : *2*.","Marseille : deux."],["POINT *PARIS*.","Point Paris."]],
[["L'*ÂGE* ?","L'âge ?"],["MARSEILLE : FONDÉE PAR LES *GRECS*,","Marseille : fondée par les Grecs,"],["IL Y A PLUS DE *2 600 ANS*.","il y a plus de deux mille six cents ans."],["POINT *MARSEILLE*.","Point Marseille."]],
[["LES *MUSÉES* ?","Les musées ?"],["PARIS : LE *LOUVRE*,","Paris : le Louvre,"],["LE MUSÉE LE PLUS VISITÉ DU MONDE.","le musée le plus visité du monde."],["POINT *PARIS*.","Point Paris."]],
[["LE *FOOT* ?","Le foot ?"],["L'*OM*, CHAMPION D'EUROPE","L'OM, champion d'Europe"],["EN *1993*.","en mille neuf cent quatre-vingt-treize."],["LE *PSG*, DEUX FOIS :","Le PSG, deux fois :"],["EN *2025* ET EN *2026*.","en deux mille vingt-cinq et en deux mille vingt-six."],["POINT *PARIS*.","Point Paris."]],
[["RÉSULTAT :","Résultat :"],["*4 PARTOUT*.","quatre partout."],["LE DERNIER POINT,","Le dernier point,"],["C'EST *TOI* QUI LE DONNES.","c'est toi qui le donnes."],["TEAM *PARIS*","Team Paris"],["OU TEAM *MARSEILLE* ?","ou Team Marseille ?"],["DIS-LE EN *COMMENTAIRE*.","Dis-le en commentaire."],["ET *ABONNE-TOI*.","Et abonne-toi."]]
];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
