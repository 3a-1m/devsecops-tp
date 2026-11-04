# devsecops-tp

API Express utilisée pour le TP de sécurisation CI/CD.

## Développement local

```bash
npm ci
npm test
npm start
```

L’API écoute sur le port `3000` par défaut. Le fichier `.env.example` ne contient aucun secret.

## Secrets et réponse à une fuite

Une clé AWS poussée dans Git doit être considérée comme compromise, même si elle a été supprimée dans un commit ultérieur : elle reste dans l’historique et a pu être copiée.

Dans l’ordre :

1. Révoquer immédiatement la clé dans AWS IAM.
2. Vérifier son utilisation dans CloudTrail et rechercher toute activité ou dépense suspecte.
3. Remplacer la clé si elle est encore nécessaire, avec les droits minimums, et la stocker dans un gestionnaire de secrets. Pour la CI, préférer OIDC quand c’est possible.
4. Purger la clé de l’historique Git, des branches et des tags, puis prévenir les collaborateurs que l’historique a été réécrit. Cette purge ne remplace jamais la révocation.
5. Activer la détection et le blocage des secrets pour éviter une nouvelle fuite.

## Protection des secrets GitHub

Secret scanning et push protection sont activés dans les paramètres du dépôt.
<img width="579" height="275" alt="Capture d’écran des réglages de protection des secrets" src="https://github.com/user-attachments/assets/b77c08c8-71ea-484c-8bc4-21fdd5fc8912" />

## Failles corrigées

Ces URL illustrent les failles présentes dans la version de départ. Elles ne doivent être utilisées que comme exemples : le serveur vulnérable ne doit jamais être exposé à Internet.

| Route | Faille | URL d’exploitation sur la version initiale | Correction |
|---|---|---|---|
| `/hello` | XSS réfléchie : le nom fourni est inséré sans échappement dans une page HTML. | `http://localhost:3000/hello?name=%3Cscript%3Ealert(1)%3C%2Fscript%3E` | Échapper les caractères spéciaux HTML avant l’affichage. |
| `/ping` | Injection de commande : `exec` interprète l’entrée utilisateur dans un shell. | `http://localhost:3000/ping?host=google.com%3Bcat%20%2Fetc%2Fpasswd` | Valider strictement l’hôte et appeler `execFile` avec des arguments séparés. |
| `/prefs` | Prototype pollution : `_.merge` fusionne récursivement les paramètres non fiables. | `http://localhost:3000/prefs?__proto__%5Badmin%5D=true` | Construire la réponse uniquement à partir des clés `theme` et `lang`. |

Les tests de régression correspondants sont dans `tests/security.test.js`.

### Alertes CodeQL sur la version initiale

Le premier scan du commit `9273752` a relevé ces alertes sur `main` :

| Règle | Fichier et ligne initiale | Gravité | Traitement |
|---|---|---|---|
| `js/reflected-xss` | `src/app.js:12` | Haute | Échappement HTML ajouté sur `/hello`. |
| `js/command-line-injection` | `src/app.js:17` | Critique | Validation de l’hôte et `execFile` sur `/ping`. |
| `js/missing-rate-limiting` | `src/app.js:16` | Haute | Limiteur ajouté sur `/ping` : 10 requêtes par minute. |

La prototype pollution de `/prefs` a été trouvée en lisant le code : CodeQL ne l’a pas signalée. La route ne fusionne désormais plus les paramètres avec `_.merge` et ne renvoie que `theme` et `lang`.
