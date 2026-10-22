// Narration : [sous-titre affiché, texte prononcé]. *mot* = mot-clé surligné.
const SCRIPT = [
[["SI L'*ALGÉRIE* ET LE *MAROC*","Si l'Algérie et le Maroc"],["ENTRAIENT EN GUERRE…","entraient en guerre…"],["QUI VIENDRAIT LES AIDER ?","qui viendrait les aider ?"],["TEAM *ALGÉRIE*","Team Algérie"],["CONTRE TEAM *MAROC*.","contre Team Maroc."]],
[["TEAM *MAROC*.","Team Maroc."],["LES *ÉTATS-UNIS* :","Les États-Unis :"],["ALLIÉ MAJEUR DEPUIS *2004*.","allié majeur depuis deux mille quatre."],["*ISRAËL* :","Israël :"],["UN ACCORD MILITAIRE EN *2021*.","un accord militaire en deux mille vingt et un."],["LA *FRANCE*.","La France."],["L'*ESPAGNE*.","L'Espagne."],["LE *ROYAUME-UNI*.","Le Royaume-Uni."],["LES *ÉMIRATS*.","Les Émirats."],["L'*ARABIE SAOUDITE*.","L'Arabie saoudite."],["*BAHREÏN*.","Bahreïn."],["TOUS SOUTIENNENT","Tous soutiennent"],["SON PLAN POUR LE *SAHARA*.","son plan pour le Sahara."]],
[["TEAM *ALGÉRIE*.","Team Algérie."],["LA *RUSSIE* :","La Russie :"],["SON PREMIER *VENDEUR D'ARMES*.","son premier vendeur d'armes."],["LA *CHINE* :","La Chine :"],["PARTENAIRE STRATÉGIQUE.","partenaire stratégique."],["L'*AFRIQUE DU SUD*.","L'Afrique du Sud."],["LA *TUNISIE*.","La Tunisie."],["TOUS PROCHES D'*ALGER*.","Tous proches d'Alger."]],
[["MAIS *AUCUN* N'EST OBLIGÉ","Mais aucun n'est obligé"],["DE SE BATTRE.","de se battre."],["*AUCUN TRAITÉ*.","Aucun traité."]],
[["LES *CHIFFRES* ?","Les chiffres ?"],["L'ALGÉRIE DÉPENSE","L'Algérie dépense"],["*25 MILLIARDS DE DOLLARS*","vingt-cinq milliards de dollars"],["POUR SON ARMÉE.","pour son armée."],["LE MAROC, *6*.","Le Maroc, six."],["*4 FOIS MOINS*.","Quatre fois moins."],["L'ALGÉRIE : *47 MILLIONS*","L'Algérie : quarante-sept millions"],["D'HABITANTS.","d'habitants."],["LE MAROC : *37*.","Le Maroc : trente-sept."]],
[["LA *FRONTIÈRE* ?","La frontière ?"],["FERMÉE DEPUIS *1994*.","Fermée depuis mille neuf cent quatre-vingt-quatorze."]],
[["TEAM *ALGÉRIE*","Team Algérie"],["OU TEAM *MAROC* ?","ou Team Maroc ?"],["DIS-LE EN *COMMENTAIRE*.","Dis-le en commentaire."],["ET *ABONNE-TOI*.","Et abonne-toi."]]
];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
