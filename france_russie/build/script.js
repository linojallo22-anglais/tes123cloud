// Narration : [sous-titre affiché, texte prononcé]. *mot* = mot-clé surligné.
const SCRIPT = [
[["SI LA *RUSSIE* ATTAQUAIT","Si la Russie attaquait"],["LA *FRANCE* DEMAIN…","la France demain…"],["QUI VIENDRAIT L'AIDER ?","qui viendrait l'aider ?"],["TEAM *FRANCE*","Team France"],["CONTRE TEAM *RUSSIE*.","contre Team Russie."],["VOICI LES VRAIS *ALLIÉS*","Voici les vrais alliés"],["DE CHAQUE CAMP.","de chaque camp."]],
[["TEAM FRANCE, C'EST L'*OTAN*.","Team France, c'est l'OTAN."],["LE *ROYAUME-UNI*,","Le Royaume-Uni,"],["L'*ALLEMAGNE*,","l'Allemagne,"],["L'*ITALIE*,","l'Italie,"],["L'*ESPAGNE*,","l'Espagne,"],["LA *POLOGNE*…","la Pologne…"],["*31 PAYS*","trente et un pays"],["ENGAGÉS À LA DÉFENDRE.","engagés à la défendre."]],
[["MÊME L'*AUTRICHE*","Même l'Autriche"],["ET L'*IRLANDE*,","et l'Irlande,"],["DEUX PAYS *NEUTRES*,","deux pays neutres,"],["ONT PROMIS LEUR AIDE","ont promis leur aide"],["À TRAVERS L'UNION EUROPÉENNE.","à travers l'Union européenne."]],
[["ET DE L'AUTRE CÔTÉ","Et de l'autre côté"],["DE L'*ATLANTIQUE* :","de l'Atlantique :"],["LE *CANADA*…","le Canada…"],["ET LES *ÉTATS-UNIS*,","et les États-Unis,"],["LA PREMIÈRE ARMÉE DU MONDE.","la première armée du monde."]],
[["EN FACE, TEAM *RUSSIE*.","En face, Team Russie."],["D'ABORD LA *BIÉLORUSSIE*,","D'abord la Biélorussie,"],["SON ALLIÉ LE PLUS FIDÈLE.","son allié le plus fidèle."]],
[["PUIS LA *CORÉE DU NORD* :","Puis la Corée du Nord :"],["SES SOLDATS ONT DÉJÀ","ses soldats ont déjà"],["*COMBATTU* POUR LA RUSSIE.","combattu pour la Russie."]],
[["AJOUTE LE *KAZAKHSTAN*,","Ajoute le Kazakhstan,"],["LE *KIRGHIZISTAN*","le Kirghizistan"],["ET LE *TADJIKISTAN*,","et le Tadjikistan,"],["SES ALLIÉS MILITAIRES","ses alliés militaires"],["D'ASIE CENTRALE.","d'Asie centrale."]],
[["ET L'*IRAN* ?","Et l'Iran ?"],["ET LA *CHINE* ?","Et la Chine ?"],["DES PARTENAIRES, OUI…","Des partenaires, oui…"],["MAIS *AUCUN TRAITÉ*","mais aucun traité"],["NE LES OBLIGE","ne les oblige"],["À SE BATTRE POUR MOSCOU.","à se battre pour Moscou."]],
[["RÉSULTAT :","Résultat :"],["*36 PAYS* CONTRE *6*.","trente-six pays contre six."],["MAIS LA RUSSIE A","Mais la Russie a"],["LE PLUS GRAND STOCK","le plus grand stock"],["DE BOMBES *NUCLÉAIRES*","de bombes nucléaires"],["AU MONDE.","au monde."]],
[["ALORS, QUELLE ÉQUIPE","Alors, quelle équipe"],["EST LA PLUS *FORTE* ?","est la plus forte ?"],["ET TON PAYS, IL EST OÙ ?","Et ton pays, il est où ?"],["DIS-LE EN COMMENTAIRE,","Dis-le en commentaire,"],["ET *ABONNE-TOI*.","et abonne-toi."]]
];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
