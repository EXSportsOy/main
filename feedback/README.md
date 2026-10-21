# Palauteosio (`/feedback/`)

Monikielinen palauteosio EXSports-sivustolle. Korvaa vanhan Google Forms ‑pohjaisen "report a bug" ‑ratkaisun. Palaute tallentuu **Firebase Firestoreen** (projekti `exsports-verkkosivut`, sijainti `europe-north1`) ja uudesta palautteesta lähtee **sähköposti-ilmoitus** Cloud Functionista. Toteutus on staattista HTML/CSS/JS:ää sivuston omalla tyylillä (`/styles.css`, Geist, Pine Mist) ja käyttää sivuston i18n-kielivalitsinta.

## Rakenne

```
feedback/
  index.html              Kielivalitsin (ohjaa /feedback/<kieli>/ — kuten /legal/)
  <kieli>/index.html      Palautesivu kullekin 15 kielelle (en, fi, sv, no, da, de,
                          nl, fr, es, it, pt, pl, et, lv, lt)
  feedback.css            Tyylit (rakentuu /styles.css-tokenien päälle)
  feedback-i18n.js        Kaikkien kielten tekstit yhdessä sanakirjassa
  feedback.js             Logiikka: i18n, näkymät, validointi, Firestore-tallennus
  feedback-config.js      Firebase-web-config + App Check -avain (julkisia)
  supabase/               Vanha toteutus; poistetaan, kun siirtymäaika päättyy
firebase/
  firebase.json, .firebaserc        Firebase CLI:n asetukset (aja komennot tässä kansiossa)
  firestore.rules                   Tietoturvasäännöt: selain saa vain luoda palautteen
  firestore.indexes.json            Indeksit (oletusindeksit riittävät)
  functions/                        Cloud Function notifyFeedback: sähköposti-ilmoitus
  migration/import-supabase.mjs     Kertaluonteinen siirto Supabasesta
```

## Käyttäjäpolku

1. **Verkkosivupalaute** tai **Sovelluspalaute**.
2. Sovelluspalaute → valitse **SurveyTools / Heda / Shodia** → **Nopea palaute** (vapaa teksti + tähtiarvio) tai **Bugiraportti** (otsikko, vakavuus, toistamisvaiheet, odotettu/tapahtui, ympäristö).
3. Onnistumisnäkymä.

Ei-englanninkielisillä sivuilla näkyy konekäännösilmoitus (englanti on virallinen versio) — sama linja kuin sivuston muilla käännetyillä sivuilla.

## Käyttöönotto

Vaatii Firebase CLI:n (`npm i -g firebase-tools`) ja kirjautumisen (`firebase login`). Projekti on Blaze-tasolla, koska Cloud Functions ja Secret Manager vaativat sen; aseta projektille budjettihälytys.

### 1. Web-sovellus ja avaimet
Firebase Console → **Project settings → Your apps → Web** → kopioi `apiKey`, `authDomain`, `projectId` ja `appId` tiedostoon `feedback/feedback-config.js`. Web-config on tarkoitettu julkiseksi; **älä** lisää palvelutilin avaimia. Rajaa API-avain Google Cloud Consolessa (APIs & Services → Credentials) HTTP-viittaajiin `https://www.exsports.fi/*`.

### 2. Säännöt ja indeksit
```bash
cd firebase
firebase deploy --only firestore:rules,firestore:indexes
```

### 3. Sähköposti-ilmoitukset (Proton Mail SMTP)
Funktio lähettää postin Proton Mailin SMTP submission -ominaisuudella (vaatii Proton for Business -tason).

1. Proton: **Settings → IMAP/SMTP → SMTP submission → Generate token** osoitteelle `info@exsports.fi`.
2. Tallenna token Secret Manageriin ja julkaise funktio:
   ```bash
   cd firebase
   firebase functions:secrets:set SMTP_PASSWORD
   firebase deploy --only functions
   ```
   `SMTP_USERNAME`, `NOTIFY_EMAIL_TO` ja `NOTIFY_EMAIL_FROM` ovat tiedostossa `firebase/functions/.env` (kaikki `info@exsports.fi`); muuta niitä siellä (useampi vastaanottaja pilkulla eroteltuna).
3. Testaa: lähetä palaute sivulta ja tarkista, että viesti saapuu. Virheet näkyvät Firebase Console → Functions → Logs.

