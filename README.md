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

La capture des réglages Secret Protection et Push protection sera ajoutée après vérification des paramètres du dépôt.
