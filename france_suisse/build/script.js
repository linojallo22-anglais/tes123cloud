// Narration : [sous-titre affiché, texte prononcé]. *mot* = mot-clé surligné.
const SCRIPT = [
[["SI LA *SUISSE*","Si la Suisse"],["ATTAQUAIT LA *FRANCE*…","attaquait la France…"],["QUI VIENDRAIT L'AIDER ?","qui viendrait l'aider ?"],["TEAM *FRANCE*","Team France"],["CONTRE TEAM *SUISSE*.","contre Team Suisse."]],
[["TEAM *SUISSE*.","Team Suisse."],["L'*OTAN* ?","L'OTAN ?"],["ELLE N'EST PAS DEDANS.","Elle n'est pas dedans."],["L'*UNION EUROPÉENNE* ?","L'Union européenne ?"],["NON PLUS.","Non plus."],["*NEUTRE* DEPUIS *1815*.","Neutre depuis mille huit cent quinze."],["*ZÉRO ALLIÉ*.","Zéro allié."]],
[["LE *LIECHTENSTEIN* ?","Le Liechtenstein ?"],["PLUS D'ARMÉE","Plus d'armée"],["DEPUIS *1868*.","depuis mille huit cent soixante-huit."],["LA *GARDE SUISSE* ?","La Garde suisse ?"],["ELLE PROTÈGE LE *PAPE*,","Elle protège le Pape,"],["AU *VATICAN*.","au Vatican."]],
[["MAIS *ATTENTION*.","Mais attention."],["*147 000* SOLDATS.","Cent quarante-sept mille soldats."],["ILS GARDENT LEUR *FUSIL*","Ils gardent leur fusil"],["À LA *MAISON*.","à la maison."],["ET *370 000 BUNKERS* :","Et trois cent soixante-dix mille bunkers :"],["UNE PLACE","une place"],["POUR *CHAQUE HABITANT*.","pour chaque habitant."]],
[["LE *CIEL* ?","Le ciel ?"],["EN *2014*,","En deux mille quatorze,"],["L'AVIATION SUISSE","l'aviation suisse"],["NE TRAVAILLAIT QU'AUX","ne travaillait qu'aux"],["*HEURES DE BUREAU*.","heures de bureau."],["UN AVION *DÉTOURNÉ*","Un avion détourné"],["EST ARRIVÉ À *GENÈVE*…","est arrivé à Genève…"],["ESCORTÉ PAR DES","escorté par des"],["*AVIONS FRANÇAIS*.","avions français."]],
[["TEAM *FRANCE*.","Team France."],["TOUTE L'*OTAN* :","Toute l'OTAN :"],["*32 PAYS*.","trente-deux pays."],["ET TOUTE L'*UNION EUROPÉENNE*.","Et toute l'Union européenne."]],
[["LE *PROBLÈME* ?","Le problème ?"],["CHAQUE JOUR,","Chaque jour,"],["*239 000 FRANÇAIS*","deux cent trente-neuf mille Français"],["PASSENT LA *FRONTIÈRE*","passent la frontière"],["POUR TRAVAILLER EN SUISSE.","pour travailler en Suisse."],["LA SUISSE ATTAQUERAIT…","La Suisse attaquerait…"],["SES PROPRES *SALARIÉS*.","ses propres salariés."]],
[["ET EN *1815*,","Et en mille huit cent quinze,"],["LA *FRANCE* A SIGNÉ","la France a signé"],["LE TRAITÉ QUI *GARANTIT*","le traité qui garantit"],["LA *NEUTRALITÉ SUISSE*.","la neutralité suisse."]],
[["TEAM *FRANCE*","Team France"],["OU TEAM *SUISSE* ?","ou Team Suisse ?"],["DIS-LE EN *COMMENTAIRE*.","Dis-le en commentaire."],["ET *ABONNE-TOI*.","Et abonne-toi."]]
];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
