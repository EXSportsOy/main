# Legal-Notices
Privacy policy and other important

## Sivuston kieliversioiden tarkistus

Aja repon juuressa:

```sh
node tools/render-feedback.mjs
node tools/generate-sitemap.mjs
node --test tests/i18n/*.test.*
python tests/i18n/site_integrity.py
```

Tarkistukset kattavat kielenvaihdon, ohjeiden kieliversiot, sisäiset linkit ja merkistövirheet. GitHub Actions tarkistaa myös, että palautesivujen staattiset tekstit ja sivukartta ovat ajan tasalla. Selaintestien ohjeet ovat tiedostossa [tests/feedback/README.md](tests/feedback/README.md).

Shodian ja SurveyToolsin englanninkieliset ohjeet säilyttävät alkuperäiset osoitteensa. Muut kieliversiot ovat niiden `<kieli>/`-alikansioissa. Näiden sivujen kielivalitsimessa `data-base`, `data-file` ja `data-root-lang="en"` säilyttävät saman asiakirjan tai laskentamoduulin kieltä vaihdettaessa.
