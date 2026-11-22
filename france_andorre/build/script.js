// Narration : [sous-titre affiché, texte prononcé]. *mot* = mot-clé surligné.
const SCRIPT = [
[["SI LA *FRANCE*","Si la France"],["ATTAQUAIT *ANDORRE*…","attaquait Andorre…"],["QUI VIENDRAIT L'AIDER ?","qui viendrait l'aider ?"],["TEAM *FRANCE*","Team France"],["CONTRE TEAM *ANDORRE*.","contre Team Andorre."]],
[["LE *PROBLÈME* ?","Le problème ?"],["L'UN DES *DEUX CHEFS* D'ANDORRE…","L'un des deux chefs d'Andorre…"],["C'EST LE *PRÉSIDENT*","c'est le président"],["DE LA *RÉPUBLIQUE FRANÇAISE*.","de la République française."],["DEPUIS *1607*,","Depuis mille six cent sept,"],["LE CHEF DE L'ÉTAT FRANÇAIS","le chef de l'État français"],["EST *COPRINCE* D'ANDORRE.","est coprince d'Andorre."],["LA FRANCE ATTAQUERAIT…","La France attaquerait…"],["SON *PROPRE PRÉSIDENT*.","son propre président."]],
[["TEAM *ANDORRE*.","Team Andorre."],["SON *ARMÉE* ?","Son armée ?"],["IL N'Y EN A *PAS*.","Il n'y en a pas."],["*331 POLICIERS*.","Trois cent trente et un policiers."],["*89 000 HABITANTS*.","Quatre-vingt-neuf mille habitants."],["PAS MÊME SA PROPRE *MONNAIE* :","Pas même sa propre monnaie :"],["ELLE UTILISE L'*EURO*.","elle utilise l'euro."]],
[["SA *DÉFENSE* ?","Sa défense ?"],["ELLE EST CONFIÉE À LA *FRANCE*…","Elle est confiée à la France…"],["ET À L'*ESPAGNE*.","et à l'Espagne."],["DONC L'ESPAGNE DEVRAIT","Donc l'Espagne devrait"],["*DÉFENDRE* ANDORRE","défendre Andorre"],["CONTRE LA *FRANCE*.","contre la France."],["DEUX PAYS DE L'*OTAN*.","Deux pays de l'OTAN."]],
[["LE *DEUXIÈME COPRINCE* ?","Le deuxième coprince ?"],["UN *ÉVÊQUE* ESPAGNOL :","Un évêque espagnol :"],["L'ÉVÊQUE D'*URGELL*.","l'évêque d'Urgell."],["TEAM ANDORRE A DONC…","Team Andorre a donc…"],["UN *ÉVÊQUE*.","un évêque."]],
[["LA *TAILLE* ?","La taille ?"],["*468 KM²*.","Quatre cent soixante-huit kilomètres carrés."],["*4,5 FOIS PARIS*.","Quatre fois et demie Paris."]],
[["LA *FRONTIÈRE* AVEC LA FRANCE ?","La frontière avec la France ?"],["*57 KM*.","Cinquante-sept kilomètres."],["ET CHAQUE ANNÉE,","Et chaque année,"],["PLUS DE *9 MILLIONS* DE VISITEURS","plus de neuf millions de visiteurs"],["VIENNENT Y FAIRE LEURS *COURSES*.","viennent y faire leurs courses."]],
[["*RÉSULTAT* :","Résultat :"],["UNE *GUERRE*…","une guerre…"],["CONTRE UN PAYS DIRIGÉ…","contre un pays dirigé…"],["PAR LE *PRÉSIDENT FRANÇAIS*.","par le président français."]],
[["TEAM *FRANCE*","Team France"],["OU TEAM *ANDORRE* ?","ou Team Andorre ?"],["DIS-LE EN *COMMENTAIRE*.","Dis-le en commentaire."],["ET *ABONNE-TOI*.","Et abonne-toi."]]
];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