### 4. App Check (suositeltu)
Firebase Console → **App Check** → rekisteröi web-sovellus **reCAPTCHA Enterprise** -tarjoajalla ja kopioi site key kenttään `APP_CHECK_SITE_KEY`. Pidä Firestore ensin valvontatilassa (*Monitor*) ja ota pakotus (*Enforce*) käyttöön, kun mittarit näyttävät oikeiden lähetysten läpäisevän tarkistuksen. Pakotuksen voi perua konsolista ilman koodimuutosta.

### 5. Vanhan datan siirto
Katso ohjeet tiedoston `firebase/migration/import-supabase.mjs` alusta. Siirto on toistettavissa: dokumentin ID on Supabasen uuid, olemassa olevat dokumentit ohitetaan, ja siirretyistä riveistä ei lähde sähköpostia (`source: "supabase-import"`). Vientitiedostoa (sisältää sähköpostiosoitteita) ei lisätä repoon.

### 6. Vanhat report-bug-sivut
Kaikki 17 vanhaa `report-bug.html`-sivua (`legal/<kieli>/`, `heda/legal/`, `surveytools/legal/`) ohjaavat automaattisesti uuteen osioon oikealla sovelluksella ja buginäkymällä esivalittuna. Sivut on merkitty `noindex`, joten hakukoneet siirtyvät uuteen osioon.

### 7. Sivukartta
`node tools/generate-sitemap.mjs` repon juuressa päivittää sivukartan, myös palautesivujen kaikki kieliversiot. Vanhat `noindex`-uudelleenohjaukset jätetään pois.

## Palautteiden käsittely
Firebase Console → **Firestore Database → feedback**. Käsittelyn tila päivitetään kenttään `status` (`new` / `in_progress` / `resolved` / `wontfix`). Konsoli ohittaa tietoturvasäännöt; selaimesta palautteita ei voi lukea eikä muokata.

## Lokalisointi
Kaikki lomakkeen käännettävät tekstit ovat `feedback-i18n.js`-sanakirjassa. Muokkaa sanakirjaa ja aja repon juuressa `node tools/render-feedback.mjs`, jotta myös HTML-sivujen alkuperäinen sisältö, paikkamerkkitekstit ja saavutettavuusnimet päivittyvät. Selain käyttää samaa sanakirjaa. Käännösilmoitus näkyy muissa kielissä kuin englannissa. Sivujen rakenne on yhteinen, mutta sisältö ja etusivulinkit ovat kielikohtaisia.

## Tietomalli (`feedback`-kokoelma)
`category` (website / program_general / program_bug), `app` (website / surveytools / heda / shodia), `lang`, `message`, `rating`, `email`, bugikentät (`bug_title`, `severity`, `steps`, `expected`, `actual`, `environment`), `page_url`, `user_agent`, `status` (käsittelyn seurantaan) ja `created_at` (palvelimen aikaleima). Tyhjiä valinnaisia kenttiä ei tallenneta. Supabasesta siirretyissä dokumenteissa on lisäksi `source: "supabase-import"`. Kenttien sallitut arvot ja enimmäispituudet on määritelty tiedostossa `firebase/firestore.rules`.

## Kustannukset
Palautemäärillä kaikki pysyy Firestoren ja Cloud Functionsin ilmaiskiintiöiden sisällä; funktion konttikuvan tallennus voi maksaa muutaman sentin kuukaudessa. Firestore ei tauota projektia käyttämättömyyden vuoksi. Sähköposti lähtee omasta Proton-postista.

## Testit
Palautetoiminnon regressiotestit (`.github/workflows/feedback-tests.yml`) ajetaan palautekoodin muutoksista, onnistuneen GitHub Pages -julkaisun jälkeen sekä päivittäin klo 06:17 UTC. Selaintestit tarkistavat lomakkeen toiminnan ja lähetyssisällöt, sääntötestit ajetaan Firestore-emulaattorissa ja tuotantotesti varmistaa, että julkaistu config on kunnossa ja että tuotanto hylkää luvun ja virheelliset lähetykset. Katso ajokomennot ja testauksen rajat tiedostosta [tests/feedback/README.md](../tests/feedback/README.md).

## Roskapostisuoja
Piilotettu hunajapurkkikenttä (botit täyttävät → hylätään hiljaa), tietoturvasäännöt (vain tunnetut kentät ja pituusrajat) sekä App Check.
