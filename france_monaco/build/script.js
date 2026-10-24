// Narration : [sous-titre affiché, texte prononcé]. *mot* = mot-clé surligné.
const SCRIPT = [
[["SI *MONACO*","Si Monaco"],["ATTAQUAIT LA *FRANCE*…","attaquait la France…"],["QUI VIENDRAIT L'AIDER ?","qui viendrait l'aider ?"],["TEAM *FRANCE*","Team France"],["CONTRE TEAM *MONACO*.","contre Team Monaco."]],
[["TEAM *MONACO*.","Team Monaco."],["SON *ARMÉE* ?","Son armée ?"],["IL N'Y EN A *PAS*.","Il n'y en a pas."],["ENVIRON *120 CARABINIERS*","Environ cent vingt carabiniers"],["DU PRINCE.","du Prince."],["DES *FORMULE 1*.","Des Formule un."],["DES *YACHTS*.","Des yachts."],["ET UN *CASINO*.","Et un casino."]],
[["TEAM *FRANCE*.","Team France."],["L'*ALLEMAGNE*.","L'Allemagne."],["L'*ITALIE*.","L'Italie."],["L'*ESPAGNE*.","L'Espagne."],["LA *POLOGNE*.","La Pologne."],["LA *BELGIQUE*.","La Belgique."],["TOUTE L'*OTAN* :","Toute l'OTAN :"],["*32 PAYS*.","trente-deux pays."],["PLUS L'*UNION EUROPÉENNE*.","Plus l'Union européenne."]],
[["MAIS VOICI LE *PROBLÈME*.","Mais voici le problème."],["DEPUIS *1918*,","Depuis mille neuf cent dix-huit,"],["DES *TRAITÉS* DISENT","des traités disent"],["QUE C'EST LA *FRANCE*…","que c'est la France…"],["QUI *DÉFEND MONACO*.","qui défend Monaco."]],
[["DONC SI MONACO","Donc si Monaco"],["ATTAQUE LA FRANCE,","attaque la France,"],["LA FRANCE DOIT","la France doit"],["*DÉFENDRE MONACO*…","défendre Monaco…"],["CONTRE *LA FRANCE*.","contre la France."]],
[["LA *TAILLE* ?","La taille ?"],["*2 KM²*.","Deux kilomètres carrés."],["*4 FOIS* PLUS PETIT","Quatre fois plus petit"],["QUE LE *BOIS DE BOULOGNE*.","que le bois de Boulogne."],["*50 FOIS* PLUS PETIT","Cinquante fois plus petit"],["QUE *PARIS*.","que Paris."]],
[["LES *HABITANTS* ?","Les habitants ?"],["*38 000*.","Trente-huit mille."],["DEUX FOIS MOINS","Deux fois moins"],["QUE LE *STADE DE FRANCE*.","que le Stade de France."]],
[["LA *FRONTIÈRE* ?","La frontière ?"],["ENVIRON *6 KM*.","Environ six kilomètres."],["À PIED,","À pied,"],["UN PEU PLUS D'*UNE HEURE*.","un peu plus d'une heure."]],
[["RÉSULTAT :","Résultat :"],["*36 PAYS* CONTRE *1*.","trente-six pays contre un."],["ET LE SEUL ALLIÉ","Et le seul allié"],["DE MONACO…","de Monaco…"],["C'EST *LA FRANCE*.","c'est la France."]],
[["TEAM *FRANCE*","Team France"],["OU TEAM *MONACO* ?","ou Team Monaco ?"],["DIS-LE EN *COMMENTAIRE*.","Dis-le en commentaire."],["ET *ABONNE-TOI*.","Et abonne-toi."]]
];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
