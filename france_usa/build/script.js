// Narration : [sous-titre affiché, texte prononcé]. *mot* = mot-clé surligné.
const SCRIPT = [
[["SI LES *ÉTATS-UNIS*","Si les États-Unis"],["ATTAQUAIENT LA *FRANCE*…","attaquaient la France…"],["QUI VIENDRAIT L'AIDER ?","qui viendrait l'aider ?"],["TEAM *FRANCE*","Team France"],["CONTRE TEAM *USA*.","contre Team USA."]],
[["LE *PROBLÈME* ?","Le problème ?"],["LES DEUX SONT DANS L'*OTAN*.","Les deux sont dans l'OTAN."],["ET L'*ARTICLE 5*","Et l'article cinq"],["N'A *JAMAIS* PRÉVU ÇA.","n'a jamais prévu ça."],["L'OTAN… *EXPLOSE*.","L'OTAN… explose."]],
[["TEAM *FRANCE*.","Team France."],["L'*ALLEMAGNE*.","L'Allemagne."],["L'*ITALIE*.","L'Italie."],["L'*ESPAGNE*.","L'Espagne."],["LA *POLOGNE*.","La Pologne."],["TOUTE L'*UNION EUROPÉENNE* :","Toute l'Union européenne :"],["*26 PAYS*","vingt-six pays"],["OBLIGÉS D'AIDER LA FRANCE.","obligés d'aider la France."]],
[["LE *ROYAUME-UNI* ?","Le Royaume-Uni ?"],["PAS DANS L'UNION.","Pas dans l'Union."],["MAIS EN *2025*,","Mais en deux mille vingt-cinq,"],["IL A PROMIS DE COORDONNER","il a promis de coordonner"],["SA *BOMBE NUCLÉAIRE*","sa bombe nucléaire"],["AVEC *PARIS*.","avec Paris."],["PLUTÔT TEAM *FRANCE*.","Plutôt Team France."]],
[["TEAM *USA*.","Team USA."],["LE *JAPON*.","Le Japon."],["LA *CORÉE DU SUD*.","La Corée du Sud."],["L'*AUSTRALIE*.","L'Australie."],["DES *TRAITÉS DE DÉFENSE*…","Des traités de défense…"],["MAIS *AUCUN* NE MARCHE","mais aucun ne marche"],["SI C'EST L'AMÉRIQUE QUI *ATTAQUE*.","si c'est l'Amérique qui attaque."]],
[["LE *CANADA* ?","Le Canada ?"],["COLLÉ AUX ÉTATS-UNIS.","Collé aux États-Unis."],["MAIS DANS L'*OTAN*","Mais dans l'OTAN"],["AVEC LA FRANCE.","avec la France."],["*COINCÉ*.","Coincé."]],
[["LES ÉTATS-UNIS DÉPENSENT","Les États-Unis dépensent"],["PLUS DE *10 FOIS PLUS*.","plus de dix fois plus."],["*11 PORTE-AVIONS*.","Onze porte-avions."],["LA FRANCE… *UN SEUL*.","La France… un seul."]],
[["MAIS LA FRANCE A LA *BOMBE*.","Mais la France a la bombe."],["ET C'EST ELLE QUI A AIDÉ","Et c'est elle qui a aidé"],["L'*AMÉRIQUE* À NAÎTRE,","l'Amérique à naître,"],["EN *1778*.","en mille sept cent soixante-dix-huit."]],
[["TEAM *FRANCE*","Team France"],["OU TEAM *USA* ?","ou Team USA ?"],["DIS-LE EN *COMMENTAIRE*.","Dis-le en commentaire."],["ET *ABONNE-TOI*.","Et abonne-toi."]]
];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
