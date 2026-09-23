import type { L } from "./types";

/**
 * content_blocks: chiave → IT/EN. Modificabili dall'admin (sezione Testi).
 * Se l'EN è vuoto il sito mostra l'IT. I fatti non ancora noti restano segnaposto.
 */
export const content: Record<string, L> = {
  /* home */
  "home.hero.line": {
    it: "Dalla fine degli anni '90, la notte ha un indirizzo.",
    en: "Since the late '90s, the night has an address.",
  },
  "home.club.title": { it: "Scuro, raccolto, discreto.", en: "Dark, intimate, discreet." },
  "home.club.body": {
    it: "Una sala scura, un palco al centro, tavoli da cui si vede tutto e un privé per chi preferisce stare lontano dagli sguardi. Qui la serata si costruisce con calma: si arriva, si ordina, si guarda.",
    en: "A dark room, a stage in the centre, tables with a view of everything and a private room for those who prefer to stay out of sight. Here the night is built slowly: you arrive, you order, you watch.",
  },
  "home.story.excerpt": {
    it: "Da più di venticinque anni, sempre qui. Una storia fatta di notti, non di anniversari.",
    en: "More than twenty-five years, always here. A story made of nights, not anniversaries.",
  },
  "home.gallery.title": { it: "Dalla sala", en: "From the floor" },

  /* home «insegna al neon»: la prima schermata */
  "home.since": { it: "Da oltre 25 anni, la notte è qui.", en: "For over 25 years, the night has lived here." },
  "home.heroCopy": {
    it: "Lap dance e night club a Madone, alle porte di Bergamo. Spettacoli, serate a tema, bar e privè.",
    en: "Lap dance and night club in Madone, just outside Bergamo. Shows, theme nights, bar and private rooms.",
  },

  /* le notti */
  "home.nights.title": { it: "Le nostre notti", en: "Our nights" },
  "home.nights.lead": {
    it: "Siamo aperti solo il giovedì, il venerdì e il sabato, dalle 22 fino a notte fonda.",
    en: "We're open on Thursdays, Fridays and Saturdays only, from 10 pm until late.",
  },
  "home.nights.holidays": {
    it: "Nei giorni di festa apriamo anche in altre sere, e a dicembre siamo aperti più giorni. Le date extra le trovi qui e sul nostro Instagram man mano che si avvicinano.",
    en: "On public holidays we open on other nights too, and in December we're open more days. Extra dates appear here and on our Instagram as they come up.",
  },

  /* serate a tema */
  "home.events.title": { it: "Serate a tema", en: "Theme nights" },
  "home.events.lead": {
    it: "Ogni serata a tema ha il suo dress code: le ragazze cambiano abiti, luci e atmosfera.",
    en: "Every theme night has its own dress code: the girls change outfits, lights and mood.",
  },

  /* il locale, in home */
  "home.club.p1": {
    it: "ZOO Sexy Disco è uno dei locali per adulti e night club più conosciuti della zona. Siamo a Madone, in via Vincenzo Bellini 43, dalla fine degli anni '90.",
    en: "ZOO Sexy Disco is one of the best-known adult venues and night clubs in the area. We've been in Madone, at Via Vincenzo Bellini 43, since the late '90s.",
  },
  "home.club.p2": {
    it: "Spettacoli di ballerine, serate a tema durante tutto l'anno, il bar, i tavoli e il privè. [Qui va la storia del locale, per tappe: da completare con il proprietario.]",
    en: "Dancer shows, theme nights all year round, the bar, tables and private rooms. [The club's story goes here, step by step: to be completed with the owner.]",
  },
  "home.feat.bar.title": { it: "Bar", en: "Bar" },
  "home.feat.bar.body": { it: "Cocktail, superalcolici, champagne e molto altro.", en: "Cocktails, spirits, champagne and much more." },
  "home.feat.shows.title": { it: "Spettacoli", en: "Shows" },
  "home.feat.shows.body": {
    it: "Ballerine sul palco e lap dance, con serate a tema durante l'anno.",
    en: "Dancers on stage and lap dance, with theme nights throughout the year.",
  },
  "home.feat.tables.title": { it: "Tavoli e privè", en: "Tables and private rooms" },
  "home.feat.tables.body": {
    it: "Aree tavoli per il gruppo e spazi privè riservati.",
    en: "Table areas for groups and reserved private rooms.",
  },
  "home.feat.access.title": { it: "Accessibile", en: "Accessible" },
  "home.feat.access.body": {
    it: "Ingressi, parcheggio e servizi igienici accessibili anche in sedia a rotelle.",
    en: "Wheelchair-accessible entrances, parking and restrooms.",
  },

  /* regole della casa */
  "home.rules.title": { it: "Qui dentro nessuno ti fotografa.", en: "In here, nobody takes your picture." },
  "home.rules.photo.title": { it: "Niente foto e video", en: "No photos or videos" },
  "home.rules.photo.body": {
    it: "In sala sono vietati a tutti. È la garanzia della tua riservatezza.",
    en: "They're banned for everyone inside. That's how we guarantee your privacy.",
  },
  "home.rules.age.title": { it: "Solo maggiorenni", en: "Adults only" },
  "home.rules.age.body": {
    it: "L'ingresso è riservato a chi ha compiuto 18 anni.",
    en: "Entry is reserved for people aged 18 and over.",
  },
  "home.rules.respect.title": { it: "Rispetto per le ragazze", en: "Respect for the girls" },
  "home.rules.respect.body": {
    it: "Si guarda, ci si diverte, si rispettano le regole della sala.",
    en: "Watch, have fun, and follow the house rules.",
  },

  /* gallery e lavoro, in home */
  "home.gallery.note": {
    it: "Immagini di esempio: verranno sostituite dalle foto del locale.",
    en: "Example images: they'll be replaced with photos of the club.",
  },
  "home.job.title": { it: "Lavora con noi", en: "Work with us" },
  "home.job.lead": {
    it: "Cerchiamo persone serie per la sala e per il palco. La candidatura è riservata: non finisce mai sul sito.",
    en: "We're looking for reliable people for the floor and the stage. Applications are confidential and never appear on the site.",
  },

  /* il locale */
  "club.intro": {
    it: "ZOO non è un posto dove si passa: è un posto dove si resta. Tre ambienti, un'unica regola: ognuno vive la notte come vuole, nessuno la racconta.",
    en: "ZOO is not a place you pass through: it's a place you stay. Three spaces, one rule: everyone lives the night their way, nobody tells about it.",
  },
  "club.room.sala": {
    it: "La sala: il palco centrale, il bar lungo la parete, luci che cambiano con la serata.",
    en: "The main room: the centre stage, the bar along the wall, lights that change with the night.",
  },
  "club.room.tavoli": {
    it: "I tavoli: rialzati, con servizio al tavolo e la vista migliore sul palco.",
    en: "The tables: raised, with table service and the best view of the stage.",
  },
  "club.room.prive": {
    it: "Il privé: più raccolto, separato dalla sala, pensato per chi cerca riservatezza.",
    en: "The private room: more intimate, set apart from the main room, for those who want discretion.",
  },
  "club.directions": {
    it: "Come arrivare e parcheggio: [da completare].",
    en: "Getting here and parking: [to be completed].",
  },

  /* eventi */
  "events.intro": {
    it: "Ogni sabato ha il suo tema. Qui trovi le prossime serate, il dress code e come prenotare un tavolo.",
    en: "Every Saturday has its theme. Here you'll find upcoming nights, the dress code and how to book a table.",
  },

  /* lavora con noi */
  "work.intro": {
    it: "Cerchiamo persone serie. La candidatura è riservata: la leggono solo i responsabili del locale e non finisce mai sul sito.",
    en: "We're looking for serious people. Applications are confidential: only the club's managers read them, and they never appear on the site.",
  },
  "work.offer": {
    it: "Cosa offriamo: compensi, turni e condizioni [da completare con il proprietario].",
    en: "What we offer: pay, shifts and conditions [to be completed with the owner].",
  },

  /* newsletter */
  "newsletter.title": { it: "Mettiti in lista", en: "Get on the list" },
  "newsletter.gift": {
    it: "Chi si iscrive riceve un regalo di benvenuto da usare alla prima serata: [da completare].",
    en: "Subscribers get a welcome gift to use on their first night: [to be completed].",
  },
  "newsletter.body": {
    it: "Le date delle serate prima di tutti, le promozioni riservate e gli inviti alle notti su lista.",
    en: "Night dates before anyone else, reserved offers and invitations to list-only nights.",
  },

  /* contatti */
  "contacts.intro": {
    it: "Per un tavolo, una festa o un'informazione: scrivici su WhatsApp, chiamaci o usa il modulo.",
    en: "For a table, a party or a question: message us on WhatsApp, call us or use the form.",
  },
};
