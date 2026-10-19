// Narration : [sous-titre affiché, texte prononcé]. *mot* = mot-clé surligné.
const SCRIPT = [
[["SI LA *FRANCE*","Si la France"],["ATTAQUAIT L'*ALGÉRIE*…","attaquait l'Algérie…"],["QUI VIENDRAIT L'AIDER ?","qui viendrait l'aider ?"],["TEAM *FRANCE*","Team France"],["CONTRE TEAM *ALGÉRIE*.","contre Team Algérie."]],
[["TEAM *FRANCE*.","Team France."],["L'*OTAN* ?","L'OTAN ?"],["*32 PAYS*.","Trente-deux pays."],["MAIS L'OTAN PROTÈGE","Mais l'OTAN protège"],["CELUI QU'ON *ATTAQUE*.","celui qu'on attaque."],["PAS CELUI QUI *ATTAQUE*.","Pas celui qui attaque."],["*PERSONNE* NE BOUGE.","Personne ne bouge."]],
[["L'*EUROPE* ?","L'Europe ?"],["PAREIL. *PERSONNE*.","Pareil. Personne."]],
[["L'*ITALIE* ?","L'Italie ?"],["*1/3* DE SON GAZ","Un tiers de son gaz"],["VIENT D'*ALGÉRIE*.","vient d'Algérie."],["ELLE RESTE CHEZ ELLE.","Elle reste chez elle."]],
[["RÉSULTAT :","Résultat :"],["LA FRANCE…","la France…"],["*TOUTE SEULE*.","toute seule."]],
[["TEAM *ALGÉRIE*.","Team Algérie."],["L'*UNION AFRICAINE* :","L'Union africaine :"],["UN *PACTE DE DÉFENSE*","un pacte de défense"],["COMMUNE.","commune."],["LA *LIGUE ARABE* :","La Ligue arabe :"],["*22 PAYS*.","vingt-deux pays."],["LA *RUSSIE* :","La Russie :"],["SON PREMIER *VENDEUR D'ARMES*.","son premier vendeur d'armes."],["LA *CHINE* :","La Chine :"],["PARTENAIRE STRATÉGIQUE.","partenaire stratégique."],["AMIES… MAIS *SANS TRAITÉ*.","Amies… mais sans traité."]],
[["LE *CIEL* ?","Le ciel ?"],["EN *2021*,","En deux mille vingt et un,"],["L'ALGÉRIE L'A *FERMÉ*","l'Algérie l'a fermé"],["AUX AVIONS MILITAIRES FRANÇAIS.","aux avions militaires français."]],
[["MAIS LA FRANCE A","Mais la France a"],["UN BUDGET MILITAIRE","un budget militaire"],["*DEUX FOIS* PLUS GROS.","deux fois plus gros."],["ET LA *BOMBE NUCLÉAIRE*.","Et la bombe nucléaire."]],
[["LE PLUS *FOU* ?","Le plus fou ?"],["EN *1949*,","En mille neuf cent quarante-neuf,"],["L'ALGÉRIE ÉTAIT","l'Algérie était"],["DANS LE *TRAITÉ DE L'OTAN*.","dans le traité de l'OTAN."],["*PROTÉGÉE* PAR L'OTAN.","Protégée par l'OTAN."]],
[["TEAM *FRANCE*","Team France"],["OU TEAM *ALGÉRIE* ?","ou Team Algérie ?"],["DIS-LE EN *COMMENTAIRE*.","Dis-le en commentaire."],["ET *ABONNE-TOI*.","Et abonne-toi."]]
];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
