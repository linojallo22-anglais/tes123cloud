// Narration : [sous-titre affiché, texte prononcé]. *mot* = mot-clé surligné.
const SCRIPT = [
[["LE PAYS QUI A","Le pays qui a"],["LE PLUS DE *FUSEAUX HORAIRES*","le plus de fuseaux horaires"],["AU MONDE ?","au monde ?"],["CE N'EST PAS LA *RUSSIE*.","Ce n'est pas la Russie."],["CE N'EST PAS LES *ÉTATS-UNIS*.","Ce n'est pas les États-Unis."],["C'EST LA *FRANCE*.","C'est la France."],["*12*.","Douze."]],
[["QUAND IL EST *MIDI* À PARIS,","Quand il est midi à Paris,"],["IL EST *23 H*","il est onze heures du soir"],["À *WALLIS-ET-FUTUNA*.","à Wallis-et-Futuna."],["ET *1 H DU MATIN*","Et une heure du matin"],["À *TAHITI*.","à Tahiti."]],
[["POURQUOI ?","Pourquoi ?"],["L'*OUTRE-MER*.","L'outre-mer."]],
[["LA *GUADELOUPE*","La Guadeloupe"],["ET LA *MARTINIQUE* :","et la Martinique :"],["*5 H* DE MOINS.","cinq heures de moins."],["LA *GUYANE*","La Guyane"],["ET *SAINT-PIERRE-ET-MIQUELON* :","et Saint-Pierre-et-Miquelon :"],["*4 H* DE MOINS.","quatre heures de moins."],["*MAYOTTE* :","Mayotte :"],["*2 H* DE PLUS.","deux heures de plus."],["LA *RÉUNION* : *3*.","La Réunion : trois."],["LA *NOUVELLE-CALÉDONIE* : *10*.","La Nouvelle-Calédonie : dix."],["*WALLIS-ET-FUTUNA* : *11*.","Wallis-et-Futuna : onze."],["ET LA *POLYNÉSIE* :","Et la Polynésie :"],["*3 FUSEAUX*","trois fuseaux"],["À ELLE SEULE.","à elle seule."]],
[["LA *RUSSIE* ?","La Russie ?"],["*11* FUSEAUX.","Onze fuseaux."],["LES *ÉTATS-UNIS* ?","Les États-Unis ?"],["*11* AUSSI.","Onze aussi."]],
[["ENTRE *TAHITI* ET *WALLIS* :","Entre Tahiti et Wallis :"],["*22 H* DE DÉCALAGE.","vingt-deux heures de décalage."],["DANS LE *MÊME PAYS*.","Dans le même pays."]],
[["RÉSULTAT :","Résultat :"],["LE *SOLEIL* NE SE COUCHE","le soleil ne se couche"],["*JAMAIS* SUR LA FRANCE.","jamais sur la France."],["ET LE *NOUVEL AN*,","Et le Nouvel An,"],["LA FRANCE LE FÊTE","la France le fête"],["PENDANT *22 HEURES*.","pendant vingt-deux heures."],["D'ABORD À *WALLIS*.","D'abord à Wallis."],["EN DERNIER À *TAHITI*.","En dernier à Tahiti."]],
[["ET AVEC LA *TERRE ADÉLIE*,","Et avec la Terre Adélie,"],["EN *ANTARCTIQUE*…","en Antarctique…"],["*13 FUSEAUX*.","treize fuseaux."]],
[["TU LE *SAVAIS* ?","Tu le savais ?"],["DIS-LE EN *COMMENTAIRE*.","Dis-le en commentaire."],["ET *ABONNE-TOI*.","Et abonne-toi."]]
];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
