// Narration : [sous-titre affiché, texte prononcé]. *mot* = mot-clé surligné.
const SCRIPT = [
[["SI LE *ROYAUME-UNI*","Si le Royaume-Uni"],["ATTAQUAIT LA *FRANCE*…","attaquait la France…"],["QUI VIENDRAIT L'AIDER ?","qui viendrait l'aider ?"],["TEAM *FRANCE*.","Team France."],["CONTRE TEAM *ROYAUME-UNI*.","Contre Team Royaume-Uni."],["VOICI LES VRAIS *ALLIÉS*.","Voici les vrais alliés."]],
[["TEAM FRANCE, C'EST","Team France, c'est"],["L'*UNION EUROPÉENNE*.","l'Union européenne."],["L'*ALLEMAGNE*.","L'Allemagne."],["L'*ITALIE*.","L'Italie."],["L'*ESPAGNE*.","L'Espagne."],["LA *POLOGNE*.","La Pologne."],["LA *BELGIQUE*.","La Belgique."],["LES *PAYS-BAS*.","Les Pays-Bas."],["LA *SUÈDE*.","La Suède."],["LA *GRÈCE*.","La Grèce."],["LE *PORTUGAL*.","Le Portugal."],["*26 PAYS*,","Vingt-six pays,"],["TOUS TENUS DE L'AIDER.","tous tenus de l'aider."]],
[["MÊME L'*IRLANDE*…","Même l'Irlande…"],["LA VOISINE DES ANGLAIS.","la voisine des Anglais."]],
[["EN FACE, TEAM *ROYAUME-UNI*.","En face, Team Royaume-Uni."],["LE *CANADA*.","Le Canada."],["L'*AUSTRALIE*.","L'Australie."],["LA *NOUVELLE-ZÉLANDE*.","La Nouvelle-Zélande."],["MÊME ROI : *CHARLES III*.","Même roi : Charles trois."],["MAIS *AUCUN TRAITÉ*","Mais aucun traité"],["NE LES OBLIGE À SE BATTRE.","ne les oblige à se battre."]],
[["ET LES *ÉTATS-UNIS* ?","Et les États-Unis ?"],["ILS *HÉSITENT*.","Ils hésitent."],["*LONDRES*, LEUR MEILLEUR AMI…","Londres, leur meilleur ami…"],["OU LA *FRANCE*,","ou la France,"],["LEUR PREMIER ALLIÉ,","leur premier allié,"],["DEPUIS *1778*.","depuis mille sept cent soixante-dix-huit."]],
[["ET L'*OTAN* ?","Et l'OTAN ?"],["*COUPÉE EN DEUX*.","Coupée en deux."]],
[["ET LA *SUISSE* ?","Et la Suisse ?"],["*NEUTRE*. ELLE REGARDE.","Neutre. Elle regarde."]],
[["RÉSULTAT :","Résultat :"],["*27 PAYS* CONTRE *4*.","vingt-sept pays contre quatre."],["MAIS LE ROYAUME-UNI A","Mais le Royaume-Uni a"],["*2 PORTE-AVIONS*.","deux porte-avions."],["LA FRANCE, *UN SEUL*.","La France, un seul."],["ET CÔTÉ *NUCLÉAIRE* ?","Et côté nucléaire ?"],["LA FRANCE EN A *PLUS*…","La France en a plus…"],["ET DEPUIS *2026*,","et depuis deux mille vingt-six,"],["ELLE NE DIT PLUS *COMBIEN*.","elle ne dit plus combien."]],
[["ALORS, QUELLE ÉQUIPE GAGNE ?","Alors, quelle équipe gagne ?"],["TEAM *FRANCE*","Team France"],["OU TEAM *ROYAUME-UNI* ?","ou Team Royaume-Uni ?"],["DIS-LE EN *COMMENTAIRE*.","Dis-le en commentaire."],["ET *ABONNE-TOI*.","Et abonne-toi."]]
];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
