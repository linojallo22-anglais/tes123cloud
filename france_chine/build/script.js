// Narration : [sous-titre affiché, texte prononcé]. *mot* = mot-clé surligné.
const SCRIPT = [
[["SI LA *CHINE*","Si la Chine"],["ATTAQUAIT LA *FRANCE*…","attaquait la France…"],["QUI VIENDRAIT L'AIDER ?","qui viendrait l'aider ?"],["TEAM *FRANCE*","Team France"],["CONTRE TEAM *CHINE*.","contre Team Chine."]],
[["LA CHINE NE VISERAIT","La Chine ne viserait"],["PAS *PARIS*.","pas Paris."],["ELLE VISERAIT","Elle viserait"],["LA *NOUVELLE-CALÉDONIE*","la Nouvelle-Calédonie"],["ET LA *POLYNÉSIE FRANÇAISE*,","et la Polynésie française,"],["EN PLEIN *PACIFIQUE*.","en plein Pacifique."],["À L'AUTRE BOUT DU MONDE.","À l'autre bout du monde."]],
[["TEAM *FRANCE*.","Team France."],["L'*OTAN* ?","L'OTAN ?"],["*32 PAYS*.","Trente-deux pays."],["MAIS LE TRAITÉ","Mais le traité"],["NE PROTÈGE QUE L'*EUROPE*,","ne protège que l'Europe,"],["L'*AMÉRIQUE DU NORD*","l'Amérique du Nord"],["ET L'*ATLANTIQUE NORD*.","et l'Atlantique Nord."],["LE *PACIFIQUE*…","Le Pacifique…"],["N'EST *PAS COUVERT*.","n'est pas couvert."]],
[["L'*UNION EUROPÉENNE* ?","L'Union européenne ?"],["LA NOUVELLE-CALÉDONIE","La Nouvelle-Calédonie"],["NE FAIT *PAS PARTIE*","ne fait pas partie"],["DE SON TERRITOIRE.","de son territoire."]],
[["TEAM *CHINE*.","Team Chine."],["UN *SEUL ALLIÉ* PAR TRAITÉ :","Un seul allié par traité :"],["LA *CORÉE DU NORD*.","la Corée du Nord."]],
[["LA *MARINE CHINOISE* ?","La marine chinoise ?"],["LA *PLUS GRANDE* DU MONDE :","La plus grande du monde :"],["PLUS DE *370 NAVIRES*","plus de trois cent soixante-dix navires"],["DE COMBAT.","de combat."],["SES OGIVES *NUCLÉAIRES* ?","Ses ogives nucléaires ?"],["ENVIRON *620*.","Environ six cent vingt."],["LA *FRANCE* ?","La France ?"],["ENVIRON *290*.","Environ deux cent quatre-vingt-dix."]],
[["*PARIS–NOUMÉA* :","Paris–Nouméa :"],["PRÈS DE *17 000 KM*.","près de dix-sept mille kilomètres."],["*PÉKIN–NOUMÉA* :","Pékin–Nouméa :"],["*DEUX FOIS MOINS*.","deux fois moins."]],
[["MAIS LA FRANCE A DÉJÀ","Mais la France a déjà"],["DES *SOLDATS SUR PLACE*.","des soldats sur place."],["ET SOUS LA NOUVELLE-CALÉDONIE,","Et sous la Nouvelle-Calédonie,"],["L'UN DES PLUS GROS","l'un des plus gros"],["GISEMENTS DE *NICKEL*","gisements de nickel"],["DE LA PLANÈTE.","de la planète."]],
[["TEAM *FRANCE*","Team France"],["OU TEAM *CHINE* ?","ou Team Chine ?"],["DIS-LE EN *COMMENTAIRE*.","Dis-le en commentaire."],["ET *ABONNE-TOI*.","Et abonne-toi."]]
];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
