# Performantie testen

Om de performantie van de Webcomponenten te garanderen, word er gebruik gemaakt van [Sitespeed](http://www.sitespeed.io).

Via het script `generate.js` word er een HTML-pagina aangemaakt waar de eerste component van de demo-pagina x-aantal keer word gerenderd. Deze pagina, `performance.html` word gebruikt voor de performantie-testen.

`run.js`start de performantie-testen. Aanvullend word er gecontroleerd op welk platform de testen zullen draaien. Indien het platform Linux is, zal docker de netwerk-modus "host" gebruiken.

De configuratie van de performantie-testen is terug te vinden in de `config`-folder.
Alle mogelijke configuratie opties kan je [hier](https://github.com/milieuinfo/webcomponent-vl-ui-button/pull/105) terug vinden. Er is een onderscheid tussen de configuratie voor Bamboo en de configuratie om lokaal te runnen. Het betreft hier een ander pad naar de configuratie bestanden omdat de mounts bij `docker run`net iets anders zijn dan bij `docker-compose`.

In `budget.json`worden de tresholds gedefiniëerd qua timings en scores. Indien een bepaalde timing/score boven de gedefiniëerde waarde uitkomt, zullen de testen een exit code gooien die verschillend is van 0.
