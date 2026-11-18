// Narration : [sous-titre affiché, texte prononcé]. *mot* = mot-clé surligné.
const SCRIPT = [
[["LA *TOMBE DE NAPOLÉON*","La tombe de Napoléon"],["APPARTIENT À LA *FRANCE*…","appartient à la France…"],["SUR UNE *ÎLE BRITANNIQUE*.","sur une île britannique."]],
[["*SAINTE-HÉLÈNE*.","Sainte-Hélène."],["UNE ÎLE PERDUE","Une île perdue"],["AU MILIEU DE L'*ATLANTIQUE SUD*,","au milieu de l'Atlantique Sud,"],["À *1 900 KM*","à mille neuf cents kilomètres"],["DE L'*AFRIQUE*.","de l'Afrique."]],
[["EN *1815*,","En mille huit cent quinze,"],["APRÈS *WATERLOO*,","après Waterloo,"],["LES *ANGLAIS* Y ENVOIENT","les Anglais y envoient"],["*NAPOLÉON*.","Napoléon."],["LE *PLUS LOIN* POSSIBLE.","Le plus loin possible."]],
[["IL VIT À *LONGWOOD*.","Il vit à Longwood."],["IL Y *MEURT*","Il y meurt"],["LE *5 MAI 1821*.","le cinq mai mille huit cent vingt et un."]],
[["ON L'*ENTERRE*","On l'enterre"],["DANS UNE PETITE *VALLÉE* DE L'ÎLE.","dans une petite vallée de l'île."],["*19 ANS* PLUS TARD,","Dix-neuf ans plus tard,"],["LA FRANCE RAMÈNE SON CORPS","la France ramène son corps"],["À PARIS, AUX *INVALIDES*.","à Paris, aux Invalides."]],
[["MAIS EN *1858*,","Mais en mille huit cent cinquante-huit,"],["*NAPOLÉON III* RACHÈTE","Napoléon trois rachète"],["LA MAISON DE *LONGWOOD*","la maison de Longwood"],["ET LA *VALLÉE DE LA TOMBE*.","et la vallée de la tombe."],["ET EN *1959*,","Et en mille neuf cent cinquante-neuf,"],["UNE *AUSTRALIENNE*","une Australienne"],["OFFRE À LA FRANCE","offre à la France"],["UN *TROISIÈME LIEU* :","un troisième lieu :"],["LE PAVILLON DES *BRIARS*.","le pavillon des Briars."]],
[["RÉSULTAT :","Résultat :"],["SUR UNE ÎLE BRITANNIQUE,","sur une île britannique,"],["LA FRANCE POSSÈDE *3 LIEUX*.","la France possède trois lieux."],["AVEC LE *DRAPEAU FRANÇAIS*.","Avec le drapeau français."],["ET LA TOMBE…","Et la tombe…"],["EST *VIDE*.","est vide."]],
[["POUR Y ALLER,","Pour y aller,"],["IL N'Y AVAIT QUE LE *BATEAU* :","il n'y avait que le bateau :"],["*5 JOURS* DEPUIS LE CAP.","cinq jours depuis Le Cap."],["LE *PREMIER VOL* COMMERCIAL","Le premier vol commercial"],["N'EST ARRIVÉ QU'EN *2017*.","n'est arrivé qu'en deux mille dix-sept."]],
[["TU LE *SAVAIS* ?","Tu le savais ?"],["DIS-LE EN *COMMENTAIRE*.","Dis-le en commentaire."],["ET *ABONNE-TOI*.","Et abonne-toi."]]
];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
