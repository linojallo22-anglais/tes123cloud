// Narration : [sous-titre affiché, texte prononcé]. *mot* = mot-clé surligné.
const SCRIPT = [
[["LA *FRANCE* EST PROPRIÉTAIRE","La France est propriétaire"],["DE *4 LIEUX*","de quatre lieux"],["EN *TERRE SAINTE*.","en Terre sainte."],["*3* À *JÉRUSALEM*,","Trois à Jérusalem,"],["*1* JUSTE À CÔTÉ.","un juste à côté."],["ON LES APPELLE","On les appelle"],["LES *DOMAINES NATIONAUX*","les domaines nationaux"],["FRANÇAIS.","français."]],
[["LE PREMIER :","Le premier :"],["L'ÉGLISE *SAINTE-ANNE*.","l'église Sainte-Anne."],["EN *1856*,","En mille huit cent cinquante-six,"],["LE *SULTAN OTTOMAN*","le sultan ottoman"],["L'OFFRE À *NAPOLÉON III*,","l'offre à Napoléon trois,"],["APRÈS LA GUERRE DE CRIMÉE.","après la guerre de Crimée."]],
[["LE DEUXIÈME :","Le deuxième :"],["L'*ÉLÉONA*,","l'Éléona,"],["SUR LE *MONT DES OLIVIERS*.","sur le mont des Oliviers."],["SELON LA TRADITION,","Selon la tradition,"],["C'EST LÀ QUE JÉSUS","c'est là que Jésus"],["A ENSEIGNÉ LE *NOTRE PÈRE*.","a enseigné le Notre Père."]],
[["LE TROISIÈME :","Le troisième :"],["LE *TOMBEAU DES ROIS*.","le Tombeau des Rois."],["UN TOMBEAU CREUSÉ","Un tombeau creusé"],["DANS LA *ROCHE*,","dans la roche,"],["IL Y A PRÈS DE *2 000 ANS*.","il y a près de deux mille ans."]],
[["LE QUATRIÈME :","Le quatrième :"],["L'ABBAYE D'*ABOU GOSH*,","l'abbaye d'Abou Gosh,"],["UNE ÉGLISE DES *CROISÉS*.","une église des croisés."]],
[["ET CE SONT DES","Et ce sont des"],["*GENDARMES FRANÇAIS*","gendarmes français"],["QUI VEILLENT SUR CES LIEUX.","qui veillent sur ces lieux."]],
[["EN *1996*,","En mille neuf cent quatre-vingt-seize,"],["*JACQUES CHIRAC*","Jacques Chirac"],["REFUSE D'ENTRER À SAINTE-ANNE","refuse d'entrer à Sainte-Anne"],["TANT QUE DES SOLDATS ISRAÉLIENS","tant que des soldats israéliens"],["SONT À L'INTÉRIEUR.","sont à l'intérieur."],["EN *2020*,","En deux mille vingt,"],["*EMMANUEL MACRON*","Emmanuel Macron"],["LANCE AUX POLICIERS ISRAÉLIENS :","lance aux policiers israéliens :"],["« *SORTEZ !* »","Sortez !"]],
[["EN *2024*,","En deux mille vingt-quatre,"],["*2 GENDARMES FRANÇAIS*","deux gendarmes français"],["SONT ARRÊTÉS SUR L'ÉLÉONA.","sont arrêtés sur l'Éléona."],["LE *MINISTRE* FRANÇAIS","Le ministre français"],["REFUSE ALORS D'ENTRER.","refuse alors d'entrer."]],
[["TU SAVAIS QUE LA FRANCE","Tu savais que la France"],["AVAIT UN BOUT DE *JÉRUSALEM* ?","avait un bout de Jérusalem ?"],["DIS-LE EN *COMMENTAIRE*.","Dis-le en commentaire."],["ET *ABONNE-TOI*.","Et abonne-toi."]]
];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
